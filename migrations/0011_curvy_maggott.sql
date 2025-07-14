ALTER TABLE "processing" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "summary_embedding" vector(768);