'use client'
import { supabase } from './supabase'
export async function signIn(email:string, password:string){ return supabase.auth.signInWithPassword({email, password}) }
export async function signOut(){ return supabase.auth.signOut() }
export async function getUser(){ return (await supabase.auth.getUser()).data.user }
