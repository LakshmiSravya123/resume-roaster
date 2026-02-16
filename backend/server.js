const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const resumeRoutes = require('./routes/resume');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/resume', resumeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'resume-roaster' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Resume Roaster API running on port ${PORT}`);
});
