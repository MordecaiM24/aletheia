ALTER TABLE "chunks" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "org_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "chunk_index" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "chunk_size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "chunk_overlap" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "start_char" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "endChar" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;