"use client"
import React, { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [dark, setDark] = useState(false)
  useEffect(()=>{
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefers = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefers
    setDark(isDark)
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', isDark)
  },[])
  useEffect(()=>{
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', dark)
    if (typeof window !== 'undefined') localStorage.setItem('theme', dark ? 'dark' : 'light')
  },[dark])
  return (
    <button
      aria-label="Toggle theme"
      className="fixed bottom-4 left-4 z-50 rounded-2xl border border-neutral-300 bg-white/80 px-3 py-2 text-sm hover:bg-white dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
      onClick={()=>setDark(v=>!v)}
      title="Toggle light/dark"
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
