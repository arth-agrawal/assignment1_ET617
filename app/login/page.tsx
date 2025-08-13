'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Link from 'next/link';
import { Button, Card, Input, Label } from '../../components/ui';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(''); 
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      setBusy(true);
      await signInWithEmailAndPassword(auth, email, pw);
      router.push('/dashboard');
    } catch (err: any) {
      setMsg(err?.message ?? 'Login failed');
    } finally { setBusy(false); }
  }

  return (
    <div style={{display:'grid', placeItems:'center', minHeight:'60vh'}}>
      <Card className="fadeIn" title="Log in">
        <p className="small" style={{marginBottom:10}}>Welcome back 👋</p>
        <form onSubmit={submit} className="stack">
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" value={pw} onChange={(e)=>setPw(e.target.value)} required />
          </div>
          <Button className="btn" loading={busy} full>Log in</Button>
        </form>
        {msg && <p className="small" style={{color:'#b91c1c', marginTop:10}}>{msg}</p>}
        <p className="small" style={{marginTop:12}}>
          New here? <Link href="/signup" style={{color:'var(--link)'}}>Create an account</Link>
        </p>
      </Card>
    </div>
  );
}