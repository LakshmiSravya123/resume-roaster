import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadZone({ onSubmit, loading }) {
  const [file, setFile] = useState(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [roastLevel, setRoastLevel] = useState('medium');

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setPasteMode(false);
      setResumeText('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = () => {
    if (pasteMode && resumeText.trim().length >= 50) {
      onSubmit({ type: 'text', resumeText, targetRole, roastLevel });
    } else if (file) {
      onSubmit({ type: 'file', file, targetRole, roastLevel });
    }
  };

  const canSubmit = (file || (pasteMode && resumeText.trim().length >= 50)) && !loading;

  return (
    <div className="upload-section">
      {!pasteMode && (
        <>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone-icon">📄</div>
            <h3>Drop your resume here</h3>
            <p>or click to browse (PDF, TXT - max 5MB)</p>
          </div>

          {file && (
            <div className="file-info">
              <span className="file-icon">📎</span>
              <span className="file-name">{file.name}</span>
              <button className="file-remove" onClick={() => setFile(null)}>✕</button>
            </div>
          )}
        </>
      )}

      {pasteMode && (
        <textarea
          className="paste-area"
          placeholder="Paste your resume text here (minimum 50 characters)..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
      )}

      <div className="paste-toggle">
        <button onClick={() => { setPasteMode(!pasteMode); setFile(null); }}>
          {pasteMode ? '📄 Upload file instead' : '📋 Or paste resume text'}
        </button>
      </div>

      <div className="options">
        <div className="option-group">
          <label>Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Software Engineer"
          />
        </div>
        <div className="option-group">
          <label>Roast Level</label>
          <select value={roastLevel} onChange={(e) => setRoastLevel(e.target.value)}>
            <option value="mild">🌶️ Mild - Gentle feedback</option>
            <option value="medium">🌶️🌶️ Medium - Direct and honest</option>
            <option value="savage">🌶️🌶️🌶️ Savage - No mercy</option>
          </select>
        </div>
      </div>

      <button className="submit-btn" disabled={!canSubmit} onClick={handleSubmit}>
        {loading ? 'Roasting your resume...' : '🔥 Roast My Resume'}
      </button>
    </div>
  );
}
