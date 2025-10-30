import fs from 'fs';

const idx = JSON.parse(fs.readFileSync('./data/index.json', 'utf8'));
const counts = {};

idx.forEach(c => {
  counts[c.title] = (counts[c.title] || 0) + 1;
});

console.log('\n📊 Chunks per document:\n');
Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([title, count]) => {
    console.log(`  ${count.toString().padStart(3)} chunks: ${title}`);
  });

console.log(`\n✓ Total: ${idx.length} chunks from ${Object.keys(counts).length} documents\n`);

// Check for LOTO references
const lotoChunks = idx.filter(c => 
  (c.text || '').toLowerCase().includes('loto') || 
  (c.title || '').toLowerCase().includes('loto') ||
  (c.section || '').toLowerCase().includes('loto')
);

console.log(`🔍 LOTO appears in ${lotoChunks.length} chunks`);

// Group LOTO chunks by document
const lotoByDoc = {};
lotoChunks.forEach(c => {
  lotoByDoc[c.title] = (lotoByDoc[c.title] || 0) + 1;
});

console.log('\n📄 LOTO references by document:\n');
Object.entries(lotoByDoc)
  .sort((a, b) => b[1] - a[1])
  .forEach(([title, count]) => {
    console.log(`  ${count.toString().padStart(2)} references: ${title}`);
  });
console.log('');
