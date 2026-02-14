const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function extractText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  // For .doc/.docx, read as text (basic fallback)
  return fs.readFileSync(filePath, 'utf-8');
}

module.exports = { extractText };
