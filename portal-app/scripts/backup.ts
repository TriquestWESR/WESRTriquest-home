import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

const OUTDIR = path.join(process.cwd(), 'backups')

const TABLES = [
  'admin_config',
  'providers',
  'provider_users',
  'roles',
  'tr_sections',
  'questions',
  'classes',
  'attempts',
  'certificates',
  'billing_usage',
  'override_logs',
  'audit_logs'
]

async function main(){
  const cs = process.env.PG_CONNECTION_STRING
  if(!cs) throw new Error('PG_CONNECTION_STRING missing in .env')
  const client = new Client({ connectionString: cs })
  await client.connect()

  const ts = new Date().toISOString().replace(/[:.]/g,'-')
  const dir = path.join(OUTDIR, ts)
  fs.mkdirSync(dir, { recursive: true })

  for (const t of TABLES){
    const res: any = await client.query(`select * from ${t}`)
    const json = JSON.stringify(res.rows, null, 2)
    fs.writeFileSync(path.join(dir, `${t}.json`), json, 'utf8')
    // quick CSV
  const cols: string[] = res.fields.map((f: any)=>f.name)
  const csv = [cols.join(','), ...res.rows.map((r: any) => cols.map((c: string) => {
      const v = (r as any)[c]
      if (v===null || v===undefined) return ''
      if (Array.isArray(v) || typeof v === 'object') return JSON.stringify(v).replace(/"/g,'""')
      return String(v).replace(/"/g,'""')
  }).map((x: string) => /[",\n]/.test(x) ? `"${x}"` : x).join(','))].join('\n')
    fs.writeFileSync(path.join(dir, `${t}.csv`), csv, 'utf8')
  }

  await client.end()
  console.log('Backup written to', dir)
}
main().catch(e=>{ console.error(e); process.exit(1) })
