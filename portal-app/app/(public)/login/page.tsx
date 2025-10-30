'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, getUser } from '@/lib/auth-client'
import { supabase } from '@/lib/supabase'
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
            // fetch role and route accordingly
            const user = await getUser()
            let dest = '/provider'
            if (user?.id) {
              const { data } = await supabase
                .from('roles')
                .select('role')
                .eq('user_id', user.id)
              const roles = (data||[]).map(r=>r.role)
              if (roles.includes('WESR_ADMIN')) dest = '/admin'
              else if (roles.includes('PROVIDER') || roles.includes('INSTRUCTOR')) dest = '/provider'
            }
            router.replace(dest)
          }}
        >
          {'Sign in'}
        </Button>
        {msg && <p className="text-sm text-neutral-700 mt-2">{msg}</p>}
      </Card>
    </main>
  )
}
