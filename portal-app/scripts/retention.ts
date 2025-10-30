import fs from 'fs'
import path from 'path'

const OUTDIR = path.join(process.cwd(), 'backups')

function listDirs(): string[] {
  if(!fs.existsSync(OUTDIR)) return []
  return fs.readdirSync(OUTDIR).filter(d => fs.statSync(path.join(OUTDIR,d)).isDirectory())
}

function classify(ts: Date){
  return {
    day: ts.toISOString().slice(0,10),        // YYYY-MM-DD
    week: `${ts.getUTCFullYear()}-W${Math.ceil((ts.getUTCDate() + ((new Date(Date.UTC(ts.getUTCFullYear(),0,1)).getUTCDay()||7))-1)/7)}`,
    month: ts.toISOString().slice(0,7)        // YYYY-MM
  }
}

function keepPolicy(names:string[]){
  const keep = new Set<string>()
  const seenDay = new Set<string>(), seenWeek = new Set<string>(), seenMonth = new Set<string>()
  // newest first
  const sorted = names.sort((a,b)=> (a>b? -1: 1))
  for (const n of sorted){
    const ts = new Date(n.replace(/-/g,':'))
    if (isNaN(ts.getTime())) continue
    const c = classify(ts)
    if (seenDay.size < 14 && !seenDay.has(c.day)){ seenDay.add(c.day); keep.add(n); continue }
    if (seenWeek.size < 12 && !seenWeek.has(c.week)){ seenWeek.add(c.week); keep.add(n); continue }
    if (seenMonth.size < 12 && !seenMonth.has(c.month)){ seenMonth.add(c.month); keep.add(n); continue }
  }
  return keep
}

function main(){
  const names = listDirs()
  const keep = keepPolicy(names)
  for (const n of names){
    if (!keep.has(n)){
      fs.rmSync(path.join(OUTDIR,n), { recursive:true, force:true })
      console.log('Deleted old backup', n)
    }
  }
  console.log('Retention pass complete. Kept', keep.size, 'snapshots')
}
main()
