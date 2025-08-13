'use client';
import { useMemo } from 'react';

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  done?: boolean;
};
export function Button({ className='', variant='primary', loading, done, children, ...rest }: BtnProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm ' +
    'border transition focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    'active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed';
  const tone = useMemo(() => {
    if (variant === 'ghost')  return 'border-zinc-600 hover:bg-zinc-800';
    if (variant === 'danger') return 'border-red-600 bg-red-700/20 hover:bg-red-700/30';
    return 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700'; // primary
  }, [variant]);

  return (
    <button
      className={`${base} ${tone} ${className}`}
      {...rest}
    >
      {loading ? 'Saving…' : done ? 'Saved ✓' : children}
    </button>
  );
}

export function Card({children, className=''}:{children:React.ReactNode; className?:string}) {
  return <div className={`rounded-2xl border border-zinc-700 p-4 ${className}`}>{children}</div>;
}

export function SectionTitle({children}:{children:React.ReactNode}) {
  return <h2 className="text-xl font-semibold mb-2">{children}</h2>;
}

export function Tag({children, tone='ok'}:{children:React.ReactNode; tone?:'ok'|'err'|'muted'}) {
  const map = {
    ok: 'bg-green-500/15 text-green-300 border-green-600/30',
    err: 'bg-red-500/15 text-red-300 border-red-600/30',
    muted: 'bg-zinc-500/15 text-zinc-300 border-zinc-600/30',
  } as const;
  return <span className={`text-xs px-2 py-1 rounded-lg border ${map[tone]} inline-flex items-center gap-1`}>{children}</span>;
}