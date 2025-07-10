import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return new Response("no files", { status: 400 });
  }

  // TODO: add batch processing limits (max 50 files at once?)
  // TODO: add progress tracking for large folders
  // TODO: add parallel processing with concurrency limits

  const results = [];
  const errors = [];

  for (const file of files) {
    try {
      // skip non-json files for now
      // TODO: add support for other file types (pdf, docx, txt)
      if (!file.name.endsWith(".json")) {
        errors.push({
          file: file.name,
          error: "only json files supported currently",
        });
        continue;
      }

      const singleFileData = new FormData();
      singleFileData.append("file", file);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/upload/file`,
        {
          method: "POST",
          body: singleFileData,
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        results.push({
          file: file.name,
          success: true,
          documentId: result.documentId,
          processingId: result.processingId,
        });
      } else {
        const error = await response.text();
        errors.push({ file: file.name, error });
      }
    } catch (error) {
      errors.push({ file: file.name, error });
    }
  }

  return Response.json({
    total: files.length,
    processed: results.length,
    failed: errors.length,
    results,
    errors,
    message: `completed processing: ${results.length} successful, ${errors.length} failed`,
  });
}
