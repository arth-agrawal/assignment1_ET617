'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button, Card } from '../components/ui'; // if this path fails, use: ../components/ui

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setLoggedIn(!!u));
    return () => unsub();
  }, []);

  return (
    <main className="relative z-10 flex min-h-[calc(100svh)] items-center justify-center px-6">
      <Card className="w-full max-w-lg border-white/15 bg-white/10 backdrop-blur-lg shadow-[0_10px_45px_rgba(0,0,0,0.25)] animate-fadeIn">
        <header className="mb-5">
          <p className="text-xs uppercase tracking-wider text-zinc-400">
            LearnTracker by <span className="font-medium text-white">Arth Agrawal</span> • 23B1507
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Welcome</h1>
          <p className="mt-1 text-sm text-zinc-300">
            {loggedIn ? 'You are signed in. Jump back to your dashboard.' : 'Create an account or log in to continue.'}
          </p>
        </header>

        <div className="grid gap-3">
          {loggedIn ? (
            <Button full className="h-11 text-[15px]" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button full className="h-11 text-[15px]" onClick={() => router.push('/signup')}>
                Create an account
              </Button>
              <Button
                full
                variant="ghost"
                className="h-11 text-[15px] border-white/15 hover:bg-white/10"
                onClick={() => router.push('/login')}
              >
                Log in
              </Button>
            </>
          )}
        </div>

        <footer className="mt-6 flex items-center justify-between text-xs text-zinc-400">
          <span>ET617 • Next.js + Firebase</span>
          <nav className="space-x-3">
            <button className="underline underline-offset-4 hover:text-zinc-300" onClick={() => router.push('/dashboard')}>
              Dashboard
            </button>
            <button className="underline underline-offset-4 hover:text-zinc-300" onClick={() => router.push('/admin')}>
              Admin
            </button>
          </nav>
        </footer>
      </Card>
    </main>
  );
}