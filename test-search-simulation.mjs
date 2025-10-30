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

// Simulate the search for "LOTO"
const q = normalize('LOTO');
const results = [];

for (const ch of idx) {
  const hay = normalize(`${ch.title || ''} ${ch.section || ''} ${ch.text || ''}`);
  if (hay.includes(q)) {
    results.push({
      title: ch.title,
      section: ch.section || '',
      docId: ch.docId
    });
  }
}

console.log(`\n🔍 Search for "LOTO" found ${results.length} results:\n`);

// Group by document
const byDoc = {};
results.forEach(r => {
  if (!byDoc[r.title]) byDoc[r.title] = [];
  byDoc[r.title].push(r);
});

Object.entries(byDoc).forEach(([title, items]) => {
  console.log(`\n📄 ${title} (${items.length} results)`);
  items.slice(0, 3).forEach((item, i) => {
    console.log(`   ${i + 1}. Section: ${item.section || '(no section)'}`);
  });
  if (items.length > 3) {
    console.log(`   ... and ${items.length - 3} more`);
  }
});

console.log(`\n✅ Search should return all ${results.length} chunks to the browser.\n`);
