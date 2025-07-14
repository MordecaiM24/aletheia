ALTER TABLE "documents" ADD COLUMN "file_hash" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "content_hash" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "drive_file_id" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "drive_modified_time" timestamp;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "file_hash" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "content_hash" text;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "drive_file_id" text;--> statement-breakpoint
ALTER TABLE "processing" ADD COLUMN "drive_modified_time" timestamp;--> statement-breakpoint
CREATE INDEX "idx_file_hash" ON "documents" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "idx_content_hash" ON "documents" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "idx_drive_file_id" ON "documents" USING btree ("drive_file_id");