import { auth } from "@clerk/nextjs/server";
import mapDriveFolder from "@/lib/drive-mapping";
import { sha256 } from "js-sha256";
import {
  ApiError,
  checkDuplicates,
  callInternalApi,
  successResponse,
} from "@/lib/upload-helpers";

type FolderData = {
  files: {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
  }[];
  folders: Record<string, FolderData>;
};

type FileResult = {
  file: string;
  success?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
};

function extractFolderId(url: string): string | null {
  const trimmed = url.endsWith("/") ? url.slice(0, -1) : url;
  const parts = trimmed.split("/");
  return parts[parts.length - 1] || null;
}

function flattenFolderFiles(mapping: Record<string, FolderData>) {
  return Object.entries(mapping).flatMap(([folderPath, folderData]) =>
    folderData.files.map((file) => ({ ...file, folderPath })),
  );
}

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return ApiError.unauthorized();
  }

  const { url } = await req.json();
  const folderId = extractFolderId(url);

  if (!folderId) {
    return ApiError.badRequest("invalid url");
  }

  try {
    const mapping = (await mapDriveFolder(folderId)) as Record<
      string,
      FolderData
    >;
    const allFiles = flattenFolderFiles(mapping);

    const results = await Promise.all(
      allFiles.map((file) => processFile(file, req)),
    );

    const successful = results.filter((r) => r.success && !r.skipped);
    const skipped = results.filter((r) => r.skipped);
    const errors = results.filter((r) => r.error);

    return successResponse(
      {
        processed: successful.length,
        skipped: skipped.length,
        failed: errors.length,
        results,
      },
      { totalFiles: allFiles.length },
    );
  } catch (error) {
    return ApiError.serverError(`drive sync failed: ${error}`);
  }
}

async function processFile(
  file: any & { folderPath: string },
  req: Request,
): Promise<FileResult> {
  try {
    const fileHash = sha256(`${file.id}:${file.modifiedTime}`);

    const dupCheck = await checkDuplicates(fileHash);
    if (dupCheck.isDuplicate) {
      return {
        file: file.name,
        skipped: true,
        reason: dupCheck.reason,
      };
    }

    const response = await callInternalApi(
      "/api/upload/file",
      {
        driveFileId: file.id,
        filename: file.name,
        mimeType: file.mimeType,
        modifiedTime: file.modifiedTime,
        folderPath: file.folderPath,
        fileHash,
      },
      req,
    );

    if (!response.ok) {
      return {
        file: file.name,
        error: await response.text(),
      };
    }

    const result = await response.json();
    return {
      file: file.name,
      success: true,
      ...result.data,
    };
  } catch (error) {
    return {
      file: file.name,
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}
