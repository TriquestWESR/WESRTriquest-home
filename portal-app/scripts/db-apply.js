/* tiny helper to print the SQL for manual apply in Supabase SQL editor */
import fs from 'fs';
const main = () => {
  const core = fs.readFileSync('./db/schema.sql','utf8');
  console.log('-- CORE -------------------------------------');
  console.log(core);
  
  if (fs.existsSync('./db/migrations')) {
    const migs = fs.readdirSync('./db/migrations').sort();
    for (const f of migs) {
      const sql = fs.readFileSync(`./db/migrations/${f}`,'utf8');
      console.log(`\n-- MIGRATION: ${f} --------------------------`);
      console.log(sql);
    }
  }
};
main();
