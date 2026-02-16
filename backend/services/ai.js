// Multi-provider AI: Groq (free cloud) -> Ollama (local) fallback
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

async function callAI(prompt, temperature = 0.7) {
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
        temperature,
        max_tokens: 4096,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content;
    }
    console.warn('Groq failed, falling back to Ollama...');
  }

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

  const text = await callAI(`You are an elite resume analyst combining expertise from Harvard Career Services, Google recruiters, and Fortune 500 hiring managers. You evaluate resumes against the highest industry standards.

TARGET ROLE: ${targetRole}
ROAST LEVEL: ${roastLevel}
STYLE: ${roastStyle}

EVALUATION CRITERIA (use these rigorously):

1. QUANTIFIED ACHIEVEMENTS: Every bullet should have numbers (%, $, #). "Managed team" is weak. "Led 12-person team delivering $2.4M project 3 weeks ahead of schedule" is strong.

2. ACTION VERBS: Strong verbs (Architected, Spearheaded, Orchestrated, Pioneered) vs weak (Helped, Worked on, Responsible for, Assisted).

3. STAR METHOD: Situation-Task-Action-Result. Each bullet should show impact, not just duties.

4. ATS OPTIMIZATION: Standard section headers, no tables/columns/graphics references, keyword density for the target role, standard fonts implied, proper formatting.

5. HARVARD RESUME STANDARDS:
   - One page for <10 years experience, two pages max for senior
   - Reverse chronological order
   - Consistent date formatting
   - No personal pronouns (I, me, my)
   - No generic objectives - use targeted summary
   - Education section placement (recent grads: top; experienced: bottom)

6. GOOGLE/FAANG STANDARDS:
   - Impact-driven bullets (X accomplished Y by doing Z, resulting in W)
   - Technical depth with business context
   - Leadership signals even in IC roles
   - Cross-functional collaboration evidence

7. KEYWORD OPTIMIZATION: Does the resume contain the right keywords for ${targetRole}? Check for missing critical skills, certifications, and industry terms.

Analyze this resume thoroughly and respond in EXACTLY this JSON format:
{
  "overallScore": <number 1-100>,
  "roast": "<A 3-4 sentence roast/first impression. Be specific about THIS resume, not generic.>",
  "verdict": "<one of: 'Interview Ready', 'Needs Work', 'Major Rewrite Needed', 'Start Over'>",
  "strengths": ["<strength 1 - be specific>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1 - be specific with examples from the resume>", "<weakness 2>", "<weakness 3>", "<weakness 4>"],
  "sections": {
    "contactInfo": { "score": <1-10>, "feedback": "<specific feedback>" },
    "summary": { "score": <1-10>, "feedback": "<Does it have a targeted summary? Is it generic or compelling?>" },
    "experience": { "score": <1-10>, "feedback": "<Are bullets quantified? Action verbs? STAR method? Impact shown?>" },
    "skills": { "score": <1-10>, "feedback": "<Relevant to target role? Organized? Missing key skills?>" },
    "education": { "score": <1-10>, "feedback": "<Placement correct? Relevant details? GPA if recent grad?>" },
    "formatting": { "score": <1-10>, "feedback": "<Consistent? Clean? Scannable? Appropriate length?>" },
    "keywords": { "score": <1-10>, "feedback": "<How well does it match ${targetRole} keywords?>" }
  },
  "atsScore": <number 1-100>,
  "atsTips": ["<specific ATS tip 1>", "<tip 2>", "<tip 3>", "<tip 4>"],
  "keywordAnalysis": {
    "found": ["<keywords from resume that match ${targetRole}>"],
    "missing": ["<critical keywords for ${targetRole} NOT in the resume>"],
    "suggestion": "<1-2 sentence recommendation for keyword improvement>"
  },
  "bulletRewrites": [
    {
      "original": "<copy an actual weak bullet from the resume>",
      "improved": "<rewrite it with quantified impact, strong verb, STAR method>",
      "why": "<1 sentence explaining what changed>"
    },
    {
      "original": "<another weak bullet>",
      "improved": "<rewritten version>",
      "why": "<explanation>"
    },
    {
      "original": "<another weak bullet>",
      "improved": "<rewritten version>",
      "why": "<explanation>"
    }
  ],
  "improvedSummary": "<A compelling 3-4 sentence professional summary tailored for ${targetRole}. Use specific skills and achievements from the resume.>",
  "actionItems": [
    "<Priority 1: most impactful change>",
    "<Priority 2>",
    "<Priority 3>",
    "<Priority 4>",
    "<Priority 5>",
    "<Priority 6>"
  ],
  "industryBenchmark": "<How does this resume compare to typical ${targetRole} resumes? What percentile would you place it in?>"
}

RESUME:
${resumeText}

Respond with ONLY valid JSON, no markdown, no explanation.`, 0.7);

  return parseJSON(text);
}

async function transformResume(resumeText, targetRole) {
  const text = await callAI(`You are a world-class professional resume writer who has written resumes for Fortune 500 executives, FAANG engineers, and top consultants. You follow Harvard Career Services guidelines and modern ATS best practices.

Your task: Take the resume below and COMPLETELY REWRITE it into a polished, professional, ATS-optimized resume targeted for the role of "${targetRole}".

TRANSFORMATION RULES:

1. FORMAT: Use clean, ATS-friendly plain text format with clear section headers.

2. PROFESSIONAL SUMMARY (3-4 lines):
   - Start with years of experience + core expertise
   - Include 2-3 key achievements with numbers
   - End with value proposition for ${targetRole}

3. EXPERIENCE SECTION:
   - Each role: Company Name | Title | Location | Date Range
   - 3-5 bullet points per role
   - Every bullet MUST follow: "[Strong Action Verb] [what you did] [quantified result]"
   - If original has no numbers, estimate reasonable metrics based on context
   - Use power verbs: Architected, Spearheaded, Orchestrated, Optimized, Accelerated, Delivered, Transformed, Pioneered
   - Remove all weak phrases: "Responsible for", "Helped with", "Worked on", "Assisted in"

4. SKILLS SECTION:
   - Organize into categories (Technical Skills, Tools & Platforms, Soft Skills/Leadership)
   - Prioritize skills most relevant to ${targetRole}
   - Add industry-standard keywords for ${targetRole} that the person likely has but didn't mention

5. EDUCATION:
   - Keep concise
   - Add relevant coursework/honors only if recent graduate

6. OPTIONAL SECTIONS (add if relevant content exists):
   - Certifications & Training
   - Projects (for tech roles)
   - Publications/Presentations (for research/senior roles)

Return EXACTLY this JSON:
{
  "transformedResume": "<The complete rewritten resume in clean plain text. Use \\n for newlines. Use CAPS for section headers. Use bullet points (- ) for items.>",
  "changesSummary": [
    "<Change 1: What was improved and why>",
    "<Change 2>",
    "<Change 3>",
    "<Change 4>",
    "<Change 5>"
  ],
  "beforeAfterScore": {
    "before": <estimated score 1-100 of original>,
    "after": <estimated score 1-100 of transformed version>
  },
  "recruiterNote": "<A 2-3 sentence note from the perspective of a recruiter at a top company explaining what makes the new version stronger>"
}

ORIGINAL RESUME:
${resumeText}

Respond with ONLY valid JSON, no markdown, no explanation.`, 0.6);

  return parseJSON(text);
}

module.exports = { analyzeResume, transformResume };
