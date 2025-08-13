'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Link from 'next/link';
import { Button, Card, Input, Label } from '../../components/ui';

export default function SignUp() {
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
      await createUserWithEmailAndPassword(auth, email, pw);
      setMsg('Account created ✓ Redirecting…');
      router.push('/dashboard');
    } catch (err: any) {
      setMsg(err?.message ?? 'Sign up failed');
    } finally { setBusy(false); }
  }

  return (
    <div style={{display:'grid', placeItems:'center', minHeight:'60vh'}}>
      <Card className="fadeIn" title="Create account">
        <p className="small" style={{marginBottom:10}}>Takes 10 seconds.</p>
        <form onSubmit={submit} className="stack">
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="Minimum 6 characters" value={pw} onChange={(e)=>setPw(e.target.value)} required />
          </div>
          <Button className="btn" loading={busy} full>Create account</Button>
        </form>
        {msg && <p className="small" style={{color:'#166534', marginTop:10}}>{msg}</p>}
        <p className="small" style={{marginTop:12}}>
          Already have an account? <Link href="/login" style={{color:'var(--link)'}}>Log in</Link>
        </p>
      </Card>
    </div>
  );
}