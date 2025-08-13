// lib/logEvent.ts
import { db } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

type EventPayload = Record<string, any>;

export async function logEventDB(
  userId: string,
  type: string,
  path: string,
  component: string,
  payload: EventPayload = {},
  origin: 'web' | 'app' = 'web'
) {
  // 1) Firestore (existing)
  try {
    await addDoc(collection(db, 'events'), {
      userId,
      type,
      path,
      component,
      payload,
      origin,
      ts: serverTimestamp(),
    });
  } catch (e) {
    // Don’t throw — we still try to forward to the sheet
    console.error('Firestore log failed:', e);
  }

  // 2) Forward to Google Sheet (best‑effort, non‑blocking)
  try {
    const url = process.env.NEXT_PUBLIC_SHEET_WEBHOOK;
    const tok = process.env.NEXT_PUBLIC_SHEET_TOKEN;
    if (!url || !tok) return;

    // keep payload small & serializable
    const body = {
      token: tok,               // Apps Script also checks X-Token header
      userId,
      type,
      path,
      component,
      origin,
      payload,                  // plain object
      ts: new Date().toISOString(),
    };

    // `keepalive` lets the request finish even if page navigates
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': tok,
      },
      body: JSON.stringify(body),
      keepalive: true,
      cache: 'no-store',
    }).catch(() => {}); // fully fire-and-forget
  } catch (e) {
    console.error('Sheet forward failed:', e);
  }
}