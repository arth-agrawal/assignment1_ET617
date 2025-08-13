'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { Button, Card, SectionTitle, Tag } from '../../components/ui';

type Row = {
  id: string;
  ts?: any;
  userId?: string;
  type?: string;
  path?: string;
  component?: string;
  payload?: any;
  origin?: string;
};

export default function Admin() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/login'); return; }
      try {
        const q = query(collection(db, 'events'), orderBy('ts','desc'), limit(200));
        const snap = await getDocs(q);
        setRows(snap.docs.map(d => ({ id: d.id, ...d.data() } as Row)));
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  function exportCSV() {
    const head = ['ts','userId','type','path','component','payload','origin'];
    const lines = rows.map(r => ([
      r.ts?.toDate?.().toISOString?.() ?? '',
      r.userId ?? '',
      r.type ?? '',
      r.path ?? '',
      r.component ?? '',
      JSON.stringify(r.payload ?? {}),
      r.origin ?? ''
    ].map(v => `"${String(v).replaceAll('"','""')}"`).join(',')));
    const csv = head.join(',') + '\n' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'events.csv'; a.click();
  }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Events</h1>
        <div className="flex gap-3">
          <Button onClick={()=>router.push('/dashboard')} variant="ghost">Back to Dashboard</Button>
          <Button onClick={exportCSV}>Export CSV</Button>
        </div>
      </div>

      <Card>
        <SectionTitle>Latest 200 events</SectionTitle>
        {loading ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-400">No events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border border-zinc-700 text-sm">
              <thead className="bg-zinc-900/40">
                <tr>
                  {['Time','User','Type','Path','Component','Payload','Origin'].map(h => (
                    <th key={h} className="border border-zinc-700 px-2 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-900/30">
                    <td className="border border-zinc-700 px-2 py-1 whitespace-nowrap">
                      {r.ts?.toDate?.().toLocaleString?.() ?? ''}
                    </td>
                    <td className="border border-zinc-700 px-2 py-1">{r.userId}</td>
                    <td className="border border-zinc-700 px-2 py-1">
                      <Tag tone={r.type?.includes('error') ? 'err' : 'muted'}>{r.type}</Tag>
                    </td>
                    <td className="border border-zinc-700 px-2 py-1">{r.path}</td>
                    <td className="border border-zinc-700 px-2 py-1">{r.component}</td>
                    <td className="border border-zinc-700 px-2 py-1 text-xs">
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(r.payload, null, 0)}</pre>
                    </td>
                    <td className="border border-zinc-700 px-2 py-1">{r.origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
}