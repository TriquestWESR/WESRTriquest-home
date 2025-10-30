"use client"
export async function authHeaders(extra?:HeadersInit): Promise<HeadersInit> {
  const token = (typeof window !== 'undefined' ? (window as any).supabaseToken : '') || ''
  return { 'Content-Type': 'application/json', ...(extra||{}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}){
  const headers = await authHeaders(init.headers)
  const res = await fetch(input, { ...init, headers })
  if (res.status === 401) {
    // Redirect to login on unauthorized
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('unauthorized')
  }
  return res
}

export async function json<T=any>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const res = await authFetch(input, init)
  const data = await res.json().catch(()=>null)
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed with ${res.status}`
    throw new Error(msg)
  }
  return data as T
}
