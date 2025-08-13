'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      setMsg('Signed up! Go to /dashboard');
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <input className="border p-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2" type="password" placeholder="password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button className="border p-2">Create account</button>
      </form>
      <p className="mt-2 text-sm">{msg}</p>
      <p className="mt-4 text-sm">Already have an account? <Link href="/login" className="underline">Log in</Link></p>
    </main>
  );
}