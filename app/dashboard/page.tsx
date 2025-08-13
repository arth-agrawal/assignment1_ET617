export const dynamic = 'force-dynamic';
'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { logEventDB } from '../../lib/logEvent';
import { Button, Card, SectionTitle, Tag } from '../../components/ui';

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname() || '/dashboard';
  const [uid, setUid] = useState<string>('');

  // global status banner for quick feedback
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  // video ref
  const videoRef = useRef<HTMLVideoElement|null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/login'); return; }
      setUid(user.uid);
      try { await logEventDB(user.uid, 'page_view', pathname, 'Dashboard'); }
      catch (e:any) { showError(e?.message ?? 'Failed to log page_view'); }
    });
    return () => unsub();
  }, [pathname, router]);

  function showSaving(msg='Saving…'){ setStatus('saving'); setStatusMsg(msg); }
  function showSaved(msg='Saved ✓'){ setStatus('saved'); setStatusMsg(msg); setTimeout(()=>setStatus('idle'), 1200); }
  function showError(msg='Something went wrong'){ setStatus('error'); setStatusMsg(msg); }

  async function handleTestClick() {
    if (!uid) return;
    try {
      showSaving('Logging click…');
      await logEventDB(uid, 'click', pathname, 'Button', { name: 'hello' });
      showSaved('Event logged!');
    } catch (e:any) {
      showError(e?.message ?? 'Failed to log');
    }
  }

  // ---- VIDEO ----
  const videoId = 'intro-flower';
  async function logVideo(type: 'video_play'|'video_pause'|'video_end') {
    if (!uid || !videoRef.current) return;
    const v = videoRef.current;
    try {
      await logEventDB(uid, type, pathname, 'Video', {
        videoId,
        currentTime: Math.round(v.currentTime),
        duration: Math.round(v.duration || 0),
      });
      if (type === 'video_end') showSaved('Video completed ✓');
    } catch (e:any) {
      showError(e?.message ?? 'Failed to log video');
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Button variant="ghost" onClick={() => signOut(auth)}>Logout</Button>
      </header>

      {/* status bar */}
      {status !== 'idle' && (
        <Card className={`${status==='error' ? 'border-red-600' : 'border-zinc-700'} bg-black/20`}>
          <div className="flex items-center gap-3">
            <Tag tone={status==='error' ? 'err' : 'ok'}>
              {status==='saving' ? 'Saving' : status==='saved' ? 'Done' : 'Error'}
            </Tag>
            <p className={`${status==='error' ? 'text-red-300' : 'text-zinc-200'}`}>{statusMsg}</p>
          </div>
        </Card>
      )}

      {/* actions */}
      <Card>
        <SectionTitle>Quick Action</SectionTitle>
        <p className="text-sm text-zinc-400 mb-3">Click to log a sample event.</p>
        <Button loading={status==='saving'} done={status==='saved'} onClick={handleTestClick}>
          Test click (logs event)
        </Button>
      </Card>

      {/* video */}
      <Card>
        <SectionTitle>Lesson video</SectionTitle>
        <video
          ref={videoRef}
          className="w-full rounded-xl border border-zinc-700"
          controls
          onPlay={() => logVideo('video_play')}
          onPause={() => logVideo('video_pause')}
          onEnded={() => logVideo('video_end')}
        >
          <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
        </video>
        <p className="text-sm text-zinc-400 mt-2">We log play, pause and end with timestamps.</p>
      </Card>

      {/* quiz */}
      <Card>
        <SectionTitle>Quick Quiz</SectionTitle>
        <Quiz uid={uid} pathname={pathname} onState={(s,m)=>{ setStatus(s as any); setStatusMsg(m); }} />
      </Card>
    </main>
  );
}

function Quiz({
  uid, pathname, onState
}: {
  uid: string; pathname: string;
  onState: (s:'idle'|'saving'|'saved'|'error', m:string)=>void;
}) {
  const qs = useMemo(() => ([
    { id: 'q1', q: 'HTML stands for?', opts:['HyperText Markup Language','Hot Mail','How To Make Lasagna'], ans:0 },
    { id: 'q2', q: 'CSS is used for?',  opts:['Styling','Database','Networking'], ans:0 },
    { id: 'q3', q: 'React is a ...',   opts:['Library','DB','Language'], ans:0 },
  ]), []);
  const [sel, setSel] = useState<number[]>(Array(qs.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const score = sel.reduce((s,v,i)=> s + (v===qs[i].ans?1:0), 0);

  async function choose(i:number, j:number){
    setSel(prev => { const next=[...prev]; next[i]=j; return next; });
    if (!uid) return;
    try {
      await logEventDB(uid, 'quiz_select', pathname, 'Quiz', { questionId: qs[i].id, choiceIndex: j });
      onState('saved','Choice saved ✓');
      setTimeout(()=>onState('idle',''), 800);
    } catch (e:any) {
      onState('error', e?.message ?? 'Failed to save choice');
    }
  }

  async function submit(){
    if (!uid) return;
    try {
      onState('saving','Submitting answers…');
      await logEventDB(uid, 'quiz_submit', pathname, 'Quiz', { answers: sel, score, total: qs.length });
      setSubmitted(true);
      onState('saved','Quiz submitted ✓');
    } catch (e:any) {
      onState('error', e?.message ?? 'Failed to submit quiz');
    }
  }

  return (
    <div className="space-y-3">
      {qs.map((it, i) => (
        <div key={it.id} className="rounded-2xl border border-zinc-700 p-3">
          <p className="mb-2">{it.q}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {it.opts.map((o, j) => (
              <label
                key={j}
                className={`cursor-pointer rounded-lg border px-3 py-2 transition
                ${sel[i]===j ? 'bg-zinc-800 border-zinc-500' : 'border-zinc-700 hover:bg-zinc-900'}`}
              >
                <input
                  className="mr-2"
                  type="radio"
                  name={`q${i}`}
                  checked={sel[i]===j}
                  onChange={() => choose(i,j)}
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={submitted}>
          {submitted ? 'Submitted ✓' : 'Submit quiz'}
        </Button>
        <span className="text-sm text-zinc-400">Score: {score}/{qs.length}</span>
      </div>
    </div>
  );
}