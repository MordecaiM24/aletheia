import { processing } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

export async function POST(request: Request) {
  const db = drizzle(process.env.DATABASE_URL!);
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return new Response("no file", { status: 400 });
  }

  const processingId = crypto.randomUUID();

  try {
    // TODO: upload to s3 first for durability
    // TODO: add file type validation and conversion (pdf, docx, txt -> json)
    // TODO: add file hashing for duplicate detection
    // TODO: add basic file validation (content, size, etc.)

    const text = await file.text();
    let rawDoc;

    try {
      rawDoc = JSON.parse(text);
    } catch (error) {
      return new Response("invalid json file", { status: 400 });
    }

    // TODO: validate json schema here

    // create processing entry with initial data. incrementally adds fields as we go.
    await db.insert(processing).values({
      id: processingId,
      orgId: orgId,
      userId: userId,
      status: "converted", // skipping uploaded since we're not doing s3 yet

      title: rawDoc.title || file.name.replace(/\.[^/.]+$/, ""), // remove extension
      sourceUrl: rawDoc.sourceUrl || "",
      filePath: rawDoc.filePath || file.name, // TODO: use s3 path when implemented
      docType: rawDoc.docType || "uploaded",
      effectiveDate: rawDoc.effectiveDate
        ? new Date(rawDoc.effectiveDate)
        : new Date(),
      lastUpdated: rawDoc.lastUpdated
        ? new Date(rawDoc.lastUpdated)
        : new Date(),
      content: rawDoc.text || rawDoc.content || "",
      documentMetadata: rawDoc.metadata || {},

      // processing metadata
      metadata: {
        originalFilename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      },
    });

    // TODO: add extracted status step where llm enhances metadata

    const processResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/upload/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({ processingId }),
      }
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
      message: "file uploaded and processing completed",
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
