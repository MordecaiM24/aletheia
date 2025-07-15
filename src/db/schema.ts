import { config } from "dotenv";
import { SQL, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core";

config({ path: ".env.local" });

export const db = drizzle(process.env.DATABASE_URL!);

export const documents = pgTable(
  "documents",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orgId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    title: text().notNull(),
    sourceUrl: text("source_url").notNull(),
    filePath: text("file_path").notNull(),
    docType: text("doc_type").notNull(),
    effectiveDate: timestamp("effective_date").notNull(),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
    metadata: jsonb().notNull(),
    summary: text("summary").notNull(),
    summaryEmbedding: vector("summary_embedding", {
      dimensions: 768,
    }).notNull(),

    // versioning
    fileHash: text("file_hash").notNull(),
    contentHash: text("content_hash"),
    driveFileId: text("drive_file_id"),
    driveModifiedTime: timestamp("drive_modified_time"),
  },
  (table) => [
    index("idx_file_hash").on(table.fileHash),
    index("idx_content_hash").on(table.contentHash),
    index("idx_drive_file_id").on(table.driveFileId),
    index("idx_summary_embedding").using(
      "hnsw",
      table.summaryEmbedding.op("vector_cosine_ops"),
    ),
  ],
);

export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const chunks = pgTable(
  "chunks",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    documentId: text("document_id").references(() => documents.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").notNull(),
    orgId: text("org_id").notNull(),
    content: text().notNull(),
    metadata: jsonb().notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    searchVector: tsvector("search_vector")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`to_tsvector('english', ${chunks.content})`,
      ),
    chunkIndex: integer("chunk_index").notNull(),
    chunkSize: integer("chunk_size").notNull(),
    chunkOverlap: integer("chunk_overlap").notNull(),
    startChar: integer("start_char").notNull(),
    endChar: integer().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_embedding").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    index("idx_search_vector").using("gin", table.searchVector),
  ],
);

export const statusEnum = pgEnum("status", [
  "uploaded",
  "converted",
  "extracted",
  "chunked",
  "embedded",
  "indexed",
  "completed",
  "failed",
]);

export const processing = pgTable("processing", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orgId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  status: statusEnum().notNull().default("uploaded"),
  retries: integer().notNull().default(0),

  // document fields to incrementally add
  title: text(),
  sourceUrl: text("source_url"),
  filePath: text("file_path"),
  docType: text("doc_type"),
  effectiveDate: timestamp("effective_date"),
  lastUpdated: timestamp("last_updated"),
  content: text(), // the actual content
  documentMetadata: jsonb("document_metadata"), // separate from processing metadata
  summary: text("summary"),
  summaryEmbedding: vector("summary_embedding", { dimensions: 768 }),

  // processing metadata
  metadata: jsonb("metadata"), // for processing-specific stuff
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // versioning
  fileHash: text("file_hash").notNull(),
  contentHash: text("content_hash"),
  driveFileId: text("drive_file_id"),
  driveModifiedTime: timestamp("drive_modified_time"),
});

export const searches = pgTable(
  "searches",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    orgId: text("org_id").notNull(),
    query: text().notNull(),
    resultsCount: integer("results_count").notNull(),
    searchType: text("search_type"), // "semantic", "keyword", "hybrid"
    filters: jsonb(), // {docType: "resolution", dateRange: {...}}
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (searches) => [
    index("idx_user_searches").on(searches.userId, searches.createdAt),
  ],
);

export const chats = pgTable(
  "chats",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    orgId: text("org_id").notNull(),
    title: text().notNull(), // auto-generated from first message
    isPinned: boolean("is_pinned").default(false),
    lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (chats) => [
    index("idx_user_chats").on(chats.userId, chats.lastMessageAt),
    index("idx_pinned_chats").on(chats.userId, chats.isPinned),
  ],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    chatId: text("chat_id").references(() => chats.id),
    role: text().notNull(), // "user" | "assistant"
    content: text().notNull(),
    citedDocuments: jsonb("cited_documents"), // array of doc ids
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (chatMessages) => [index("idx_chat_messages").on(chatMessages.chatId)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    documentId: text("document_id").references(() => documents.id),
    notes: text(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (bookmarks) => [index("idx_user_bookmarks").on(bookmarks.userId)],
);
