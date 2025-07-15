import { auth } from "@clerk/nextjs/server";
import {
  ApiError,
  callInternalApi,
  successResponse,
} from "@/lib/upload-helpers";

const BATCH_CONFIG = {
  maxFiles: 50,
  concurrency: 5,
  supportedTypes: [".json", ".txt", ".pdf", ".docx"] as const,
} as const;

type FileResult = {
  file: string;
  success?: boolean;
  documentId?: string;
  processingId?: string;
  error?: string;
  skipped?: boolean;
  reason?: string;
};

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return ApiError.unauthorized();
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return ApiError.badRequest("no files provided");
  }

  if (files.length > BATCH_CONFIG.maxFiles) {
    return ApiError.badRequest(
      `too many files. max ${BATCH_CONFIG.maxFiles} files per batch`,
    );
  }

  const { valid, unsupported } = categorizeFiles(files);

  const results = await processFilesInBatches(valid, request);

  const allResults = [
    ...results,
    ...unsupported.map((file) => ({
      file: file.name,
      success: false,
      error: "unsupported file type",
      skipped: true,
      reason: `unsupported file type: ${getFileExtension(file.name)}`,
    })),
  ];

  const successful = allResults.filter((r) => r.success);
  const skipped = allResults.filter((r) => r.skipped);
  const failed = allResults.filter((r) => r.error);

  return successResponse(
    {
      processed: successful.length,
      skipped: skipped.length,
      failed: failed.length,
      results: allResults,
    },
    {
      total: files.length,
      message: `processed ${successful.length} files, ${skipped.length} skipped, ${failed.length} failed`,
    },
  );
}

function categorizeFiles(files: File[]) {
  const valid: File[] = [];
  const unsupported: File[] = [];

  for (const file of files) {
    const ext = getFileExtension(file.name).toLowerCase();
    if (BATCH_CONFIG.supportedTypes.includes(ext as any)) {
      valid.push(file);
    } else {
      unsupported.push(file);
    }
  }

  return { valid, unsupported };
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.slice(lastDot);
}

async function processFilesInBatches(
  files: File[],
  request: Request,
): Promise<FileResult[]> {
  const results: FileResult[] = [];

  for (let i = 0; i < files.length; i += BATCH_CONFIG.concurrency) {
    const batch = files.slice(i, i + BATCH_CONFIG.concurrency);
    const batchResults = await Promise.all(
      batch.map((file) => processFile(file, request)),
    );
    results.push(...batchResults);
  }

  return results;
}

async function processFile(file: File, request: Request): Promise<FileResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/upload/file`,
      {
        method: "POST",
        body: formData,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!response.ok) {
      return {
        file: file.name,
        error: await response.text(),
      };
    }

    const result = await response.json();

    if (result.meta?.skipped) {
      return {
        file: file.name,
        skipped: true,
        reason: result.meta.reason,
        documentId: result.data?.documentId,
      };
    }

    return {
      file: file.name,
      success: true,
      documentId: result.data?.documentId,
      processingId: result.data?.processingId,
    };
  } catch (error) {
    return {
      file: file.name,
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}
