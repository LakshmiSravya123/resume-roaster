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
cp .env.example .env     # Add your ANTHROPIC_API_KEY
npm install
npm start                # Runs on port 3001

# Frontend
cd frontend
npm install
npm run dev              # Runs on port 3000
```

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Express.js
- **AI**: Claude API (Anthropic)
- **File Parsing**: pdf-parse

## API Endpoints

- `POST /api/resume/upload` - Upload resume file
- `POST /api/resume/text` - Analyze pasted text
- `GET /api/health` - Health check
