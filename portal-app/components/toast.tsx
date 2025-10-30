"use client"
import React, { createContext, useContext, useMemo, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'
export type Toast = { id: number; title?: string; message: string; type?: ToastType; duration?: number }

type ToastContextType = {
  toast: (message: string, opts?: { title?: string; type?: ToastType; duration?: number }) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const remove = (id: number) => setItems(prev => prev.filter(t => t.id !== id))

  const api = useMemo<ToastContextType>(() => ({
    toast: (message, opts) => {
      const t: Toast = { id: Date.now() + Math.random(), message, ...opts }
      setItems(prev => [...prev, t])
      const duration = t.duration ?? 3500
      if (duration > 0) setTimeout(() => remove(t.id), duration)
    },
    success: (message, title) => api.toast(message, { title, type: 'success' }),
    error: (message, title) => api.toast(message, { title, type: 'error' }),
    info: (message, title) => api.toast(message, { title, type: 'info' }),
    warning: (message, title) => api.toast(message, { title, type: 'warning' }),
  }), [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer items={items} onClose={remove} />
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if(!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function iconFor(type?: ToastType){
  switch(type){
    case 'success': return '✓'
    case 'error': return '⨯'
    case 'warning': return '⚠'
    default: return 'ℹ'
  }
}

function bgFor(type?: ToastType){
  switch(type){
    case 'success': return 'bg-emerald-600'
    case 'error': return 'bg-red-600'
    case 'warning': return 'bg-amber-600'
    default: return 'bg-neutral-900'
  }
}

function ToastContainer({ items, onClose }:{ items: Toast[]; onClose:(id:number)=>void }){
  return (
    <div className="fixed z-50 bottom-4 right-4 space-y-2">
      {items.map(t=> (
        <div key={t.id} className={`pointer-events-auto text-white rounded-2xl shadow-lg px-4 py-3 min-w-[240px] ${bgFor(t.type)}`} role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            <div className="text-xl leading-none">{iconFor(t.type)}</div>
            <div className="flex-1">
              {t.title && <div className="font-semibold">{t.title}</div>}
              <div className="text-sm opacity-95">{t.message}</div>
            </div>
            <button aria-label="Dismiss" className="opacity-80 hover:opacity-100" onClick={()=>onClose(t.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
