import { relations, type InferSelectModel } from "drizzle-orm";
import { chunks, documents } from "@/db/schema";

export type Doc = InferSelectModel<typeof documents>;
export type Chunk = InferSelectModel<typeof chunks>;

export type SidebarUser = {
  username: string;
  email: string;
  orgRole: string | null | undefined;
  orgName: string;
  imageUrl: string;
  orgImageUrl: string;
};

export type RecentSearch = {
  query: string;
  timestamp: string;
  results: number;
};

export type RecentChat = {
  title: string;
  timestamp: string;
  messages: number;
};

export type RecentDoc = {
  title: string;
  type: string;
  accessed: string;
};

export type PinnedItem = {
  title: string;
  icon: React.ReactNode;
};

export type Notification = {
  title: string;
  description: string;
  time: string;
};

export type UsageStat = {
  label: string;
  value: string;
  change: string;
};
export type SearchResult = {
  id: string;
  title: string;
  content: string;
  type: "document" | "passage" | "answer";
  source?: string;
  section?: string;
  relevance: number;
  metadata?: Record<string, any>;
};

export type SearchResponse = {
  results: SearchResult[];
  total: number;
  query: string;
};

export type DriveFileInput = {
  driveFileId: string;
  filename: string;
  mimeType: string;
  modifiedTime: string;
  folderPath: string;
  fileHash: string;
};

export type ProcessingData = {
  title: string;
  sourceUrl: string;
  filePath: string;
  docType: string;
  effectiveDate: Date;
  lastUpdated: Date;
  content: string;
  documentMetadata: Record<string, any>;
  processingMetadata: Record<string, any>;
  fileHash: string;
  contentHash?: string;
  driveFileId?: string;
  driveModifiedTime?: Date;
};
