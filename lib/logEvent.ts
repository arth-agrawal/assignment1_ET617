import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type EventPayload = Record<string, any>;

export async function logEventDB(
  userId: string,
  type: string,
  path: string,
  component: string,
  payload: EventPayload = {}
) {
  await addDoc(collection(db, 'events'), {
    ts: serverTimestamp(),
    userId,
    type,
    path,
    component,
    payload,
    origin: 'web',
  });
}