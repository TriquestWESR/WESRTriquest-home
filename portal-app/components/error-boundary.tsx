"use client"
import React from 'react'
import { useToast } from './toast'

type State = { hasError: boolean; error?: any }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(error: any) { return { hasError: true, error } }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('App ErrorBoundary caught:', error, info)
  }
  render(){
    if(this.state.hasError){
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-neutral-700 mt-2">Please reload the page. If the problem persists, contact support.</p>
          <pre className="mt-4 text-xs bg-white rounded-xl border border-neutral-200 p-3 overflow-auto">
            {String(this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
