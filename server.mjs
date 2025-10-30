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

// Ask API with OpenAI
app.post('/api/ask', async (req, res) => {
  try {
    const question = (req.body?.question || '').trim();
    if (!question) return res.status(400).json({ error: 'Empty question' });
    if (!index.length) return res.status(400).json({ error: 'no-index' });

    // Import OpenAI dynamically
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Check if we have embeddings
    const haveEmbeddings = index[0]?.embedding && Array.isArray(index[0].embedding);
    
    let scored = [];
    if (haveEmbeddings) {
      // Use semantic search with embeddings
      const emb = await openai.embeddings.create({ 
        model: 'text-embedding-3-large', 
        input: question 
      });
      const qvec = emb.data[0].embedding;
      
      // Cosine similarity
      const cosine = (a, b) => {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) { 
          dot += a[i] * b[i]; 
          na += a[i] * a[i]; 
          nb += b[i] * b[i]; 
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
      };
      
      scored = index.map((ch) => ({ ch, score: cosine(qvec, ch.embedding) }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 8)
                    .map(x => x.ch);
    } else {
      // Lexical fallback (no embeddings)
      const terms = [...new Set(question.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))];
      scored = index.map(ch => {
        const t = (ch.text || '').toLowerCase();
        let s = 0;
        for (const term of terms) if (t.includes(term)) s += 1;
        return { ch, score: s };
      }).filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(x => x.ch);
      
      if (!scored.length) scored = index.slice(0, 8);
    }

    // Build context
    const context = scored.map((c, i) => `【${i + 1}】DOC:${c.title} ${c.version ? `(v${c.version})` : ''} ${c.updated ? `[${c.updated}]` : ''} ${c.section ? `<${c.section}>` : ''}
URL: ${c.href || '#'}
TEXT:
${c.text}`).join('\n\n');

    const system = `You are WESR's rules lexicon assistant. Answer ONLY from the provided CONTEXT.
- If the answer is not in CONTEXT, say you don't have enough information and point to the Combined Rulebook.
- Be concise and step-by-step for workflows (e.g., LOTO).
- ALWAYS cite sources using [1], [2], etc., with links.`;

    const user = `Question: ${question}\n\nCONTEXT:\n${context}`;

    // Call OpenAI
    let answer = '';
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      });
      answer = completion.choices?.[0]?.message?.content?.trim() || '';
    } catch (err) {
      const code = err?.code || err?.error?.code;
      if (code === 'insufficient_quota') {
        return res.status(402).json({ 
          error: 'insufficient_quota', 
          message: 'OpenAI quota exceeded. Build index lexically and view sources; ask is temporarily unavailable.' 
        });
      }
      throw err;
    }

    if (!answer) answer = 'No answer';

    // Extract citations
    const citeNums = [...new Set((answer.match(/\[(\d+)\]/g) || [])
      .map(x => parseInt(x.replace(/\[|\]/g, ''), 10))
      .filter(n => n >= 1 && n <= scored.length))];
    
    const citations = citeNums.map(n => {
      const c = scored[n - 1];
      return { 
        title: c.title, 
        href: c.href || '#', 
        label: `${c.title}${c.section ? ` — ${c.section}` : ''}` 
      };
    });

    const answerHtml = answer.replace(/\n/g, '<br>');
    res.json({ answerHtml, citations });
  } catch (e) {
    console.error('Ask API error:', e);
    res.status(500).json({ error: 'ask-failed', message: e.message });
  }
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