import fs from 'fs';

const idx = JSON.parse(fs.readFileSync('./data/index.json', 'utf8'));

// Get all COHE chunks
const cohe = idx.filter(c => c.title.includes('COHE'));

console.log(`\n📄 WESR-COHE Document Keywords:\n`);

// Check for various related terms
const terms = ['lockout', 'lock out', 'tagout', 'tag out', 'loto', 'isolation', 'hazardous energy', 'cohe'];

terms.forEach(term => {
  const count = cohe.filter(c => {
    const text = (c.text || '').toLowerCase();
    return text.includes(term.toLowerCase());
  }).length;
  
  if (count > 0) {
    console.log(`   ✓ "${term}": found in ${count} chunks`);
  } else {
    console.log(`   ✗ "${term}": not found`);
  }
});

console.log(`\n📝 Sample text from COHE (first chunk):\n`);
if (cohe.length > 0) {
  const sample = cohe[0].text.substring(0, 400).replace(/\s+/g, ' ').trim();
  console.log(`   ${sample}...`);
}

console.log('\n');
