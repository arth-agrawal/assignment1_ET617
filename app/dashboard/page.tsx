'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { logEventDB } from '../../lib/logEvent';
import { Button, Card, SectionTitle, Tag } from '../../components/ui';

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname() || '/dashboard';
  const [uid, setUid] = useState<string>('');
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement|null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/login'); return; }
      setUid(user.uid);
      try { await logEventDB(user.uid, 'page_view', pathname, 'Dashboard'); } catch {}
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
    } catch (e:any) { showError(e?.message ?? 'Failed to log'); }
  }

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
    } catch (e:any) { showError(e?.message ?? 'Failed to log video'); }
  }

  return (
    <div className="stack-lg">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <SectionTitle kicker="Area">Dashboard</SectionTitle>
        <Button variant="ghost" onClick={() => signOut(auth)}>Logout</Button>
      </div>

      {status !== 'idle' && (
        <Card className="fadeIn">
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <Tag tone={status==='error' ? 'err' : 'ok'}>
              {status==='saving' ? 'Saving' : status==='saved' ? 'Done' : 'Error'}
            </Tag>
            <p className="small" style={{color: status==='error' ? '#b91c1c' : 'var(--muted)'}}>{statusMsg}</p>
          </div>
        </Card>
      )}

      <Card>
        <SectionTitle kicker="Demo">Quick Action</SectionTitle>
        <p className="small" style={{marginBottom:10}}>Click to log a sample event to Firestore.</p>
        <Button onClick={handleTestClick} done={status==='saved'}>Test click (logs event)</Button>
      </Card>

      <Card>
        <SectionTitle kicker="Lesson">Lesson video</SectionTitle>
        <div className="card" style={{padding:8, marginBottom:8}}>
          <video
            ref={videoRef}
            className="fadeIn"
            style={{width:'100%', borderRadius:10}}
            controls
            onPlay={() => logVideo('video_play')}
            onPause={() => logVideo('video_pause')}
            onEnded={() => logVideo('video_end')}
          >
            <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
          </video>
        </div>
        <p className="small">We log play, pause and end with timestamps.</p>
      </Card>

      <Quiz uid={uid} pathname={pathname} onState={(s,m)=>{ setStatus(s as any); setStatusMsg(m); }} />
    </div>
  );
}

/* -------------------- QUIZ -------------------- */
function Quiz({
  uid, pathname, onState,
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
      setTimeout(()=>onState('idle',''), 700);
    } catch (e:any) { onState('error', e?.message ?? 'Failed to save choice'); }
  }

  async function submit(){
    if (!uid) return;
    try {
      onState('saving','Submitting answers…');
      await logEventDB(uid, 'quiz_submit', pathname, 'Quiz', { answers: sel, score, total: qs.length });
      setSubmitted(true);
      onState('saved','Quiz submitted ✓');
    } catch (e:any) { onState('error', e?.message ?? 'Failed to submit quiz'); }
  }

  return (
    <Card title={<SectionTitle kicker="Check">Quick Quiz</SectionTitle>} className="stack">
      {qs.map((it, i) => (
        <div key={it.id} className="card">
          <p style={{marginBottom:8, fontWeight:600}}>{it.q}</p>
          <div className="stack">
            {it.opts.map((o, j) => {
              const active = sel[i]===j;
              return (
                <label key={j} className="card" style={{display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderColor: active ? '#bcd7ff' : 'var(--border)'}}>
                  <input type="radio" name={`q${i}`} checked={active} onChange={()=>choose(i,j)} />
                  <span>{o}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <Button onClick={submit} disabled={submitted}>{submitted ? 'Submitted ✓' : 'Submit quiz'}</Button>
        <span className="small">Score: {score}/{qs.length}</span>
      </div>
    </Card>
  );
}