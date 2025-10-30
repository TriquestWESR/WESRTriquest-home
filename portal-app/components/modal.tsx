"use client"
import React, { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children, footer }:{ open:boolean; onClose:()=>void; title?:string; children:React.ReactNode; footer?:React.ReactNode }){
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(!open) return
    const el = ref.current
    const prev = document.activeElement as HTMLElement | null
    el?.focus()
    function onKey(e:KeyboardEvent){ if(e.key==='Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return ()=>{ document.removeEventListener('keydown', onKey); prev?.focus?.() }
  },[open, onClose])
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-xl p-5">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        <div className="mt-3">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
