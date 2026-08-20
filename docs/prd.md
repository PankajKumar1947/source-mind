# Product Requirements Document (PRD) - AI-powered Research Assistant

An AI-powered research assistant (inspired by Gemini Notebook / NotebookLM) that allows users to upload multiple knowledge sources, ask questions grounded in those sources, and receive answers with precise citations and source visualization.

---

## 1. Product Goal
The goal of this application is to help researchers, students, and professionals ingest, organize, and query multiple formats of knowledge sources (PDFs, text files, websites, YouTube videos, and VTT transcripts) under isolated notebooks (workspaces). The application provides grounded answers with clickable citations that open the exact referenced location (page number, YouTube timestamp, transcript text).

---

## 2. Core Features & Scope

### A. Notebooks & Workspaces
- Users can create, update, and delete notebooks.
- Each notebook acts as an isolated workspace with its own dedicated knowledge base.
- Data from one notebook is completely siloed and not searchable from another notebook.

### B. Multi-Source Ingestion & Processing
The application supports the following source types:
1. **PDF**: Ingested via PDF page-by-page parser (maintains page numbers in chunk metadata).
2. **Plain Text**: Direct markdown/text entry or uploaded `.txt` files.
3. **Website URL**: Ingested by scraping markdown content using Firecrawl.
4. **YouTube Video**: Ingested by fetching transcripts via video ID. Preserves timestamps in chunk metadata.
5. **VTT / Transcript file**: Uploaded WebVTT (`.vtt`) subtitle files. Parsed into timestamped transcript segments and indexed preserving start times.

For every source:
- **Indexing Worker**: Background processing via BullMQ to parse content, split it into chunks, generate embeddings, and store them in Qdrant.
- **Source Management**: Users can **Remove** (delete) a source (removes database records and Qdrant points) and **Re-index** a source (re-runs background indexing worker).

### C. Ingestion State & Status
The UI clearly displays the real-time status of each source:
- `PENDING` (Uploading / Queued)
- `PROCESSING` (Indexing)
- `SUCCESS` (Ready for Querying)
- `FAILED` (Failed with error messages)

---

## 3. Querying & Citation Navigation
- **Natural Language Chat**: Isolated per notebook. User enters a query, LLM generates a grounded response.
- **Grounded Responses**: AI answers queries using reciprocal rank fusion (RRF) on similarity searches of retrieved context chunks.
- **Precise Citations**: Each response includes citations mapping back to the exact chunk used.
- **Interactivity**: Clicking a citation opens the **Source Viewer** at the exact referenced location:
  - **PDF**: Opens the PDF at the specific page number.
  - **Website URL**: Opens/previews the website.
  - **YouTube Video**: Opens the embedded YouTube video starting at the referenced timestamp.
  - **Text**: Displays the full text and highlights the cited chunk.
  - **WebVTT Transcript**: Displays the transcript and highlights the cited chunk at its timestamp.

---

## 4. Bonus Features

### A. AI Learning Tools & Personalized Roadmaps
- Located under the `/learn` tab.
- Generates a **Personalized Learning Roadmap** based on the sources inside the notebook (specifically extracting concepts from YouTube videos or playlists).
- Builds a step-by-step roadmap indicating topics, sequences, and pinpointing source references/videos for each concept.

### B. Notebook Podcast Generator
- Generates a **Podcast** discussion out of the notebook's sources.
- User can select male/female voice configurations.
- Synthesizes a structured dialog summarizing the sources, which plays in an interactive, sleek audio player.

---

## 5. UI/UX & Design System

### A. Styling & Aesthetics
- Styled using a dedicated CSS token-based system (`token.css`) imported into Tailwind v4-configured `globals.css`.
- Sleek dark and light mode designs, with clean panel structures, subtle micro-animations, and smooth transitions.
- Themes are fully extensible (e.g., *Botanical Garden* theme incorporating fresh Fern Green `#4a7c59`, Marigold `#f9a620`, and Terracotta `#b7472a`).

---

## 6. Technical Stack
- **Framework**: Next.js (App Router), React, TypeScript.
- **Database**: PostgreSQL (Prisma ORM with modular/split schemas).
- **Vector Database**: Qdrant.
- **AI/LLM**: Mistral AI (Embeddings + Chat Generation).
- **Background Jobs**: BullMQ (Redis-backed queue).
- **File Upload**: ImageKit.io.
