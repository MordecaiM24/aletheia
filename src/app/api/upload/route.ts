import { db, documents, chunks } from "@/db/schema";
import { google } from "@ai-sdk/google";
import { drizzle } from "drizzle-orm/neon-http";
import { auth } from "@clerk/nextjs/server";
import { embed } from "ai";

type UploadedDocument = {
  title: string;
  sourceUrl: string;
  filePath: string;
  docType: string;
  jurisdiction: string;
  effectiveDate: Date;
  lastUpdated: Date;
  metadata: Record<string, any>;
  text: string;
};

export async function POST(request: Request) {
  const db = drizzle(process.env.DATABASE_URL!);
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const req = await request.formData();
  const file = req.get("file");

  if (!file || !(file instanceof Blob)) {
    return new Response("no file", { status: 400 });
  }

  const model = google.textEmbeddingModel("text-embedding-004", {
    taskType: "RETRIEVAL_DOCUMENT",
  });

  const text = await file.text();

  let doc: UploadedDocument;

  try {
    doc = JSON.parse(text);
    doc.effectiveDate = new Date(doc.effectiveDate);
    doc.lastUpdated = new Date(doc.lastUpdated);
  } catch (error) {
    console.error(error);
    return new Response("Invalid file type", { status: 400 });
  }

  const docId = crypto.randomUUID();

  const res = await db.insert(documents).values({
    id: docId,
    orgId: orgId,
    userId: userId,
    title: doc.title,
    sourceUrl: doc.sourceUrl,
    filePath: doc.filePath,
    docType: doc.docType,
    jurisdiction: doc.jurisdiction,
    effectiveDate: doc.effectiveDate,
    lastUpdated: doc.lastUpdated,
    metadata: doc.metadata,
  });

  const embedding = await embed({
    model: model,
    value: doc.text,
  });

  const chunk = await db.insert(chunks).values({
    documentId: docId,
    content: doc.text,
    metadata: doc.metadata,
    embedding: embedding.embedding,
  });

  console.log("CHUNK", chunk);

  return Response.json({ res: "nice." });
}
