import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, 'data');
const INDEX_PATH = path.resolve(DATA_DIR, 'index.json');

// Create Express app
const app = express();
app.use(express.json());

// Serve static files from root directory (serves index.html, styles.css, etc.)
app.use(express.static(__dirname));

// Load index synchronously to avoid top-level await issues
let index = [];
try {
  const txt = fs.readFileSync(INDEX_PATH, 'utf8');
  index = JSON.parse(txt);
  console.log(`Loaded index with ${index.length} chunks`);
} catch (err) {
  console.error('Failed to load index.json:', err.message);
  index = [];
}

// Search API
app.get('/api/search', (req, res) => {
  const qRaw = (req.query.q || '').toString();
  const q = qRaw.toLowerCase().trim();
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  const results = [];
  for (const chunk of index) {
    const title = chunk.title || '';
    const section = chunk.section || '';
    const text = chunk.text || '';
    const searchText = `${title} ${section} ${text}`.toLowerCase();
    
    if (searchText.includes(q)) {
      // Score: prioritize title matches
      const score = title.toLowerCase().includes(q) ? 100 : 1;
      
      // Generate snippet
      const snippetStart = Math.max(0, text.toLowerCase().indexOf(q) - 80);
      const snippet = text.slice(snippetStart, snippetStart + 240).trim() + '…';
      
      results.push({
        title,
        section,
        snippet,
        href: chunk.href || '#',
        docId: chunk.docId || '',
        _score: score
      });
    }
  }
  
  // Sort by score, then title
  results.sort((a, b) => (b._score - a._score) || a.title.localeCompare(b.title));
  
  // Return array (frontend expects this)
  res.json(results.map(({ _score, ...rest }) => rest));
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

console.log(`Starting server on ${HOST}:${PORT}...`);
console.log(`Static files served from: ${__dirname}`);
console.log(`Index loaded: ${index.length} chunks`);

app.listen(PORT, HOST, () => {
  console.log(`✅ WESR rules server live at http://${HOST}:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});