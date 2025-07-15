CREATE TABLE "bookmarks" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"document_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" text,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"cited_documents" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text NOT NULL,
	"title" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "searches" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text NOT NULL,
	"query" text NOT NULL,
	"results_count" integer NOT NULL,
	"search_type" text,
	"filters" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_bookmarks" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_messages" ON "chat_messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "idx_user_chats" ON "chats" USING btree ("user_id","last_message_at");--> statement-breakpoint
CREATE INDEX "idx_pinned_chats" ON "chats" USING btree ("user_id","is_pinned");--> statement-breakpoint
CREATE INDEX "idx_user_searches" ON "searches" USING btree ("user_id","created_at");