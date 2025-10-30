"use client"
import React from 'react'

export function Spinner({ className = '' }:{ className?: string }){
  return (
    <svg className={`animate-spin h-5 w-5 text-neutral-600 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-label="Loading">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  )
}

export function LoadingOverlay(){
  return (
    <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl"><Spinner className="h-6 w-6" /></div>
  )
}
