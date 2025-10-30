/* tiny helper to print the SQL for manual apply in Supabase SQL editor */
import fs from 'fs'; const sql=fs.readFileSync('./db/schema.sql','utf8'); console.log(sql);
