import fs from 'fs';

const idx = JSON.parse(fs.readFileSync('./data/index.json', 'utf8'));

// Get all COHE chunks
const cohe = idx.filter(c => c.title.includes('COHE'));

console.log(`\n📄 WESR-COHE Analysis:`);
console.log(`   Total chunks: ${cohe.length}`);

// Search for LOTO (case insensitive)
const withLoto = cohe.filter(c => {
  const text = (c.text || '').toLowerCase();
  const title = (c.title || '').toLowerCase();
  const section = (c.section || '').toLowerCase();
  return text.includes('loto') || title.includes('loto') || section.includes('loto');
});

console.log(`   Chunks with "LOTO": ${withLoto.length}\n`);

if (withLoto.length > 0) {
  console.log('✅ LOTO found in COHE:\n');
  withLoto.forEach((c, i) => {
    console.log(`   ${i + 1}. Section: ${c.section || '(no section)'}`);
    // Find the position of LOTO in the text
    const lotoPos = c.text.toLowerCase().indexOf('loto');
    if (lotoPos >= 0) {
      const start = Math.max(0, lotoPos - 50);
      const end = Math.min(c.text.length, lotoPos + 100);
      const preview = c.text.substring(start, end).replace(/\s+/g, ' ').trim();
      console.log(`      Context: ...${preview}...`);
    }
    console.log('');
  });
} else {
  console.log('❌ "LOTO" does not appear in the COHE document chunks.');
  console.log('\n💡 However, COHE is about "Control of Hazardous Energy" which');
  console.log('   is the full name for LOTO (Lockout/Tagout).');
  console.log('\n   First chunk preview:');
  if (cohe.length > 0) {
    console.log(`   ${cohe[0].text.substring(0, 200)}...`);
  }
}

console.log('\n');
