import React, { useState, useEffect } from 'react';

const messages = [
  "Reading your resume...",
  "Judging your career choices...",
  "Counting buzzwords...",
  "Checking for Comic Sans...",
  "Evaluating your 'proficient in Microsoft Office'...",
  "Comparing to 10,000 other resumes...",
  "Preparing the roast...",
  "This is going to be good...",
];

export default function Loading() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading">
      <div className="loading-spinner" />
      <p className="loading-messages">{messages[msgIndex]}</p>
    </div>
  );
}
