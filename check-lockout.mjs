import fs from 'fs';

const idx = JSON.parse(fs.readFileSync('./data/index.json', 'utf8'));

console.log('\n🔍 Searching for "logout" vs "lockout":\n');

// Search for "logout" (what you're typing)
const logout = idx.filter(c => {
  const text = (c.text || '').toLowerCase();
  return text.includes('logout');
});

// Search for "lockout" (what's actually in the docs)
const lockout = idx.filter(c => {
  const text = (c.text || '').toLowerCase();
  return text.includes('lockout');
});

console.log(`   "logout" (what you typed): ${logout.length} results ❌`);
console.log(`   "lockout" (correct term): ${lockout.length} results ✅\n`);

if (lockout.length > 0) {
  console.log('📄 "lockout" appears in these documents:\n');
  const byDoc = {};
  lockout.forEach(c => {
    byDoc[c.title] = (byDoc[c.title] || 0) + 1;
  });
  
  Object.entries(byDoc).sort((a,b) => b[1] - a[1]).forEach(([title, count]) => {
    console.log(`   ${count.toString().padStart(2)} results: ${title}`);
  });
}

console.log('\n💡 TIP: Search for "lockout" (with a K) not "logout"\n');
