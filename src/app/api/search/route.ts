import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { chunks, db, documents } from "@/db/schema";
import { cosineDistance, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { Doc } from "@/types/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const type = searchParams.get("type") || "semantic";

  let results: Doc[] = [];

  if (type === "semantic") {
    results = await summarySemanticSearch(query);

    await keywordSearch(query);
    await semanticChunkSearch(query);
  } else {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  return NextResponse.json({ results });
}

async function summarySemanticSearch(query: string) {
  const model = google.textEmbeddingModel("text-embedding-004", {
    taskType: "RETRIEVAL_QUERY",
  });

  const embedding = await embed({
    model: model,
    value: query,
  });
  const similarity = sql<number>`1 - (${cosineDistance(
    documents.summaryEmbedding,
    embedding.embedding,
  )})`;

  const results = await db
    .select({
      id: documents.id,
      title: documents.title,
      summary: documents.summary,
      sourceUrl: documents.sourceUrl,
      filePath: documents.filePath,
      docType: documents.docType,
      effectiveDate: documents.effectiveDate,
      lastUpdated: documents.lastUpdated,
      metadata: documents.metadata,
      summaryEmbedding: documents.summaryEmbedding,
      fileHash: documents.fileHash,
      contentHash: documents.contentHash,
      driveFileId: documents.driveFileId,
      driveModifiedTime: documents.driveModifiedTime,
      orgId: documents.orgId,
      userId: documents.userId,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      similarity: similarity,
    })
    .from(documents)
    .where(gt(similarity, 0.4))
    .orderBy((t) => desc(t.similarity))
    .limit(5);

  return results;
}

async function keywordSearch(query: string) {
  const docIds = await db
    .select({ id: chunks.documentId })
    .from(chunks)
    .where(sql`${chunks.searchVector} @@ plainto_tsquery('english', ${query})`)
    .limit(5);

  const uniqueDocIds = [...new Set(docIds.map((d) => d.id))].filter(
    (id) => id !== null,
  );

  const results = await db
    .select({
      id: documents.id,
      title: documents.title,
      summary: documents.summary,
    })
    .from(documents)
    .where(inArray(documents.id, uniqueDocIds));
}

async function semanticChunkSearch(query: string) {
  const model = google.textEmbeddingModel("text-embedding-004", {
    taskType: "RETRIEVAL_QUERY",
  });

  const embedding = await embed({
    model: model,
    value: query,
  });

  const similarity = sql<number>`1 - (${cosineDistance(
    chunks.embedding,
    embedding.embedding,
  )})`;

  const results = await db
    .select({
      id: chunks.id,
      documentId: chunks.documentId,
      content: chunks.content,
      similarity: similarity,
    })
    .from(chunks)
    .where(gt(similarity, 0.4))
    .innerJoin(documents, eq(chunks.documentId, documents.id))
    .orderBy((t) => desc(t.similarity))
    .limit(5);
}
