import { google } from "googleapis";
import path from "path";
import creds from "../../credentials.json" with { type: "json" };

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
export const drive = google.drive({ version: "v3", auth });

async function listFilesInFolder(folderId) {
  let files = [];
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    files = files.concat(res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

export default async function mapDriveFolder(
  folderId,
  folderPath = "",
  mapping = {},
) {
  console.log(`mapping folder ${folderId} at ${folderPath}`);
  mapping[folderPath] = { files: [], folders: {} };
  const items = await listFilesInFolder(folderId);

  for (const f of items) {
    console.log(
      `mapping file ${f.name} with ${items.length} items at ${folderPath}`,
    );
    const safeName = f.name.replace(/\s+/g, "_");
    if (f.mimeType === "application/vnd.google-apps.folder") {
      const subPath = path.posix.join(folderPath, safeName);
      mapping[folderPath].folders[safeName] = { id: f.id, path: subPath };
      await mapDriveFolder(f.id, subPath, mapping);
    } else {
      mapping[folderPath].files.push({
        id: f.id,
        name: safeName,
        mimeType: f.mimeType,
        modifiedTime: f.modifiedTime,
      });
    }
  }

  return mapping;
}
