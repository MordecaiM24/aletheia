import { auth } from "@clerk/nextjs/server";
import mapDriveFolder from "@/lib/drive-mapping";
import { sha256 } from "js-sha256";
import { db, documents, processing } from "@/db/schema";
import { eq } from "drizzle-orm";

type FolderData = {
  files: {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
  }[];
  folders: Record<string, FolderData>;
};

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return new Response("unauthorized", { status: 401 });
  }

  const { url } = await req.json();

  const folderId = url.split("/").pop() == "" ? url : url.split("/").pop();

  if (!folderId) {
    return new Response("invalid url", { status: 400 });
  }

  try {
    const mapping = (await mapDriveFolder(folderId)) as Record<
      string,
      FolderData
    >;
    const results = [];
    const errors = [];

    // flatten all files from all folders
    const allFiles = [];
    for (const [folderPath, folderData] of Object.entries(mapping)) {
      for (const file of folderData.files) {
        allFiles.push({ ...file, folderPath });
      }
    }

    for (const file of allFiles) {
      try {
        // create file hash from gdrive metadata
        const fileHash = sha256(`${file.id}:${file.modifiedTime}`);

        // check if already processed
        const existing = await db
          .select()
          .from(documents)
          .where(eq(documents.fileHash, fileHash));

        if (existing.length > 0) {
          results.push({
            file: file.name,
            skipped: true,
            reason: "duplicate",
          });
          continue;
        }

        // call file endpoint with gdrive metadata
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/upload/file`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              cookie: req.headers.get("cookie") ?? "",
            },
            body: JSON.stringify({
              driveFileId: file.id,
              filename: file.name,
              mimeType: file.mimeType,
              modifiedTime: file.modifiedTime,
              folderPath: file.folderPath,
              fileHash,
            }),
          },
        );

        if (response.ok) {
          const result = await response.json();
          results.push({ file: file.name, success: true, ...result });
        } else {
          errors.push({ file: file.name, error: await response.text() });
        }
      } catch (error) {
        errors.push({
          file: file.name,
          error: error instanceof Error ? error.message : "unknown error",
        });
      }
    }

    return Response.json({ results, errors });
  } catch (error) {
    return new Response(`drive sync failed: ${error}`, { status: 500 });
  }
}
