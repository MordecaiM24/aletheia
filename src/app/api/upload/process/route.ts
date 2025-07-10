import { chunks, documents, processing } from "@/db/schema";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { embed } from "ai";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

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

    // TODO: add metadata extraction step here (llm-based)
    // TODO: add content chunking strategy (semantic vs fixed-size)

    await db
      .update(processing)
      .set({ status: "embedded", updatedAt: new Date() })
      .where(eq(processing.id, processingId));

    const model = google.textEmbeddingModel("text-embedding-004", {
      taskType: "RETRIEVAL_DOCUMENT",
    });

    const documentId = crypto.randomUUID();

    const embedding = await embed({
      model: model,
      value: processingEntry.content || "",
    });

    // TODO: implement proper chunking strategy here
    // for now just using the full content as one chunk

    await db
      .update(processing)
      .set({ status: "indexed", updatedAt: new Date() })
      .where(eq(processing.id, processingId));

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
      lastUpdated: processingEntry.lastUpdated || new Date(),
      metadata: processingEntry.documentMetadata || {},
    });

    await db.insert(chunks).values({
      documentId: documentId,
      content: processingEntry.content || "",
      metadata: processingEntry.documentMetadata || {},
      embedding: embedding.embedding,
    });

    await db
      .update(processing)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(processing.id, processingId));

    await db.delete(processing).where(eq(processing.id, processingId));

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
