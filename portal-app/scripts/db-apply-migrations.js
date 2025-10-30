/* print only migration SQL for manual apply in Supabase SQL editor */
import fs from 'fs';

const main = () => {
  if (!fs.existsSync('./db/migrations')) {
    console.log('-- No migrations folder found.');
    return;
  }
  const migs = fs.readdirSync('./db/migrations').sort();
  for (const f of migs) {
    const sql = fs.readFileSync(`./db/migrations/${f}`,'utf8');
    console.log(`-- MIGRATION: ${f} --------------------------`);
    console.log(sql);
    console.log();
  }
};
main();
