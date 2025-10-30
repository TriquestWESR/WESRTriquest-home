"use client"
import React from 'react'
import { ToastProvider } from './toast'
import ErrorBoundary from './error-boundary'

export default function Providers({ children }:{ children: React.ReactNode }){
  return (
    <ToastProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </ToastProvider>
  )
}
