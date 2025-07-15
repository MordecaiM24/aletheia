import { chunks, documents, processing } from "@/db/schema";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { embed, generateObject } from "ai";
import { eq } from "drizzle-orm";
import { getChunksWithPositions } from "@/lib/chunking";
import { z } from "zod";
import { db } from "@/db/schema";
import {
  ApiError,
  updateProcessingStatus,
  successResponse,
  CHUNK_CONFIG,
} from "@/lib/upload-helpers";

type Chunk = typeof chunks.$inferInsert;

const initialMetadataSchema = z.object({
  summary: z.string(),
  type: z.string(),
  title: z.string(),
  longTitle: z.string(),
  lastUpdated: z.string(),
  keyEntities: z.array(z.string()),
  subjects: z.array(z.string()),
  confidence: z.number(),
});

const embeddingModel = google.textEmbeddingModel("text-embedding-004", {
  taskType: "RETRIEVAL_DOCUMENT",
});

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return ApiError.unauthorized();
  }

  const { processingId }: { processingId: string } = await request.json();

  if (!processingId) {
    return ApiError.badRequest("processingId required");
  }

  try {
    const processingEntry = await getProcessingEntry(processingId);
    if (!processingEntry) {
      return ApiError.notFound("processing entry not found");
    }

    if (!processingEntry.content) {
      return ApiError.notFound("processing entry content not found");
    }

    const { metadata, summary, summaryEmbedding } = await generateMetadata(
      processingEntry.content,
    );

    await updateProcessingStatus(processingId, "embedded", null, {
      summary,
      summaryEmbedding: summaryEmbedding.embedding,
    });

    const documentId = processingId;
    const documentData = prepareDocumentData(
      processingEntry,
      metadata,
      summary,
      summaryEmbedding.embedding,
    );

    await db.insert(documents).values(documentData);

    await updateProcessingStatus(processingId, "indexed");

    const chunkIds = await processChunks(processingEntry.content, {
      documentId,
      userId,
      orgId,
      metadata: processingEntry.documentMetadata || {},
    });

    await updateProcessingStatus(processingId, "completed");

    const result = { documentId, chunkCount: chunkIds.length };

    return successResponse({
      documentId: result.documentId,
      processingId,
      chunksCreated: result.chunkCount,
    });
  } catch (error) {
    console.error("processing error:", error);

    await updateProcessingStatus(processingId, "failed", error);

    return ApiError.serverError("processing failed");
  }
}

async function getProcessingEntry(processingId: string) {
  const [entry] = await db
    .select()
    .from(processing)
    .where(eq(processing.id, processingId));

  return entry;
}

async function generateMetadata(content: string) {
  const metadata = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: initialMetadataSchema,
    prompt: `Extract metadata from the following document: ${content}.`,
  });

  const summary = metadata.object.summary;

  const summaryEmbedding = await embed({
    model: embeddingModel,
    value: summary,
  });

  const { summary: _, ...dbMetadata } = metadata.object;

  return { metadata: dbMetadata, summary, summaryEmbedding };
}

function prepareDocumentData(
  processingEntry: any,
  metadata: any,
  summary: string,
  summaryEmbedding: number[],
) {
  let lastUpdated: Date;
  try {
    lastUpdated = new Date(metadata.lastUpdated);
  } catch (error) {
    console.error("error parsing lastUpdated:", error);
    lastUpdated = new Date();
  }

  return {
    id: processingEntry.id,
    orgId: processingEntry.orgId,
    userId: processingEntry.userId,
    title: processingEntry.title || "untitled",
    sourceUrl: processingEntry.sourceUrl || "",
    filePath: processingEntry.filePath || "",
    docType: processingEntry.docType || "unknown",
    effectiveDate: processingEntry.effectiveDate || new Date(),
    lastUpdated: lastUpdated,
    metadata: metadata,
    summary: summary,
    summaryEmbedding: summaryEmbedding,
    fileHash: processingEntry.fileHash,
    contentHash: processingEntry.contentHash,
    driveFileId: processingEntry.driveFileId,
    driveModifiedTime: processingEntry.driveModifiedTime,
  };
}

async function processChunks(
  content: string,
  context: {
    documentId: string;
    userId: string;
    orgId: string;
    metadata: any;
  },
) {
  const chunksWithPositions = await getChunksWithPositions(content);

  const embeddings = await Promise.all(
    chunksWithPositions.map((chunk) =>
      embed({
        model: embeddingModel,
        value: chunk.content,
      }),
    ),
  );

  const chunkValues: Chunk[] = chunksWithPositions.map((chunk, index) => ({
    id: crypto.randomUUID(),
    documentId: context.documentId,
    userId: context.userId,
    orgId: context.orgId,
    content: chunk.content,
    metadata: context.metadata,
    embedding: embeddings[index].embedding,
    chunkIndex: chunk.chunkIndex,
    chunkSize: CHUNK_CONFIG.size,
    chunkOverlap: CHUNK_CONFIG.overlap,
    startChar: chunk.startChar,
    endChar: chunk.endChar,
  }));

  await db.insert(chunks).values(chunkValues);

  return chunkValues.map((c) => c.id);
}
