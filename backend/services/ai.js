// Multi-provider AI: Groq (free cloud) → Ollama (local) fallback
// Groq: Free, no credit card, get key at https://console.groq.com/keys
// Ollama: Free, local, install from https://ollama.com

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

async function callAI(prompt) {
  // Try Groq first (cloud - works for everyone)
  if (GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content;
    }
    console.warn('Groq failed, falling back to Ollama...');
  }

  // Fallback to Ollama (local)
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  });
  if (!res.ok) throw new Error('Both Groq and Ollama failed. Set GROQ_API_KEY or start Ollama.');
  const data = await res.json();
  return data.response;
}

function parseJSON(text) {
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response');
  }
}

const ROAST_LEVELS = {
  mild: 'Be constructive and encouraging, but point out areas for improvement gently.',
  medium: 'Be direct and honest. Don\'t sugarcoat issues but remain professional. Use some humor.',
  savage: 'Be brutally honest with sharp wit. Roast the weak points hard, but still provide actionable advice. Think Gordon Ramsay reviewing a resume.'
};

async function analyzeResume(resumeText, targetRole, roastLevel) {
  const roastStyle = ROAST_LEVELS[roastLevel] || ROAST_LEVELS.medium;

  const text = await callAI(`You are Resume Roaster, an expert career coach and resume reviewer.

TARGET ROLE: ${targetRole}
ROAST LEVEL: ${roastLevel}
STYLE: ${roastStyle}

Analyze this resume and respond in EXACTLY this JSON format:
{
  "overallScore": <number 1-100>,
  "roast": "<A 2-3 sentence roast/first impression of the resume>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "sections": {
    "contactInfo": { "score": <1-10>, "feedback": "<feedback>" },
    "summary": { "score": <1-10>, "feedback": "<feedback>" },
    "experience": { "score": <1-10>, "feedback": "<feedback>" },
    "skills": { "score": <1-10>, "feedback": "<feedback>" },
    "education": { "score": <1-10>, "feedback": "<feedback>" },
    "formatting": { "score": <1-10>, "feedback": "<feedback>" }
  },
  "atsScore": <number 1-100>,
  "atsTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "improvedSummary": "<A rewritten professional summary for this person>",
  "actionItems": ["<action 1>", "<action 2>", "<action 3>", "<action 4>", "<action 5>"]
}

RESUME:
${resumeText}

Respond with ONLY valid JSON, no markdown, no explanation.`);

  return parseJSON(text);
}

module.exports = { analyzeResume };
