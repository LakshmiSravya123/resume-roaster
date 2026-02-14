import React from 'react';

function getScoreClass(score, max = 100) {
  const pct = max === 10 ? score * 10 : score;
  if (pct >= 70) return 'good';
  if (pct >= 40) return 'ok';
  return 'bad';
}

export default function Results({ data, onReset }) {
  const { analysis } = data;

  return (
    <div className="results">
      {/* Roast */}
      <div className="roast-card">
        <p className="roast-text">🔥 "{analysis.roast}"</p>
      </div>

      {/* Scores */}
      <div className="score-section">
        <div className="score-card">
          <div className={`score-number ${getScoreClass(analysis.overallScore)}`}>
            {analysis.overallScore}
          </div>
          <div className="score-label">Overall Score</div>
        </div>
        <div className="score-card">
          <div className={`score-number ${getScoreClass(analysis.atsScore)}`}>
            {analysis.atsScore}
          </div>
          <div className="score-label">ATS Compatibility</div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="list-card">
        <h3>💪 Strengths</h3>
        <ul className="strengths">
          {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div className="list-card">
        <h3>⚠️ Weaknesses</h3>
        <ul className="weaknesses">
          {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>

      {/* Section Breakdown */}
      <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1.2rem' }}>📊 Section Breakdown</h3>
      {Object.entries(analysis.sections).map(([key, section]) => (
        <div className="section-card" key={key}>
          <h3>
            {formatSectionName(key)}
            <span className={`section-score ${getScoreClass(section.score, 10)}`}>
              {section.score}/10
            </span>
          </h3>
          <p>{section.feedback}</p>
        </div>
      ))}

      {/* ATS Tips */}
      <div className="list-card">
        <h3>🎯 ATS Tips</h3>
        <ul className="ats-tips">
          {analysis.atsTips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>

      {/* Improved Summary */}
      <div className="improved-summary">
        <h3>✨ Improved Professional Summary</h3>
        <p>{analysis.improvedSummary}</p>
      </div>

      {/* Action Items */}
      <div className="list-card">
        <h3>📋 Action Items</h3>
        <ul className="action-items">
          {analysis.actionItems.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <button className="reset-btn" onClick={onReset}>
        🔄 Roast Another Resume
      </button>
    </div>
  );
}

function formatSectionName(key) {
  const names = {
    contactInfo: '📧 Contact Info',
    summary: '📝 Summary',
    experience: '💼 Experience',
    skills: '🛠️ Skills',
    education: '🎓 Education',
    formatting: '🎨 Formatting',
  };
  return names[key] || key;
}
