import { processing } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { sha256 } from "js-sha256";
import { DriveFileInput, ProcessingData } from "@/types/types";
import { exportDocxToMarkdown } from "@/lib/drive";
import { db } from "@/db/schema";
import {
  ApiError,
  checkDuplicates,
  createProcessingData,
  callInternalApi,
  updateProcessingStatus,
  successResponse,
  duplicateResponse,
} from "@/lib/upload-helpers";

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return ApiError.unauthorized();
  }

  const processingId = crypto.randomUUID();

  try {
    const processingData = await prepareProcessingData(request, orgId);

    if (!processingData) {
      return ApiError.badRequest("invalid request data");
    }

    if (processingData.isDuplicate) {
      return duplicateResponse(
        processingData.documentId!,
        processingData.reason!,
      );
    }

    await createProcessingEntry({
      id: processingId,
      orgId,
      userId,
      ...processingData.data!,
    });

    const processResponse = await callInternalApi(
      "/api/upload/process",
      { processingId },
      request,
    );

    if (!processResponse.ok) {
      throw new Error(`processing failed: ${await processResponse.text()}`);
    }

    const result = await processResponse.json();

    return successResponse({
      processingId,
      documentId: result.data.documentId,
      message: "file processed successfully",
    });
  } catch (error) {
    console.error("file upload error:", error);

    await updateProcessingStatus(processingId, "failed", error);

    return ApiError.serverError(`upload failed: ${error}`);
  }
}

async function prepareProcessingData(
  request: Request,
  orgId: string,
): Promise<{
  isDuplicate?: boolean;
  documentId?: string;
  reason?: string;
  data?: ProcessingData;
}> {
  const contentType = request.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return handleDriveFile(request, orgId);
  } else {
    return handleFileUpload(request);
  }
}

async function handleDriveFile(request: Request, orgId: string): Promise<any> {
  const driveInput: DriveFileInput = await request.json();

  const fileCheck = await checkDuplicates(driveInput.fileHash);
  if (fileCheck.isDuplicate) {
    return {
      isDuplicate: true,
      documentId: fileCheck.docId,
      reason: fileCheck.reason,
    };
  }

  let fullContent: string;
  try {
    fullContent = await exportDocxToMarkdown(driveInput.driveFileId, orgId);
  } catch (error) {
    throw new Error("failed to export docx to markdown");
  }

  const contentHash = sha256(fullContent);

  const contentCheck = await checkDuplicates(driveInput.fileHash, contentHash);
  if (contentCheck.isDuplicate) {
    return {
      isDuplicate: true,
      documentId: contentCheck.docId,
      reason: contentCheck.reason,
    };
  }

  const data = createProcessingData(
    {
      title: driveInput.filename,
      sourceUrl: `https://drive.google.com/file/d/${driveInput.driveFileId}`,
      filePath: `${driveInput.folderPath}/${driveInput.filename}`,
      docType: "drive_document",
      effectiveDate: new Date(driveInput.modifiedTime),
      lastUpdated: new Date(driveInput.modifiedTime),
      content: fullContent,
      documentMetadata: {
        driveFileId: driveInput.driveFileId,
        originalMimeType: driveInput.mimeType,
        folderPath: driveInput.folderPath,
      },
      processingMetadata: {
        source: "google_drive",
        downloadedAt: new Date().toISOString(),
        contentLength: fullContent.length,
      },
      driveFileId: driveInput.driveFileId,
      driveModifiedTime: new Date(driveInput.modifiedTime),
    },
    { fileHash: driveInput.fileHash, contentHash },
  );

  return { data };
}

async function handleFileUpload(request: Request): Promise<any> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    throw new Error("no file provided");
  }

  const text = await file.text();
  let rawDoc;

  try {
    rawDoc = JSON.parse(text);
  } catch (error) {
    throw new Error("invalid json file");
  }

  const fileBuffer = await file.arrayBuffer();
  const fileHash = sha256(new Uint8Array(fileBuffer));
  const contentHash = sha256(text);

  const dupCheck = await checkDuplicates(fileHash, contentHash);
  if (dupCheck.isDuplicate) {
    return {
      isDuplicate: true,
      documentId: dupCheck.docId,
      reason: dupCheck.reason,
    };
  }

  const data = createProcessingData(
    {
      title: rawDoc.title || file.name.replace(/\.[^/.]+$/, ""),
      sourceUrl: rawDoc.sourceUrl || "",
      filePath: rawDoc.filePath || file.name,
      docType: rawDoc.docType || "uploaded",
      effectiveDate: rawDoc.effectiveDate
        ? new Date(rawDoc.effectiveDate)
        : new Date(),
      lastUpdated: rawDoc.lastUpdated
        ? new Date(rawDoc.lastUpdated)
        : new Date(),
      content: rawDoc.text || rawDoc.content || "",
      documentMetadata: rawDoc.metadata || {},
      processingMetadata: {
        originalFilename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        source: "direct_upload",
      },
    },
    { fileHash, contentHash },
  );

  return { data };
}

async function createProcessingEntry(data: any) {
  await db.insert(processing).values({
    ...data,
    status: "converted",
  });
}
