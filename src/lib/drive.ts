import TurndownService from "turndown";
import mammoth from "mammoth";
import { google } from "googleapis";
import creds from "../../credentials.json" with { type: "json" };

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

export async function exportDocxToMarkdown(fileId: string) {
  try {
    const res = await drive.files.export(
      {
        fileId,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      { responseType: "arraybuffer" },
    );
    const buffer = Buffer.from(res.data as string);
    return await convertToMD(buffer);
  } catch (err) {
    throw new Error(`failed to export & convert docx: ${err}`);
  }
}
