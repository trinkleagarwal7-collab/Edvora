# Edvora Technical Architecture & System Design

```
+-------------------------------------------------------------------------+
|                                 EDVORA                                  |
|         Personal AI-Powered MBA Academic Learning Management System     |
+-------------------------------------------------------------------------+
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│       Frontend (Client)       │           │       Backend (Server)        │
│  - React 19 + TypeScript      │ ◄─HTTP──► │  - Express.js API (Port 5001) │
│  - Tailwind CSS + Lucide      │   REST    │  - Document Parsers Pipeline  │
│  - Mermaid.js Diagram Engine  │           │  - Structure-Aware Chunking   │
│  - Contextual AI Assistant    │           │  - RAG Retrieval Engine       │
│  - Spaced Repetition Cards    │           │  - ACID JSON Store Engine     │
└───────────────────────────────┘           └──────────────┬────────────────┘
                                                           │
                                        ┌──────────────────┴──────────────────┐
                                        ▼                                     ▼
                        ┌───────────────────────────────┐     ┌───────────────────────────────┐
                        │        Document Parsers       │     │         AI Integration        │
                        │ - PPTX (OpenXML slide/notes)  │     │ - Google Gemini API           │
                        │ - PDF (pdf-parse page logic)  │     │ - OpenAI API                  │
                        │ - DOCX (mammoth headings/tbl) │     │ - Source Grounding Citations  │
                        │ - TXT / MD (hierarchical)     │     │ - Grounded Synthesis Fallback │
                        │ - ZIP (ZipSlip traversal guard│     └───────────────────────────────┘
                        └───────────────────────────────┘
```

---

## 1. Document Intelligence & Processing Pipeline

When a student uploads course documents:
1. **Multer Storage:** The file is streamed to the secure `server/uploads/` directory with sanitized naming.
2. **Format Dispatch:**
   - **PPTX:** Inspected via `AdmZip` and parsed with `fast-xml-parser`. Extracts `ppt/slides/slide{N}.xml` and `ppt/notesSlides/notesSlide{N}.xml` to extract slide titles, body text, bullet points, and speaker notes with exact slide numbers.
   - **PDF:** Rendered through `pdf-parse` with custom page renderers to extract page-by-page text, detect first-line headings, and preserve page numbers.
   - **DOCX:** Processed via `mammoth` to extract clean paragraphs, headings, and tables.
   - **TXT / MD:** Processed with markdown header hierarchy parser.
   - **ZIP:** Inspected for traversal paths (`..`), validated against file size bounds, and extracted safely to individual documents.
3. **Structure-Aware Chunking:**
   - Instead of blind character splits that cut formulas and definitions in half, Edvora chunks at the **slide level** for presentations, **page/paragraph level** for PDFs, and **section level** for DOCX/Markdown.
   - Every chunk retains: `{ id, fileId, subjectId, fileName, slideNumber, pageNumber, heading, content, tokenCount }`.
4. **Auto-Topic Discovery:**
   - When slides or documents contain clear section titles, Edvora automatically creates initial syllabus topics to populate the course hierarchy.

---

## 2. RAG & Source-Grounded Retrieval Engine

1. **Strict Metadata Isolation:**
   - Every search query or AI request enforces metadata scoping (`subjectId`, `fileId`, `slideNumber`, `slideRange`).
   - Chunks from unrelated subjects are never mixed into the context window.
2. **Hybrid BM25 Scoring:**
   - Tokenizes query terms, computes term frequencies ($TF$), inverse document frequencies ($IDF$), and document length normalization.
   - Boosts matches found in slide titles and section headings.
3. **Citations Extraction:**
   - Deduplicates referenced chunks and extracts clean inline citations: `[Doc: File.pptx, Slide 4]`.
4. **Honest AI Boundary Guard:**
   - If no chunks match the query within the selected subject, the AI informs the student immediately rather than synthesizing fictional information.

---

## 3. Database & Persistence Layer

The application utilizes an atomic, asynchronous JSON persistence store with memory caching in `server/data/edvora_db.json`.

### Core Schemas:
- **`subjects`**: Course name, description, color, icon, creation timestamp.
- **`files`**: Document metadata, file size, status (`uploaded`, `processing`, `processed`, `error`), slide count, page count, chunk count.
- **`topics`**: Topic name, unit association, status (`not_started`, `in_progress`, `studied`, `understood`, `needs_revision`), last studied timestamp.
- **`chunks`**: Granular extracted text chunks with exact slide and page coordinates.
- **`notes`**: AI-generated and user-editable study notes with source references.
- **`quizzes`**: Generated assessments, question types, difficulty, time limit, questions array.
- **`quiz_attempts`**: Student submissions, score, percentage, question-by-question evaluations, identified weak and strong concepts.
- **`flashcards`**: Front/back concepts with spaced repetition status (`new`, `learning`, `known`, `difficult`) and review counts.
- **`study_tasks`**: Target dates, priorities, and completion states.
- **`activity_logs`**: Chronological academic activity feed.
- **`settings`**: AI model selection, provider preferences, and encrypted/masked API keys.

### Atomic Write Guarantees:
- Database writes are executed via write queues and written to temporary files before atomic rename (`fs.renameSync` / `fs.promises.rename`).
- Ensures zero file corruption even in the event of sudden process termination.

---

## 4. Visual Learning Engine

Edvora integrates Mermaid.js to render concept frameworks dynamically:
- **Flowcharts (`flowchart TD` / `flowchart LR`):** For product development cycles, customer journeys, and decision trees.
- **Concept Maps & Mindmaps:** For hierarchical topic breakdowns.
- **Tables & Formula Breakdowns:** Rendered alongside mathematical notations for financial and quantitative product metrics.
