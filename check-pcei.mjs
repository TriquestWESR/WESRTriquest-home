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

// Search for "PCEI"
const q = normalize('PCEI');
const results = [];

console.log(`\n🔍 Searching for "PCEI"...\n`);

for (const ch of idx) {
  const hay = normalize(`${ch.title || ''} ${ch.section || ''} ${ch.text || ''}`);
  let hitIndex = hay.indexOf(q);
  if (hitIndex >= 0) {
    results.push({ 
      title: ch.title,
      section: ch.section || '',
      docId: ch.docId
    });
  }
}

console.log(`   Total results: ${results.length}\n`);

// Group by document
const byDoc = {};
results.forEach(r => {
  byDoc[r.title] = (byDoc[r.title] || 0) + 1;
});

console.log('📄 Results by document:\n');
Object.entries(byDoc).sort((a,b) => b[1] - a[1]).forEach(([title, count]) => {
  const isLV = title.includes('LV-OPS') || title.includes('LV‑OPS');
  console.log(`   ${count.toString().padStart(2)} results: ${title} ${isLV ? '✅ THIS IS LV-OPS!' : ''}`);
});

// Check LV-OPS specifically
const lvOpsResults = results.filter(r => r.title.includes('LV-OPS') || r.title.includes('LV‑OPS'));
console.log(`\n${lvOpsResults.length > 0 ? '✅' : '❌'} LV-OPS has ${lvOpsResults.length} results for "PCEI"\n`);

if (lvOpsResults.length === 0) {
  console.log('💡 "PCEI" does NOT appear in the LV-OPS document.');
  console.log('   This is expected if LV-OPS uses different role terminology.\n');
  
  // Check what roles ARE in LV-OPS
  const lvOps = idx.filter(c => c.title.includes('LV-OPS') || c.title.includes('LV‑OPS'));
  const roleTerms = ['PCEI', 'PCWA', 'competent', 'authorized', 'person in charge', 'responsible person'];
  
  console.log('🔍 Role terms in LV-OPS:\n');
  roleTerms.forEach(term => {
    const count = lvOps.filter(c => normalize(c.text).includes(normalize(term))).length;
    if (count > 0) {
      console.log(`   ✓ "${term}": ${count} chunks`);
    }
  });
}

console.log('\n');
