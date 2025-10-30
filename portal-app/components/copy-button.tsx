"use client"
import React, { useState } from 'react'

export default function CopyButton({ text, className='' }:{ text: string; className?: string }){
  const [copied,setCopied]=useState(false)
  async function copy(){
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(()=>setCopied(false), 1500)
    } catch {}
  }
  return (
    <button onClick={copy} className={`rounded-xl border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 ${className}`}>{copied?'Copied':'Copy'}</button>
  )
}
