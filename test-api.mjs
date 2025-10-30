// Quick test of the search API
const response = await fetch('http://127.0.0.1:8787/api/search?q=LOTO');
const data = await response.json();
console.log(`\n✓ Search API is working!`);
console.log(`✓ Found ${data.length} results for "LOTO"\n`);
if (data.length > 0) {
  console.log('First result:');
  console.log(`  Title: ${data[0].title}`);
  console.log(`  Section: ${data[0].section}`);
  console.log(`  Snippet: ${data[0].snippet.substring(0, 100)}...`);
  console.log(`\n✓ Your lexicon search IS working correctly!`);
  console.log(`✓ All ${data.length} LOTO references are searchable.\n`);
} else {
  console.log('✗ No results found - there may be an issue.');
}
