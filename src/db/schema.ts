import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  text,
  pgTable,
  timestamp,
  jsonb,
  vector,
  index,
} from "drizzle-orm/pg-core";

config({ path: ".env.local" });

export const db = drizzle(process.env.DATABASE_URL!);

export const documents = pgTable("documents", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orgId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  title: text("title").notNull(),
  sourceUrl: text("source_url").notNull(),
  filePath: text("file_path").notNull(),
  docType: text("doc_type").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  metadata: jsonb("metadata").notNull(),
});

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orgId: text("org_id").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chunks = pgTable(
  "chunks",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    documentId: text("document_id").references(() => documents.id),
    content: text("content").notNull(),
    metadata: jsonb("metadata").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (table) => [
    index("idx_embedding").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);
