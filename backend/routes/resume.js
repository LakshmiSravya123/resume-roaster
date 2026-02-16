const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeResume, transformResume } = require('../services/ai');
const { extractText } = require('../services/parser');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, DOC, and DOCX files are allowed'));
    }
  }
});

// POST /api/resume/upload - Upload and analyze resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const targetRole = req.body.targetRole || 'Software Engineer';
    const roastLevel = req.body.roastLevel || 'medium';

    const resumeText = await extractText(req.file.path, req.file.originalname);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract enough text from the file' });
    }

    const analysis = await analyzeResume(resumeText, targetRole, roastLevel);

    res.json({
      success: true,
      filename: req.file.originalname,
      resumeText,
      analysis
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze resume' });
  }
});

// POST /api/resume/text - Analyze pasted resume text
router.post('/text', async (req, res) => {
  try {
    const { resumeText, targetRole, roastLevel } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text must be at least 50 characters' });
    }

    const analysis = await analyzeResume(
      resumeText,
      targetRole || 'Software Engineer',
      roastLevel || 'medium'
    );

    res.json({
      success: true,
      resumeText,
      analysis
    });
  } catch (err) {
    console.error('Text analysis error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze resume' });
  }
});

// POST /api/resume/transform - Transform resume into professional version
router.post('/transform', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text must be at least 50 characters' });
    }

    const transformation = await transformResume(
      resumeText,
      targetRole || 'Software Engineer'
    );

    res.json({
      success: true,
      transformation
    });
  } catch (err) {
    console.error('Transform error:', err);
    res.status(500).json({ error: err.message || 'Failed to transform resume' });
  }
});

module.exports = router;
