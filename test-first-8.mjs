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

// Simulate the search for "COHE" - exactly as server does
const q = normalize('COHE');
const results = [];

for (const ch of idx) {
  const hay = normalize(`${ch.title || ''} ${ch.section || ''} ${ch.text || ''}`);
  let hitIndex = hay.indexOf(q);
  if (hitIndex >= 0) {
    const src = ch.text || '';
    const start = Math.max(0, hitIndex - 80);
    const end = Math.min(hay.length, hitIndex + 220);
    const snippet = normalize(src).slice(start, end).replace(/\s+/g,' ').trim() || (src.slice(0, 240) + (src.length > 240 ? '…' : ''));
    results.push({ 
      title: ch.title, 
      docId: ch.docId, 
      section: ch.section || '', 
      snippet, 
      href: ch.href || '#' 
    });
  }
}

// Server returns up to 20, but frontend displays only 8
const serverReturns = results.slice(0, 20);
const frontendDisplays = serverReturns.slice(0, 8);

console.log(`\n🔍 Search for "COHE":`);
console.log(`   Total matches: ${results.length}`);
console.log(`   Server returns: ${serverReturns.length} (max 20)`);
console.log(`   Frontend displays: ${frontendDisplays.length} (max 8)\n`);

console.log(`📺 You would see these 8 results in the browser:\n`);
frontendDisplays.forEach((r, i) => {
  const coheDoc = r.title.includes('COHE');
  const marker = coheDoc ? '✅ COHE!' : '';
  console.log(`   ${i + 1}. ${r.title} ${marker}`);
});

// Check if WESR-COHE appears in the first 8
const coheInFirst8 = frontendDisplays.some(r => r.title.includes('COHE'));
console.log(`\n${coheInFirst8 ? '✅' : '❌'} WESR-COHE document ${coheInFirst8 ? 'IS' : 'is NOT'} in the first 8 results\n`);
