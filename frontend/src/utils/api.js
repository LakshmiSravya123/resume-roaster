const API_BASE = '/api/resume';

export async function uploadResume(file, targetRole, roastLevel) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('targetRole', targetRole);
  formData.append('roastLevel', roastLevel);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

export async function analyzeText(resumeText, targetRole, roastLevel) {
  const res = await fetch(`${API_BASE}/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, targetRole, roastLevel }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Analysis failed');
  }

  return res.json();
}
