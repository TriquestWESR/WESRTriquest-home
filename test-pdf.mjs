import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const pdfMod = require('pdf-parse');
const pdf = pdfMod.default || pdfMod;

const DOCS_DIR = path.resolve('docs');
const pdfs = fs.readdirSync(DOCS_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));

console.log(`Found ${pdfs.length} PDFs:\n`);

for (const file of pdfs) {
  try {
    const filePath = path.join(DOCS_DIR, file);
    const buf = fs.readFileSync(filePath);
    const data = await pdf(buf);
    const text = (data.text || '').replace(/\r/g, '').trim();
    console.log(`✓ ${file}`);
    console.log(`  Pages: ${data.numpages}, Text length: ${text.length} chars`);
    
    // Count sections
    const sections = text.split(/\n(?=[A-Z0-9][A-Z0-9.\-\s]{3,}\n)/g);
    console.log(`  Sections detected: ${sections.length}`);
    
    // Estimate chunks
    let chunkCount = 0;
    for (const sec of sections) {
      const lines = sec.split('\n').filter(Boolean);
      const body = lines.slice(1).join('\n');
      const numChunks = Math.ceil(body.length / 3000);
      chunkCount += Math.max(1, numChunks);
    }
    console.log(`  Estimated chunks: ${chunkCount}\n`);
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}\n`);
  }
}
