import React, { useState } from 'react';
import { transformResume } from '../utils/api';

function getScoreClass(score, max = 100) {
  const pct = max === 10 ? score * 10 : score;
  if (pct >= 70) return 'good';
  if (pct >= 40) return 'ok';
  return 'bad';
}

function getVerdictClass(verdict) {
  if (verdict === 'Interview Ready') return 'verdict-good';
  if (verdict === 'Needs Work') return 'verdict-ok';
  return 'verdict-bad';
}

export default function Results({ data, onReset }) {
  const { analysis, resumeText } = data;
  const [activeTab, setActiveTab] = useState('analysis');
  const [transformation, setTransformation] = useState(null);
  const [transforming, setTransforming] = useState(false);
  const [transformError, setTransformError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTransform = async () => {
    setTransforming(true);
    setTransformError('');
    try {
      const res = await transformResume(resumeText, data.targetRole || 'Software Engineer');
      setTransformation(res.transformation);
      setActiveTab('transform');
    } catch (err) {
      setTransformError(err.message);
    } finally {
      setTransforming(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="results">
      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
        >
          Keywords
        </button>
        <button
          className={`tab-btn ${activeTab === 'rewrites' ? 'active' : ''}`}
          onClick={() => setActiveTab('rewrites')}
        >
          Bullet Rewrites
        </button>
        <button
          className={`tab-btn transform-tab ${activeTab === 'transform' ? 'active' : ''}`}
          onClick={() => {
            if (!transformation && !transforming) {
              handleTransform();
            } else {
              setActiveTab('transform');
            }
          }}
        >
          {transforming ? 'Transforming...' : 'Transform Resume'}
        </button>
      </div>

      {/* ==================== ANALYSIS TAB ==================== */}
      {activeTab === 'analysis' && (
        <>
          {/* Verdict Banner */}
          {analysis.verdict && (
            <div className={`verdict-banner ${getVerdictClass(analysis.verdict)}`}>
              <span className="verdict-text">{analysis.verdict}</span>
            </div>
          )}

          {/* Roast */}
          <div className="roast-card">
            <p className="roast-text">"{analysis.roast}"</p>
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
              <div className="score-label">ATS Score</div>
            </div>
          </div>

          {/* Industry Benchmark */}
          {analysis.industryBenchmark && (
            <div className="benchmark-card">
              <h3>Industry Benchmark</h3>
              <p>{analysis.industryBenchmark}</p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="sw-grid">
            <div className="list-card">
              <h3>Strengths</h3>
              <ul className="strengths">
                {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="list-card">
              <h3>Weaknesses</h3>
              <ul className="weaknesses">
                {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>

          {/* Section Breakdown */}
          <h3 className="section-heading">Section Breakdown</h3>
          {analysis.sections && Object.entries(analysis.sections).map(([key, section]) => (
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
            <h3>ATS Optimization Tips</h3>
            <ul className="ats-tips">
              {analysis.atsTips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>

          {/* Improved Summary */}
          <div className="improved-summary">
            <h3>Rewritten Professional Summary</h3>
            <p>{analysis.improvedSummary}</p>
            <button className="copy-btn" onClick={() => handleCopy(analysis.improvedSummary)}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Action Items */}
          <div className="list-card action-card">
            <h3>Priority Action Items</h3>
            <ol className="action-items">
              {analysis.actionItems.map((a, i) => <li key={i}>{a}</li>)}
            </ol>
          </div>
        </>
      )}

      {/* ==================== KEYWORDS TAB ==================== */}
      {activeTab === 'keywords' && analysis.keywordAnalysis && (
        <>
          <div className="keyword-section">
            <h3 className="section-heading">Keyword Analysis for {data.targetRole || 'Target Role'}</h3>

            <div className="keyword-grid">
              <div className="keyword-card found">
                <h4>Keywords Found</h4>
                <div className="keyword-tags">
                  {analysis.keywordAnalysis.found.map((k, i) => (
                    <span className="keyword-tag found" key={i}>{k}</span>
                  ))}
                </div>
              </div>

              <div className="keyword-card missing">
                <h4>Missing Keywords</h4>
                <div className="keyword-tags">
                  {analysis.keywordAnalysis.missing.map((k, i) => (
                    <span className="keyword-tag missing" key={i}>{k}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="keyword-suggestion">
              <h4>Recommendation</h4>
              <p>{analysis.keywordAnalysis.suggestion}</p>
            </div>
          </div>

          {/* Section keyword score */}
          {analysis.sections?.keywords && (
            <div className="section-card">
              <h3>
                Keyword Match Score
                <span className={`section-score ${getScoreClass(analysis.sections.keywords.score, 10)}`}>
                  {analysis.sections.keywords.score}/10
                </span>
              </h3>
              <p>{analysis.sections.keywords.feedback}</p>
            </div>
          )}
        </>
      )}

      {/* ==================== REWRITES TAB ==================== */}
      {activeTab === 'rewrites' && analysis.bulletRewrites && (
        <>
          <h3 className="section-heading">Before & After Bullet Rewrites</h3>
          <p className="section-subtitle">See how your bullet points should be written using the STAR method with quantified impact.</p>

          {analysis.bulletRewrites.map((item, i) => (
            <div className="rewrite-card" key={i}>
              <div className="rewrite-before">
                <span className="rewrite-label bad-label">BEFORE</span>
                <p>{item.original}</p>
              </div>
              <div className="rewrite-arrow">&#8595;</div>
              <div className="rewrite-after">
                <span className="rewrite-label good-label">AFTER</span>
                <p>{item.improved}</p>
              </div>
              <div className="rewrite-why">
                <strong>Why:</strong> {item.why}
              </div>
              <button className="copy-btn small" onClick={() => handleCopy(item.improved)}>
                {copied ? 'Copied!' : 'Copy improved version'}
              </button>
            </div>
          ))}
        </>
      )}

      {/* ==================== TRANSFORM TAB ==================== */}
      {activeTab === 'transform' && (
        <>
          {transforming && (
            <div className="transform-loading">
              <div className="loading-spinner" />
              <p>AI is rewriting your entire resume with professional standards...</p>
              <p className="loading-sub">This may take 15-30 seconds</p>
            </div>
          )}

          {transformError && (
            <div className="transform-error">
              <p>{transformError}</p>
              <button className="retry-btn" onClick={handleTransform}>Retry</button>
            </div>
          )}

          {transformation && (
            <>
              {/* Score Comparison */}
              <div className="transform-scores">
                <div className="transform-score-card">
                  <div className={`score-number ${getScoreClass(transformation.beforeAfterScore.before)}`}>
                    {transformation.beforeAfterScore.before}
                  </div>
                  <div className="score-label">Before</div>
                </div>
                <div className="transform-arrow">&#8594;</div>
                <div className="transform-score-card">
                  <div className={`score-number ${getScoreClass(transformation.beforeAfterScore.after)}`}>
                    {transformation.beforeAfterScore.after}
                  </div>
                  <div className="score-label">After</div>
                </div>
              </div>

              {/* Recruiter Note */}
              <div className="recruiter-note">
                <h4>Recruiter's Perspective</h4>
                <p>{transformation.recruiterNote}</p>
              </div>

              {/* Changes Summary */}
              <div className="list-card">
                <h3>What Changed</h3>
                <ul className="changes-list">
                  {transformation.changesSummary.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              {/* Transformed Resume */}
              <div className="transformed-resume">
                <div className="transformed-header">
                  <h3>Your Transformed Resume</h3>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(transformation.transformedResume)}
                  >
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
                <pre className="resume-text">
                  {transformation.transformedResume}
                </pre>
              </div>
            </>
          )}
        </>
      )}

      <button className="reset-btn" onClick={onReset}>
        Roast Another Resume
      </button>
    </div>
  );
}

function formatSectionName(key) {
  const names = {
    contactInfo: 'Contact Info',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    skills: 'Skills & Technologies',
    education: 'Education',
    formatting: 'Formatting & Layout',
    keywords: 'Keyword Optimization',
  };
  return names[key] || key;
}
