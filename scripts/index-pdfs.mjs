import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Robust pdf-parse loader (CJS/ESM)
const pdfMod = require('pdf-parse');
const pdf = pdfMod.default || pdfMod;

if (!process.env.OPENAI_API_KEY || !/^sk-[A-Za-z0-9_-]{10,}/.test(process.env.OPENAI_API_KEY)) {
  console.error('OPENAI_API_KEY missing/invalid. Put your full key in .env (supports sk-... and sk-proj-...).');
  process.exit(1);
}

const DOCS_DIR = path.resolve('docs');
const OUT_DIR = path.resolve('data');
const OUT_FILE = path.join(OUT_DIR, 'index.json');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function chunkText(txt, maxChars = 3000, overlap = 300) {
  const chunks = [];
  let i = 0;
  while (i < txt.length) {
    const end = Math.min(txt.length, i + maxChars);
    chunks.push(txt.slice(i, end));
    if (end === txt.length) break;
    i = Math.max(0, end - overlap);
  }
  return chunks;
}

function inferMeta(filePath) {
  const fileName = path.basename(filePath);
  const base = fileName.replace(/\.pdf$/i, '');
  return {
    docId: base.toLowerCase(),
    title: base.replace(/_/g,' ').trim(),
    // Link directly to the actual PDF we serve from /docs
    href: `/docs/${encodeURIComponent(fileName)}`
  };
}

// PDF -> text
async function processPdf(filePath) {
  const buf = fs.readFileSync(filePath);
  const data = await pdf(buf);
  const text = (data.text || '').replace(/\r/g, '').trim();
  const { docId, title, href } = inferMeta(filePath);

  const sections = text.split(/\n(?=[A-Z0-9][A-Z0-9.\-\s]{3,}\n)/g);
  const out = [];
  for (const sec of sections) {
    const lines = sec.split('\n').filter(Boolean);
    const sectionTitle = lines[0]?.trim().slice(0, 120);
    const body = lines.slice(1).join('\n');
    for (const piece of chunkText(body)) {
      out.push({ docId, title, section: sectionTitle, text: piece, href });
    }
  }
  return out;
}

// Embeddings
async function embedAll(chunks) {
  const BATCH = 80;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const slice = chunks.slice(i, i + BATCH);
    const resp = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: slice.map(c => `${c.title}\n${c.section || ''}\n${c.text}`)
    });
    resp.data.forEach((d, j) => { slice[j].embedding = d.embedding; });
    console.log(`Embedded ${Math.min(i + BATCH, chunks.length)} / ${chunks.length}`);
  }
}

// Write output
(async () => {
  const NO_EMBED = process.argv.includes('--no-embed');
  const pdfs = fs.readdirSync(DOCS_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  if (!pdfs.length) { console.error('No PDFs in /docs'); process.exit(1); }
  const all = [];
  for (const f of pdfs) {
    console.log('Parsing', f);
    const items = await processPdf(path.join(DOCS_DIR, f));
    all.push(...items);
  }
  if (!NO_EMBED) {
    try {
      await embedAll(all);
    } catch (err) {
      console.error('Embedding failed:', err?.code || err?.message || err);
      console.error('Writing lexical-only index (no embeddings). You can re-run with billing enabled or use --no-embed explicitly.');
    }
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify(all, null, 2), 'utf8');
  console.log('Wrote', OUT_FILE, 'chunks:', all.length, NO_EMBED ? '(no embeddings)' : (all[0]?.embedding ? '(with embeddings)' : '(no embeddings)'));
})();