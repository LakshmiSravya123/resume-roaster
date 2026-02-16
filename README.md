---
title: Resume Roaster
emoji: 🔥
colorFrom: red
colorTo: yellow
sdk: docker
pinned: false
---

# Resume Roaster

AI-powered resume feedback tool. Upload your resume, get brutally honest feedback + actionable improvements.

## Features

- **File Upload** - Drag & drop PDF or TXT resumes
- **Paste Text** - Or paste resume content directly
- **3 Roast Levels** - Mild, Medium, Savage
- **Overall Score** - 1-100 rating
- **ATS Score** - Applicant Tracking System compatibility check
- **Section Breakdown** - Detailed feedback on Contact, Summary, Experience, Skills, Education, Formatting
- **Improved Summary** - AI-rewritten professional summary
- **Action Items** - Specific steps to improve your resume

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm start                # Runs on port 3001

# Frontend
cd frontend
npm install
npm run dev              # Runs on port 5174
```

### AI Setup (choose one - both are FREE)

| Provider | Best For | Setup |
|----------|----------|-------|
| **Groq** (cloud) | Deployment, sharing | Get free key at [console.groq.com/keys](https://console.groq.com/keys), add `GROQ_API_KEY` to `.env` |
| **Ollama** (local) | Development, offline | Install from [ollama.com](https://ollama.com), run `ollama pull llama3.2:3b` |

If both are configured, Groq is used first with Ollama as fallback.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Express.js
- **AI**: Groq (cloud) / Ollama (local) - both free, no paid API needed
- **File Parsing**: pdf-parse

## API Endpoints

- `POST /api/resume/upload` - Upload resume file
- `POST /api/resume/text` - Analyze pasted text
- `GET /api/health` - Health check
