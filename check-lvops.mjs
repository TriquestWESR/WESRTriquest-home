import fs from 'fs';

const idx = JSON.parse(fs.readFileSync('./data/index.json', 'utf8'));

function normalize(s = '') {
  return s
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check what's in LV-OPS
const lvOps = idx.filter(c => c.title.includes('LV-OPS') || c.title.includes('LV‑OPS'));

console.log(`\n📄 WESR-LV-OPS Analysis:`);
console.log(`   Total chunks: ${lvOps.length}`);
console.log(`   Title: "${lvOps[0]?.title}"\n`);

// Test various search terms in LV-OPS
const testTerms = ['isolation', 'voltage', 'verification', 'permit', 'LOTO', 'testing', 'measurement'];

console.log('🔍 Search term coverage in LV-OPS:\n');
testTerms.forEach(term => {
  const matches = lvOps.filter(c => normalize(c.text).includes(normalize(term)));
  console.log(`   "${term}": ${matches.length} chunks`);
});

// Now test a full search simulation for "isolation"
console.log('\n\n📊 Full search simulation for "isolation":\n');

const q = normalize('isolation');
const results = [];

for (const ch of idx) {
  const hay = normalize(`${ch.title || ''} ${ch.section || ''} ${ch.text || ''}`);
  let hitIndex = hay.indexOf(q);
  if (hitIndex >= 0) {
    results.push({ 
      title: ch.title,
      section: ch.section || ''
    });
  }
}

// Group by document
const byDoc = {};
results.forEach(r => {
  byDoc[r.title] = (byDoc[r.title] || 0) + 1;
});

console.log(`   Total results: ${results.length}\n`);
Object.entries(byDoc).sort((a,b) => b[1] - a[1]).forEach(([title, count]) => {
  const isLV = title.includes('LV-OPS') || title.includes('LV‑OPS');
  console.log(`   ${count.toString().padStart(2)} results: ${title} ${isLV ? '✅ LV-OPS' : ''}`);
});

console.log('\n');
