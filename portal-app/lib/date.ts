export function fmtDate(d: string | Date) {
  const x = typeof d === 'string' ? new Date(d) : d
  return x.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
}
