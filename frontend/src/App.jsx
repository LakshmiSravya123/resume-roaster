import React, { useState } from 'react';
import UploadZone from './components/UploadZone';
import Results from './components/Results';
import Loading from './components/Loading';
import { uploadResume, analyzeText } from './utils/api';

export default function App() {
  const [state, setState] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async ({ type, file, resumeText, targetRole, roastLevel }) => {
    setState('loading');
    setError('');

    try {
      let data;
      if (type === 'file') {
        data = await uploadResume(file, targetRole, roastLevel);
      } else {
        data = await analyzeText(resumeText, targetRole, roastLevel);
      }
      data.targetRole = targetRole;
      setResults(data);
      setState('results');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setResults(null);
    setError('');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Resume Roaster</h1>
        <p>Upload your resume. Get elite-level AI feedback based on Harvard & FAANG standards.</p>
      </header>

      {state === 'idle' && (
        <UploadZone onSubmit={handleSubmit} loading={false} />
      )}

      {state === 'loading' && <Loading />}

      {state === 'error' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--danger)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            {error}
          </p>
          <button className="reset-btn" onClick={handleReset}>Try Again</button>
        </div>
      )}

      {state === 'results' && results && (
        <Results data={results} onReset={handleReset} />
      )}
    </div>
  );
}
