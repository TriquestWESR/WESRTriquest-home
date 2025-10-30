const express = require('express');
const path = require('path');
const fs = require('fs');

// Lightweight CJS server kept for compatibility. Prefer server.mjs for full features.
const app = express();
const HOST = process.env.HOST || '127.0.0.1';
let PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '2mb' }));
// Serve the whole site and explicit mounts
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// ---- Index loading (supports both array and {documents:[]}) ----
const INDEX_PATH = path.join(__dirname, 'data', 'index.json');
let INDEX = [];
try {
  if (fs.existsSync(INDEX_PATH)) {
    const raw = fs.readFileSync(INDEX_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) INDEX = parsed;
    else if (parsed && Array.isArray(parsed.documents)) INDEX = parsed.documents;
    console.log(`Search index loaded (${INDEX.length} chunks)`);
  } else {
    console.warn('No index found at data/index.json');
  }
} catch (e) {
  console.error('Error loading search index:', e?.message || e);
  INDEX = [];
}

// ---- Helpers ----
function normalize(s = '') {
  return s
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---- /api/search (returns array of rows) ----
app.get('/api/search', (req, res) => {
  const qRaw = (req.query.q || '').toString();
  const q = normalize(qRaw);
  if (!q) return res.json([]);

  const terms = [...new Set(q.split(/[^a-z0-9]+/).filter(Boolean))];
  const results = [];
  for (const ch of INDEX) {
    const hay = normalize(`${ch.title || ''} ${ch.section || ''} ${ch.text || ''}`);
    let hitIndex = hay.indexOf(q);
    let matched = hitIndex >= 0;
    if (!matched && terms.length > 1) {
      let score = 0; for (const t of terms) if (hay.includes(t)) score++;
      matched = score >= Math.max(1, Math.ceil(terms.length * 0.6));
      if (matched) hitIndex = Math.min(...terms.map(t => hay.indexOf(t)).filter(i => i >= 0));
    }
    if (matched) {
      const src = ch.text || '';
      const nsrc = normalize(src);
      const start = Math.max(0, hitIndex - 80);
      const end = Math.min(nsrc.length, hitIndex + 220);
      const snippet = nsrc.slice(start, end).replace(/\s+/g,' ').trim() || (src.slice(0, 240) + (src.length > 240 ? '…' : ''));
      results.push({ title: ch.title, docId: ch.docId, section: ch.section || '', snippet, href: ch.href || '#' });
    }
  }
  res.json(results.slice(0, 20));
});

// ---- /api/ask (lexical fallback only) ----
app.get('/api/ask', (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) return res.status(400).json({ error: 'Query parameter required' });
  if (!INDEX.length) return res.status(400).json({ error: 'no-index' });

  const terms = [...new Set(q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))];
  const scored = INDEX.map(ch => {
    const t = (ch.text || '').toLowerCase();
    let s = 0; for (const term of terms) if (t.includes(term)) s += 1;
    return { ch, score: s };
  }).filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, 5).map(x => x.ch);

  const answer = scored.length
    ? 'Here are relevant extracts from the WESR rules:'
    : 'No exact matches. Try a different phrasing (e.g., LOTO, permit, verification).';
  const citations = scored.map(c => ({ title: c.title, href: c.href || '#', label: `${c.title}${c.section?` — ${c.section}`:''}` }));
  res.json({ answer, citations });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, index: INDEX.length });
});

function tryListen(p, attemptsLeft = 5) {
  const srv = app.listen(p, HOST, () => {
    console.log(`CJS server running at http://${HOST}:${p}`);
  });
  srv.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      const next = p + 1;
      console.warn(`Port ${p} in use, retrying on ${next}...`);
      tryListen(next, attemptsLeft - 1);
    } else {
      console.error('Server start failed:', err && err.message ? err.message : err);
      process.exit(1);
    }
  });
}

tryListen(PORT);