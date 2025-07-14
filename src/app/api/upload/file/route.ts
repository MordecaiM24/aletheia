import { processing, documents } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { sha256 } from "js-sha256";
import { DriveFileInput, ProcessingData } from "@/types/types";
import { exportDocxToMarkdown } from "@/lib/drive";

export async function POST(request: Request) {
  const db = drizzle(process.env.DATABASE_URL!);
  const { userId, orgId } = await auth();

  console.log("[file] user:", { userId, orgId });

  if (!userId || !orgId) {
    return new Response("unauthorized", { status: 401 });
  }

  const processingId = crypto.randomUUID();

  try {
    let processingData: ProcessingData;
    const contentType = request.headers.get("content-type");

    // handle drive file input (JSON)
    if (contentType?.includes("application/json")) {
      const driveInput: DriveFileInput = await request.json();
      console.log("[file] file name:", driveInput.filename);

      // check for duplicate by file hash first
      const existingDoc = await db
        .select()
        .from(documents)
        .where(eq(documents.fileHash, driveInput.fileHash))
        .limit(1);

      if (existingDoc.length > 0) {
        console.log("[file] duplicate file hash:", driveInput.fileHash);
        return Response.json({
          success: true,
          skipped: true,
          reason: "duplicate file hash",
          documentId: existingDoc[0].id,
        });
      }

      // download content from drive
      const fullContent = await exportDocxToMarkdown(driveInput.driveFileId);
      const contentHash = sha256(fullContent);

      // check for content duplicates
      const existingContent = await db
        .select()
        .from(documents)
        .where(eq(documents.contentHash, contentHash))
        .limit(1);

      if (existingContent.length > 0) {
        console.log("[file] duplicate content:", contentHash);
        return Response.json({
          success: true,
          skipped: true,
          reason: "duplicate content",
          documentId: existingContent[0].id,
        });
      }

      // use first 1000 chars for testing
      const testContent = fullContent.substring(0, 1000);

      processingData = {
        title: driveInput.filename,
        sourceUrl: `https://drive.google.com/file/d/${driveInput.driveFileId}`,
        filePath: `${driveInput.folderPath}/${driveInput.filename}`,
        docType: "drive_document",
        effectiveDate: new Date(driveInput.modifiedTime),
        lastUpdated: new Date(driveInput.modifiedTime),
        content: testContent,
        documentMetadata: {
          driveFileId: driveInput.driveFileId,
          originalMimeType: driveInput.mimeType,
          folderPath: driveInput.folderPath,
        },
        processingMetadata: {
          source: "google_drive",
          downloadedAt: new Date().toISOString(),
          contentLength: fullContent.length,
          testContentLength: testContent.length,
        },
        fileHash: driveInput.fileHash,
        contentHash,
        driveFileId: driveInput.driveFileId,
        driveModifiedTime: new Date(driveInput.modifiedTime),
      };
    } else {
      // handle form file upload
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof Blob)) {
        return new Response("no file", { status: 400 });
      }

      const text = await file.text();
      let rawDoc;

      try {
        rawDoc = JSON.parse(text);
      } catch (error) {
        return new Response("invalid json file", { status: 400 });
      }

      const fileBuffer = await file.arrayBuffer();
      const fileHash = sha256(new Uint8Array(fileBuffer));
      const contentHash = sha256(text);

      // check for duplicates
      const existingDoc = await db
        .select()
        .from(documents)
        .where(eq(documents.fileHash, fileHash))
        .limit(1);

      if (existingDoc.length > 0) {
        console.log("[file] duplicate file:", fileHash);
        return Response.json({
          success: true,
          skipped: true,
          reason: "duplicate file",
          documentId: existingDoc[0].id,
        });
      }

      processingData = {
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
        fileHash,
        contentHash,
      };
    }

    // create processing entry
    await db.insert(processing).values({
      id: processingId,
      orgId: orgId,
      userId: userId,
      status: "converted",
      title: processingData.title,
      sourceUrl: processingData.sourceUrl,
      filePath: processingData.filePath,
      docType: processingData.docType,
      effectiveDate: processingData.effectiveDate,
      lastUpdated: processingData.lastUpdated,
      content: processingData.content,
      documentMetadata: processingData.documentMetadata,
      metadata: processingData.processingMetadata,
      fileHash: processingData.fileHash,
      contentHash: processingData.contentHash,
      driveFileId: processingData.driveFileId,
      driveModifiedTime: processingData.driveModifiedTime,
    });

    // call processing endpoint
    const processResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/upload/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({ processingId }),
      },
    );

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      throw new Error(`processing failed: ${errorText}`);
    }

    const result = await processResponse.json();

    return Response.json({
      success: true,
      processingId,
      documentId: result.documentId,
      message: "file processed successfully",
    });
  } catch (error) {
    console.error("file upload error:", error);

    try {
      await db
        .update(processing)
        .set({
          status: "failed",
          retries: sql`retries + 1`,
          updatedAt: new Date(),
          metadata: sql`jsonb_set(COALESCE(metadata, '{}'), '{error}', '"${error}"')`,
        })
        .where(eq(processing.id, processingId));
    } catch (updateError) {
      console.error("failed to update processing status:", updateError);
    }

    return new Response(`upload failed: ${error}`, { status: 500 });
  }
}
