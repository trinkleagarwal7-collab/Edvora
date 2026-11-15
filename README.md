# Edvora — Personal AI-Powered MBA Learning Management System

> **Edvora** is a dedicated, intelligent academic learning platform built specifically for MBA students specialising in Product Management. It acts as your personal AI professor, academic library, examination preparation assistant, and intelligent revision partner.

---

## Core Philosophy: Your Uploaded Material is the Source of Truth

Edvora is strictly an academic platform with **zero fictional data** or pre-seeded fake lectures. All AI explanations, diagrams, quizzes, flashcards, and progress tracking are grounded 100% in the actual academic materials you upload (faculty PPTs, PDFs, lecture handouts, Word documents, and notes).

- **Slide & Page Citations:** Every AI answer and quiz explanation references the exact file name, slide number, or page number.
- **Honest Academic Boundaries:** If a concept is not present in your uploaded materials, Edvora states so directly rather than hallucinating.
- **Strict Academic Scope:** Dedicated exclusively to MBA academics, frameworks, quantitative formulas, and exam prep.

---

## Key Features

1. **Academic Library & Subject Workspace (`My Courses`)**
   - Create and organize your MBA subjects (e.g., *Product Strategy*, *Customer Analytics*, *Managerial Economics*).
   - Drag-and-drop multi-file uploader supporting **PDF**, **PPT/PPTX**, **DOC/DOCX**, **TXT**, **Markdown**, and **ZIP** archives up to 50MB.
   - Structure-aware extraction preserving slide numbers, speaker notes, PDF pages, tables, and section headings.
   - Safe archive extraction with strict path traversal guards.
   - Preview extracted slide and page chunks directly.

2. **Personal AI Professor (`AI Study Room`)**
   - **ELI15 Mode:** Explains complex frameworks in simple terms using intuitive product analogies (e.g., Spotify, Uber, Netflix).
   - **Detailed MBA Mode:** Rigorous analytical explanations, academic terminology, strategic implications, and formulas.
   - **Exam Preparation Mode:** High-yield definitions, structured 5-mark and 10-mark points, and potential exam questions.
   - **Learning Scope Selector:** Select entire subject, specific document, specific slide, or slide range (e.g., Slides 4–15).
   - **Visual Learning Engine:** Renders dynamic Mermaid flowcharts, concept maps, mind maps, and frameworks.
   - **AI-Generated Study Notes:** One-click note synthesis with verified citations, editable and saved permanently.

3. **Practice & Revision (`AI Quiz Engine & Flashcards`)**
   - Source-grounded quiz generator with custom question counts (3–20) and difficulty levels (Easy, Medium, Difficult, Mixed).
   - Supports Multiple Choice, True/False, and Conceptual Short Answer questions.
   - Timed exam simulation or untimed practice mode.
   - Detailed rubric grading with correct answers, explanations, and slide citations.
   - Interactive 3D flip flashcards with spaced repetition status (*New*, *Learning*, *Known*, *Difficult*).

4. **Intelligent Academic Progress Tracking (`My Progress`)**
   - Overall syllabus mastery percentage and average quiz performance.
   - Subject-wise progress bars and topic status tracking (*Not Started*, *In Progress*, *Studied*, *Understood*, *Needs Revision*).
   - **Weak Topic Detection Hub:** Real-time identification of weak concepts based on quiz errors and revision flags, with one-click "Revise with AI" shortcuts.
   - Integrated **Personal Study Planner** to schedule revision tasks before exams.

5. **Global Academic Assistant & Instant Search**
   - Context-aware slide-out assistant accessible across any screen in Edvora.
   - Global spotlight search (`⌘K` / `Ctrl+K`) searching subjects, files, slide text chunks, saved notes, and flashcards.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Mermaid.js, Canvas-Confetti.
- **Backend:** Node.js, Express, Multer, Fast-XML-Parser, PDF-Parse, Mammoth, Adm-Zip.
- **Database & Storage:** Atomic JSON ACID persistence with transaction queuing and safe disk storage.
- **AI Integration:** Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-pro`) and OpenAI API (`gpt-4o-mini` / `gpt-4o`), with built-in grounded local academic extraction fallback.

---

## Installation and Setup

### Prerequisites
- Node.js (v20.x or higher) and npm installed.

### 1. Install Dependencies
```bash
# Install root, backend and frontend dependencies
npm run install:all
```

### 2. Build the Frontend
```bash
npm run build
```

### 3. Start the Server
```bash
npm start
```
The application will be live at **http://localhost:5001**.

---

## Environment Variables & AI Configuration

You can configure your AI API key either via `.env` or directly through the in-app **Settings & API Keys** dialog (accessible from the sidebar).

Create a `.env` file in `server/.env`:
```env
PORT=5001
# Optional: Set via environment or in Edvora UI Settings
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Getting a Free Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com).
2. Click **Create API Key**.
3. Open Edvora in your browser, click **Settings & API Keys** in the sidebar, paste your key, and click **Test Connection** to verify!

---

## First-Time User Journey

1. Open **http://localhost:5001** in your browser.
2. Read the welcoming onboarding modal and click **Create My First Subject**.
3. Enter your course name (e.g. *Product Strategy*).
4. Click **Upload Materials** and drag & drop your faculty PPTX slides or PDF lecture notes.
5. Head over to **AI Study Room** to understand difficult concepts in **ELI15** mode.
6. Open **Practice & Revision** to test yourself with a custom grounded quiz before your MBA examinations!
