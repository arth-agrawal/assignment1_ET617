'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      router.push('/dashboard');
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <input className="border p-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2" type="password" placeholder="password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button className="border p-2">Log in</button>
      </form>
      <p className="mt-2 text-sm">{msg}</p>
    </main>
  );
}