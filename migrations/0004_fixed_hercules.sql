CREATE TYPE "public"."status" AS ENUM('uploaded', 'converted', 'extracted', 'chunked', 'embedded', 'indexed', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "processing" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" text,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"status" "status" DEFAULT 'uploaded' NOT NULL,
	"retries" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "processing" ADD CONSTRAINT "processing_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "jurisdiction";