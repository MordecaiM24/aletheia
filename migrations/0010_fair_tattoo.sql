ALTER TABLE "documents" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "summary_embedding" vector(768);--> statement-breakpoint
CREATE INDEX "idx_summary_embedding" ON "documents" USING hnsw ("summary_embedding" vector_cosine_ops);