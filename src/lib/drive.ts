import TurndownService from "turndown";
import mammoth from "mammoth";
import { google } from "googleapis";
import creds from "../../credentials.json" with { type: "json" };
import { uploadToS3 } from "./s3";

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
export const drive = google.drive({ version: "v3", auth });

function cleanMarkdown(md: string) {
  return md
    .replace(/!\[.*?\]\(data:image\/[^;]+;base64,[^)]+\)/g, "[IMAGE_REMOVED]")
    .replace(/!\[.*?\]\([^)]+\)/g, "[IMAGE_REMOVED]")
    .replace(/<img[^>]*>/g, "[IMAGE_REMOVED]")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

async function convertToMD(buffer: Buffer) {
  const html = (await mammoth.convertToHtml({ buffer })).value;
  const md = new TurndownService().turndown(html);
  return cleanMarkdown(md);
}

async function getDocxBuffer(fileId: string) {
  const res = await drive.files.export(
    {
      fileId,
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(res.data as string);
}

async function getPdfBuffer(fileId: string): Promise<Buffer> {
  const res = await drive.files.export(
    {
      fileId,
      mimeType: "application/pdf",
    },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(res.data as string);
}

export async function exportDocxToMarkdown(fileId: string, orgId: string) {
  try {
    const [docxBuffer, pdfBuffer] = await Promise.all([
      getDocxBuffer(fileId),
      getPdfBuffer(fileId),
    ]);

    const s3Prefix = `${orgId}/${fileId}`;

    const markdown = await convertToMD(docxBuffer);

    const [markdownUrl, pdfUrl] = await Promise.all([
      uploadToS3(`${s3Prefix}.md`, markdown, "text/markdown"),
      uploadToS3(`${s3Prefix}.pdf`, pdfBuffer, "application/pdf"),
    ]);

    console.log(`[upload] ${fileId} markdown: ${markdownUrl} pdf: ${pdfUrl}`);

    return markdown;
  } catch (err) {
    throw new Error(`failed to export & convert docx: ${err}`);
  }
}
