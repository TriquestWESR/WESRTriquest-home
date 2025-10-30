import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const DATA_DIR = path.resolve(__dirname, 'data');
const INDEX_PATH = path.resolve(DATA_DIR, 'index.json');

// Serve static assets
const app = globalThis.app || express();
app.use?.(express.json({ limit: '2mb' }));
app.use(express.static(PUBLIC_DIR));

// Load index (if your server doesn’t already)
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

// Optional simple health check (for Render)
app.get('/health', (_req, res) => res.type('text/plain').send('ok'));

// Listen on Render’s PORT
const PORT = Number(process.env.PORT || 8787);
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`WESR rules server on http://${HOST}:${PORT}`);
});

export default app;