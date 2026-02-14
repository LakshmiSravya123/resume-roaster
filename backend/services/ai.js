const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.AI_MODEL || 'llama3.2:3b';

const ROAST_LEVELS = {
  mild: 'Be constructive and encouraging, but point out areas for improvement gently.',
  medium: 'Be direct and honest. Don\'t sugarcoat issues but remain professional. Use some humor.',
  savage: 'Be brutally honest with sharp wit. Roast the weak points hard, but still provide actionable advice. Think Gordon Ramsay reviewing a resume.'
};

async function callAI(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
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
