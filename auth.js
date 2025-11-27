import { getUsers, saveUsers, setSession, getSession, clearSession } from './storage.js'
import { uid, slugify } from './utils.js'

async function hashPassword(password){
  const enc = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
}

export async function register({email, password, name}){
  const users = getUsers()
  if(users.find(u=>u.email === email)) throw new Error('Email already registered')
  const id = uid()
  const pwdHash = await hashPassword(password)
  const user = {id, email, name: name||'', pwdHash, slug: slugify(name||email), createdAt: Date.now()}
  users.push(user)
  saveUsers(users)
  // create session
  setSession({userId:id})
  return user
}

export async function login({email,password}){
  const users = getUsers()
  const user = users.find(u=>u.email===email)
  if(!user) throw new Error('Invalid credentials')
  const hash = await hashPassword(password)
  if(hash !== user.pwdHash) throw new Error('Invalid credentials')
  setSession({userId:user.id})
  return user
}

export function logout(){
  clearSession()
}

export function currentUser(){
  const s = getSession()
  if(!s || !s.userId) return null
  const users = getUsers()
  return users.find(u=>u.id===s.userId) || null
}
