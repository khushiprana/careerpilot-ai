# 🚀 CareerPilot AI — Personal AI Career Coach 

**CareerPilot AI** is an all-in-one, full-stack career development platform powered by Google Gemini AI. It transforms raw resumes and job descriptions into actionable insights, tailored learning roadmaps, ATS match scores, mock interview simulations, custom cover letters, and targeted project recommendations.

**Live Application:**
https://careerpilot-ai-hazel-nine.vercel.app/
---

## ✨ Features

- **📄 AI Resume Reviewer & Auditor**
  - Section-by-section breakdown (Impact, Formatting, Clarity, Action Verbs).
  - Overall strength score and tailored improvement recommendations.
  - Support for entry-level, mid-level, and senior target roles.

- **🎯 ATS Match & Keyword Gap Checker**
  - Instant ATS Compatibility Score (0–100%) against specific Job Descriptions.
  - Hard vs. Soft Skills missing keyword matrix.
  - Actionable bullet-point rewrite suggestions tailored to pass ATS filters.

- **🗺️ Personalized Career Roadmaps**
  - Milestone-based learning paths customized to your skill level.
  - Weekly breakdowns, key focus topics, estimated timelines, and recommended learning resources.

- **🎙️ AI Mock Interview Coach**
  - Role-specific behavioral, technical, and situational interview questions.
  - Real-time AI evaluation using the STAR method (Situation, Task, Action, Result).
  - Sample high-scoring answer breakdowns.

- **✉️ Dynamic Cover Letter Generator**
  - Generates highly personalized, job-specific cover letters using your actual resume content.
  - Adjustable tone (Professional, Energetic, Executive, Creative).

- **💡 Tailored Portfolio Project Generator**
  - Project ideas engineered specifically to fill skill gaps in your profile for target job roles.
  - Complete with architecture overviews, tech stacks, key features, and resume bullet descriptions.

- **💬 Interactive Career Chat Assistant**
  - Real-time conversational AI coach for salary negotiation, career pivot strategies, and resume polish tips.

- **📄 Native PDF Resume Extraction**
  - Dual-mode extraction engine: Uses Google Gemini Multimodal PDF parsing with an automatic `pdf-parse` fallback for maximum reliability.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React Icons, Motion (Framer Motion)
- **Backend**: Express.js (Node.js), `tsx`, `esbuild`
- **AI Engine**: Google Gemini API (`@google/genai` SDK using `gemini-2.5-flash`)
- **File Upload**: Multer, Gemini Multimodal PDF Parser, `pdf-parse`
- **Type Safety**: TypeScript

---

## 📁 Repository Structure

```
.
├── api/                       # Vercel / Serverless API routes
│   ├── _lib/
│   │   └── gemini.ts          # Centralized Gemini AI client & fallback helper
│   ├── extract-pdf.ts         # PDF uploading & multimodal text extraction
│   ├── resume-review.ts       # Resume analysis endpoint
│   ├── ats-check.ts           # ATS matching endpoint
│   ├── roadmap.ts             # Learning roadmap generation endpoint
│   ├── interview.ts           # Interview coach endpoint
│   ├── cover-letter.ts        # Cover letter generator endpoint
│   ├── project-suggestion.ts  # Portfolio project recommender endpoint
│   └── chat.ts                # Career AI chat endpoint
├── src/                       # React Frontend Application
│   ├── components/            # UI components (Navbar, Footer, ResumeUploader, etc.)
│   ├── pages/                 # Full feature views (Dashboard, ResumeReview, ATS, etc.)
│   ├── services/              # Client-side API service methods
│   ├── data/                  # Sample resume presets
│   ├── utils/                 # PDF Export & Helper utilities
│   └── types.ts               # Shared TypeScript interface definitions
├── server.ts                  # Local/Cloud Run Express production & dev server
├── vite.config.ts             # Vite configuration
├── package.json               # Scripts & npm dependencies
├── .env.example               # Environment variables template
└── README.md                  # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** or **bun**
- A **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/careerpilot-ai.git
   cd careerpilot-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your API key:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 🏗️ Build & Production Deployment

To build the application for production:

```bash
npm run build
```

This will:
1. Compile the React frontend static assets into `/dist`.
2. Bundle `server.ts` using `esbuild` into `/dist/server.cjs`.

To start the production server:

```bash
npm start
```

---

## 🔒 Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `GEMINI_API_KEY` | API Key for accessing Google Gemini models (`gemini-2.5-flash`) | Yes |
| `APP_URL` | Base public URL of the application | Optional |

---

## Author

Khushi Rana
Computer Engineering Student | AI & Technology
