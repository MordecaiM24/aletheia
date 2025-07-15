import { ProcessingData } from "@/types/types";
import { db, documents, processing } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sha256 } from "js-sha256";

export const CHUNK_CONFIG = {
  size: 1000,
  overlap: 100,
  contextBuffer: 50,
} as const;

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
};

export type DuplicateCheckResult = {
  isDuplicate: boolean;
  reason?: "file_hash" | "content_hash";
  docId?: string;
};

export const ApiError = {
  unauthorized: () => new Response("unauthorized", { status: 401 }),
  badRequest: (msg: string) => new Response(msg, { status: 400 }),
  notFound: (msg: string) => new Response(msg, { status: 404 }),
  serverError: (msg: string) => new Response(msg, { status: 500 }),
};

export async function checkDuplicates(
  fileHash: string,
  contentHash?: string,
): Promise<DuplicateCheckResult> {
  const byHash = await db
    .select()
    .from(documents)
    .where(eq(documents.fileHash, fileHash))
    .limit(1);

  if (byHash.length > 0) {
    return { isDuplicate: true, reason: "file_hash", docId: byHash[0].id };
  }

  if (contentHash) {
    const byContent = await db
      .select()
      .from(documents)
      .where(eq(documents.contentHash, contentHash))
      .limit(1);

    if (byContent.length > 0) {
      return {
        isDuplicate: true,
        reason: "content_hash",
        docId: byContent[0].id,
      };
    }
  }

  return { isDuplicate: false };
}

export function createProcessingData(
  base: Partial<ProcessingData>,
  hashes: { fileHash: string; contentHash: string },
): Partial<ProcessingData> {
  return {
    effectiveDate: new Date(),
    lastUpdated: new Date(),
    sourceUrl: "",
    documentMetadata: {},
    processingMetadata: {},
    ...base,
    ...hashes,
  };
}

export async function callInternalApi(
  endpoint: string,
  data: any,
  req: Request,
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  return fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(data),
  });
}

export async function updateProcessingStatus(
  id: string,
  status: string,
  error?: any,
  additionalFields?: Record<string, any>,
) {
  const update: any = {
    status,
    updatedAt: new Date(),
    ...additionalFields,
  };

  if (error) {
    update.retries = sql`retries + 1`;
    update.metadata = sql`jsonb_set(COALESCE(metadata, '{}'), '{error}', '"${error}"')`;
  }

  return db.update(processing).set(update).where(eq(processing.id, id));
}

export function successResponse<T>(
  data: T,
  meta?: Record<string, any>,
): Response {
  return Response.json({ success: true, data, meta });
}

export function duplicateResponse(docId: string, reason: string): Response {
  return Response.json({
    success: true,
    data: { documentId: docId },
    meta: { skipped: true, reason },
  });
}
