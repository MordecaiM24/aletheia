ALTER TABLE "processing" RENAME COLUMN "url" TO "source_url";--> statement-breakpoint
ALTER TABLE "processing" DROP CONSTRAINT "processing_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "file_path" text;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "doc_type" text;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "effective_date" timestamp;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "last_updated" timestamp;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "document_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "processing" DROP COLUMN "document_id";