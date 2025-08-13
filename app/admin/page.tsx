'use client';
export const dynamic = 'force-dynamic';

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
        const qy = query(collection(db, 'events'), orderBy('ts','desc'), limit(200));
        const snap = await getDocs(qy);
        setRows(snap.docs.map(d => ({ id: d.id, ...d.data() } as Row)));
      } finally { setLoading(false); }
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
    <div className="stack-lg">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <SectionTitle>Events</SectionTitle>
        <div style={{display:'flex', gap:10}}>
          <Button variant="ghost" onClick={()=>router.push('/dashboard')}>Back to Dashboard</Button>
          <Button onClick={exportCSV}>Export CSV</Button>
        </div>
      </div>

      <Card>
        <SectionTitle kicker="Latest">Last 200 events</SectionTitle>
        {loading ? (
          <p className="small">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="small">No events yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Path</th>
                  <th>Component</th>
                  <th>Payload</th>
                  <th>Origin</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>{r.ts?.toDate?.().toLocaleString?.() ?? ''}</td>
                    <td>{r.userId}</td>
                    <td>
                      <Tag tone={r.type?.includes('error') ? 'err' : 'muted'}>{r.type}</Tag>
                    </td>
                    <td>{r.path}</td>
                    <td>{r.component}</td>
                    <td><pre style={{whiteSpace:'pre-wrap', wordBreak:'break-all', margin:0}}>{JSON.stringify(r.payload ?? {}, null, 0)}</pre></td>
                    <td>{r.origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}