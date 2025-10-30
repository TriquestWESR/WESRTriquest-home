import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const DATA_DIR = path.resolve(__dirname, 'data');
const INDEX_PATH = path.resolve(DATA_DIR, 'index.json');

// Serve static files from public, assets, and docs
app.use(express.static(PUBLIC_DIR));
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
app.use('/docs', express.static(path.resolve(__dirname, 'docs')));
app.use('/styles.css', express.static(path.resolve(__dirname, 'styles.css')));

// Serve HTML files from root
app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/files.html', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'files.html'));
});

app.get('/training.html', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'training.html'));
});

// Load index
let index = [];
async function loadIndex() {
  try {
    const txt = await fs.readFile(INDEX_PATH, 'utf8');
    index = JSON.parse(txt);
    console.log(`Loaded index with ${index.length} chunks from ${INDEX_PATH}`);
  } catch (err) {
    console.error('Failed to load index.json:', err.message);
    index = [];
  }
}
await loadIndex();

// Search API
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) {
    return res.json({ results: [] });
  }
  
  const results = index
    .filter(chunk => 
      chunk.text.toLowerCase().includes(q) || 
      chunk.file.toLowerCase().includes(q)
    )
    .map(chunk => ({
      ...chunk,
      score: chunk.file.toLowerCase().includes(q) ? 10 : 1
    }))
    .sort((a, b) => b.score - a.score);
  
  res.json({ results });
});

// Ask API (if you have OpenAI configured)
app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }
  
  // Placeholder - implement your OpenAI logic here if needed
  res.json({ 
    answer: 'AI Q&A not yet configured. Please implement OpenAI integration.',
    answerHtml: '<p>AI Q&A not yet configured. Please implement OpenAI integration.</p>'
  });
});

// Health check
app.get('/health', (_req, res) => res.type('text/plain').send('ok'));

// Listen
const PORT = Number(process.env.PORT || 8787);
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`WESR rules server on http://${HOST}:${PORT}`);
});