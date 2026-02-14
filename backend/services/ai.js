const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const ROAST_LEVELS = {
  mild: 'Be constructive and encouraging, but point out areas for improvement gently.',
  medium: 'Be direct and honest. Don\'t sugarcoat issues but remain professional. Use some humor.',
  savage: 'Be brutally honest with sharp wit. Roast the weak points hard, but still provide actionable advice. Think Gordon Ramsay reviewing a resume.'
};

async function analyzeResume(resumeText, targetRole, roastLevel) {
  const roastStyle = ROAST_LEVELS[roastLevel] || ROAST_LEVELS.medium;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `You are Resume Roaster, an expert career coach and resume reviewer.

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

Respond with ONLY valid JSON, no markdown.`
      }
    ]
  });

  const text = message.content[0].text.trim();

  try {
    return JSON.parse(text);
  } catch {
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response');
  }
}

module.exports = { analyzeResume };
