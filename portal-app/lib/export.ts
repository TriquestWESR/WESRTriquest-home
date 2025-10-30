"use client"
export function toCSV(rows: any[], headers?: string[]): string {
  if (!rows || rows.length === 0) return ''
  const keys = headers || Array.from(new Set(rows.flatMap(r => Object.keys(r))))
  const esc = (v:any) => {
    const s = v==null ? '' : String(v)
    const needsQuote = s.includes('"') || s.includes(',') || s.includes('\n')
    return needsQuote ? '"' + s.replace(/"/g,'""') + '"' : s
  }
  const lines = [keys.join(',')]
  for (const r of rows) lines.push(keys.map(k => esc(r[k])).join(','))
  return lines.join('\n')
}

export function downloadCSV(filename: string, rows: any[], headers?: string[]){
  const csv = toCSV(rows, headers)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
