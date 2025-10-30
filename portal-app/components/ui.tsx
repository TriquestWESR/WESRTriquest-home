type WithChildren = { children: React.ReactNode; className?: string }
export function Card({children, className}: WithChildren) {
  return <div className={`rounded-2xl border border-neutral-200 bg-white/70 p-5 ${className||''}`}>{children}</div>
}
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props
  return <button {...rest} className={`rounded-2xl px-5 py-3 bg-neutral-900 text-white hover:bg-neutral-800 ${className||''}`} />
}
export function Muted({children, className}: WithChildren) {
  return <p className={`text-sm text-neutral-700 ${className||''}`}>{children}</p>
}
export function H1({children, className}: WithChildren) {
  return <h1 className={`text-2xl md:text-3xl font-bold ${className||''}`}>{children}</h1>
}
export function H2({children, className}: WithChildren) {
  return <h2 className={`text-lg font-semibold ${className||''}`}>{children}</h2>
}
