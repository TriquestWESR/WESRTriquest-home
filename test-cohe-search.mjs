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

// Simulate the search for "COHE"
const q = normalize('COHE');
const results = [];

console.log(`\n🔍 Searching for "COHE"...\n`);

for (const ch of idx) {
  const hay = normalize(`${ch.title || ''} ${ch.section || ''} ${ch.text || ''}`);
  if (hay.includes(q)) {
    results.push({
      title: ch.title,
      section: ch.section || '',
      snippet: ch.text.substring(0, 100).replace(/\s+/g, ' ').trim()
    });
  }
}

console.log(`Found ${results.length} results:\n`);

// Group by document
const byDoc = {};
results.forEach(r => {
  if (!byDoc[r.title]) byDoc[r.title] = [];
  byDoc[r.title].push(r);
});

Object.entries(byDoc).forEach(([title, items]) => {
  console.log(`📄 ${title}`);
  console.log(`   ${items.length} results\n`);
});

// Check specifically the COHE document title
console.log('\n🔍 Checking COHE document itself:\n');
const coheDoc = idx.filter(c => c.title.includes('COHE'));
console.log(`   COHE document has ${coheDoc.length} chunks`);
console.log(`   Title: "${coheDoc[0]?.title}"`);
console.log(`   Title normalized: "${normalize(coheDoc[0]?.title)}"`);

// Check if "cohe" appears in text
const coheInText = coheDoc.filter(c => normalize(c.text).includes('cohe'));
console.log(`   Chunks with "cohe" in text: ${coheInText.length}`);

if (coheInText.length > 0) {
  console.log(`\n   First occurrence:`);
  const firstMatch = coheInText[0];
  const pos = normalize(firstMatch.text).indexOf('cohe');
  console.log(`   Position in text: ${pos}`);
  console.log(`   Context: ${firstMatch.text.substring(Math.max(0, pos-20), pos+50)}`);
}

console.log('\n');
