# Aletheia

Aletheia is a Next.js 15 app for ingesting documents from Google Drive or direct upload, converting them to Markdown, embedding and chunking content, indexing into Postgres (with pgvector + full-text search), and enabling semantic search and AI chat over your corpus. Authentication and organizations are handled by Clerk. Assets are optionally persisted to S3.

## Tech Stack

- Next.js 15 (App Router), React 19, TypeScript 5
- Clerk for auth, orgs, and middleware protection
- Drizzle ORM with Neon/Postgres
- pgvector for embeddings, PostgreSQL full-text search (tsvector)
- AI SDK (`ai`) + Google Gemini models for generation and embeddings
- LangChain text splitter for chunking
- Tailwind CSS 4 and Radix UI primitives
- AWS SDK v3 for S3 uploads (optional)

## Key Features

- Authenticated workspace via Clerk middleware (`/workspace/**`)
- Upload flow:
  - Direct upload of `.json`, `.txt`, `.pdf`, `.docx` (batch supported)
  - Google Drive `.docx` export → Markdown + optional PDF archival to S3
  - Duplicate detection via `fileHash` and `contentHash`
  - Processing pipeline: uploaded → converted → embedded → indexed → completed
- Indexing:
  - Summary generation and embedding (Gemini + text-embedding-004)
  - Document-level summary embeddings (pgvector)
  - Content chunking with legal-aware separators, chunk embeddings, and tsvector
- Search API:
  - Semantic search over document summaries
  - Keyword and semantic chunk search utilities (hybrid-ready)
- Chat API:
  - Streaming chat using Gemini (`gemini-2.0-flash-lite`)

## Directory Overview

- `src/app/api/upload/file` — single file upload, JSON-parsed content or doc metadata
- `src/app/api/upload/folder` — batch upload orchestration
- `src/app/api/upload/process` — embedding, metadata extraction, chunking, indexing
- `src/app/api/search` — semantic summary search (plus keyword and chunk helpers)
- `src/app/api/ai/chat` — streaming chat endpoint
- `src/db/schema.ts` — Drizzle schema (documents, chunks, processing, etc.)
- `src/lib/drive.ts` — Google Drive export to Markdown and S3 archival
- `src/lib/upload-helpers.ts` — duplicate checks, status updates, API helpers
- `src/lib/chunking.ts` — legal-aware chunking with position tracking
- `src/lib/s3.ts` — minimal S3 upload helper
- `src/middleware.ts` — Clerk middleware protecting `/workspace/**`

## Environment Variables

Create `.env.local` with at least:

- Database
  - `DATABASE_URL` — Postgres connection string (Neon supported)
- Clerk
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Google AI via AI SDK
  - `GOOGLE_GENERATIVE_AI_API_KEY` — for Gemini models
- App base URLs
  - `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_API_URL` — base URL for internal calls
- AWS S3 (optional; required for Drive archival)
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_S3_BUCKET`

Additionally, `src/lib/drive.ts` expects `credentials.json` (Google service account credentials with Drive readonly scope). Place it at `src/credentials.json` or adjust the import.

## Database & Migrations

- Drizzle config: `drizzle.config.ts` (schema at `src/db/schema.ts`, output `migrations/`)
- Run migrations with your preferred workflow (Drizzle Kit ≥0.31).

Schema highlights:
- `documents` — per-document metadata, summary, and summary embedding (768 dims)
- `chunks` — chunk content, embedding (768 dims), `searchVector` (generated tsvector)
- `processing` — pipeline state, metadata, and versioning fields

Ensure pgvector is installed on your Postgres instance and `hnsw` indexes are supported.

## Running Locally

```bash
npm install
npm run dev
# App at http://localhost:3000
```

Required services:
- Postgres (with pgvector)
- Optional: AWS S3 bucket if you use Google Drive ingestion

## Authentication & Authorization

- Clerk middleware protects all routes under `/workspace/**`.
- API routes rely on `auth()` to obtain `userId` and `orgId`. Requests without these return 401.

## Upload & Processing Flow

1. Client uploads via `POST /api/upload/file` (FormData with `file`) or provides Drive file JSON to the same route with `Content-Type: application/json`.
2. Server creates a `processing` row, checks duplicates by `fileHash`/`contentHash`.
3. If not duplicate, it calls `POST /api/upload/process` with `processingId`.
4. Process step:
   - Extract metadata via Gemini structured output
   - Embed summary with `text-embedding-004`
   - Insert `documents` row, then chunk content and embed chunks
   - Mark status to `completed`
5. Batch uploads use `POST /api/upload/folder` to fan out to `/api/upload/file`.

## Search API

- `GET /api/search?query=...&type=semantic`
  - Computes query embedding and returns top documents by cosine similarity over `documents.summaryEmbedding` (threshold 0.4, limit 5).
  - Keyword and chunk search helpers are available for hybrid pipelines.

## Chat API

- `POST /api/ai/chat`
  - Body: `{ messages: Array<{ role: "user"|"assistant", content: string }> }`
  - Streams responses using Gemini (`gemini-2.0-flash-lite`).

## Google Drive Ingestion

- Service account with Drive readonly scope.
- `exportDocxToMarkdown(fileId, orgId)` exports `.docx` and `.pdf`, converts `.docx` → Markdown, cleans images, uploads Markdown/PDF to S3, and returns Markdown for indexing.

## Notes & Limits

- Embeddings dimensions: 768 (configured in schema and Google model)
- Batch upload defaults: max 50 files, concurrency 5
- Duplicate detection short-circuits processing and returns the existing `documentId`
- Some endpoints assume `NEXT_PUBLIC_APP_URL`/`NEXT_PUBLIC_API_URL` for internal calls

## Development Tips

- Keep `credentials.json` out of version control
- Ensure pgvector extension is enabled and indexes are created before heavy ingestion
- Tune `CHUNK_CONFIG` in `src/lib/upload-helpers.ts` and delimiters in `src/lib/chunking.ts`
