import { chunks, documents, processing } from "@/db/schema";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { embed, generateObject } from "ai";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { getChunksWithPositions } from "@/lib/chunking";
import { z } from "zod";

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

export async function POST(request: Request) {
  const db = drizzle(process.env.DATABASE_URL!);
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("unauthorized", { status: 401 });
  }

  const { processingId }: { processingId: string } = await request.json();

  try {
    const [processingEntry] = await db
      .select()
      .from(processing)
      .where(eq(processing.id, processingId));

    if (!processingEntry) {
      return new Response("processing entry not found", { status: 404 });
    }

    if (!processingEntry.content) {
      return new Response("processing entry content not found", {
        status: 404,
      });
    }

    console.log("[process] processing entry:", processingEntry.title);

    const metadata = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: initialMetadataSchema,
      prompt: `Extract metadata from the following document: ${processingEntry.content}.`,
    });

    const summary = metadata.object.summary;

    let lastUpdated: Date;
    try {
      lastUpdated = new Date(metadata.object.lastUpdated);
    } catch (error) {
      console.error("error parsing lastUpdated:", error);
      lastUpdated = new Date();
    }

    console.log("[process] metadata:", metadata.object);

    console.log("[process] content length:", processingEntry.content.length);

    const chunksWithPositions = await getChunksWithPositions(
      processingEntry.content,
    );

    console.log("# of chunksWithPositions", chunksWithPositions.length);

    const model = google.textEmbeddingModel("text-embedding-004", {
      taskType: "RETRIEVAL_DOCUMENT",
    });

    const embeddings = await Promise.all(
      chunksWithPositions.map((chunk) =>
        embed({
          model: model,
          value: chunk.content,
        }),
      ),
    );

    console.log("# of embeddings", embeddings.length);

    const documentId = processingEntry.id;

    const summaryEmbedding = await embed({
      model: model,
      value: summary,
    });

    await db
      .update(processing)
      .set({
        status: "embedded",
        updatedAt: new Date(),
        summary: summary,
        summaryEmbedding: summaryEmbedding.embedding,
      })
      .where(eq(processing.id, processingId));

    const { summary: _, ...dbMetadata } = metadata.object; // remove summary from metadata.

    // move to documents table
    await db.insert(documents).values({
      id: documentId,
      orgId: processingEntry.orgId,
      userId: processingEntry.userId,
      title: processingEntry.title || "untitled",
      sourceUrl: processingEntry.sourceUrl || "",
      filePath: processingEntry.filePath || "",
      docType: processingEntry.docType || "unknown",
      effectiveDate: processingEntry.effectiveDate || new Date(),
      lastUpdated: lastUpdated || new Date(),
      metadata: dbMetadata,
      summary: summary,
      summaryEmbedding: summaryEmbedding.embedding,
      fileHash: processingEntry.fileHash,
      contentHash: processingEntry.contentHash,
      driveFileId: processingEntry.driveFileId,
      driveModifiedTime: processingEntry.driveModifiedTime,
    });

    await db
      .update(processing)
      .set({ status: "indexed", updatedAt: new Date() })
      .where(eq(processing.id, processingId));

    const chunkValues: Chunk[] = chunksWithPositions.map((chunk, index) => ({
      id: crypto.randomUUID(),
      documentId: documentId,
      userId: userId,
      orgId: orgId,
      content: chunk.content,
      metadata: processingEntry.documentMetadata || {},
      embedding: embeddings[index].embedding,
      chunkIndex: chunk.chunkIndex,
      chunkSize: 1000, // TODO: magic numbers rn. fix later.
      chunkOverlap: 100, // TODO: magic numbers rn. fix later.
      startChar: chunk.startChar,
      endChar: chunk.endChar,
    }));

    await db.insert(chunks).values(chunkValues);

    await db
      .update(processing)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(processing.id, processingId));

    // await db.delete(processing).where(eq(processing.id, processingId));

    return Response.json({ success: true, documentId, processingId });
  } catch (error) {
    console.error("processing error:", error);

    // mark as failed and increment retries
    await db
      .update(processing)
      .set({
        status: "failed",
        retries: sql`retries + 1`,
        updatedAt: new Date(),
        metadata: sql`jsonb_set(COALESCE(metadata, '{}'), '{error}', '"${error}"')`,
      })
      .where(eq(processing.id, processingId));

    return new Response("processing failed", { status: 500 });
  }
}
