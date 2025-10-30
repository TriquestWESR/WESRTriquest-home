'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Button, Card, H1, Muted } from '@/components/ui'
export default function Page(){
  const router = useRouter()
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState<string|null>(null)
  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <H1>Sign in</H1>
      <Muted className="mt-2">Providers, instructors, and WESR admins sign in here.</Muted>
      <Card>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="block text-sm font-medium mt-4">Password</label>
        <input type="password" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        <Button
          className="mt-5"
          onClick={async()=>{
            const { error } = await signIn(email, password)
            if (error) return setMsg(error.message)
            // success → go to provider dashboard by default
            router.replace('/provider')
          }}
        >
          {'Sign in'}
        </Button>
        {msg && <p className="text-sm text-neutral-700 mt-2">{msg}</p>}
      </Card>
    </main>
  )
}
