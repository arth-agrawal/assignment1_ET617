'use client';
import * as React from 'react';

export function SectionTitle({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div style={{marginBottom:8}}>
      {kicker && <p className="small" style={{textTransform:'uppercase', letterSpacing:.5}}>{kicker}</p>}
      <h2 style={{fontSize:'1.15rem', fontWeight:700}}>{children}</h2>
    </div>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  full?: boolean;
  loading?: boolean;
  done?: boolean;
};
export function Button({ variant='primary', full, loading, done, className='', children, ...rest }: BtnProps) {
  const cls = `${variant==='ghost' ? 'btn-ghost' : 'btn'} ${full ? 'w-full' : ''} ${className}`;
  const label = loading ? 'Please wait…' : done ? 'Done ✓' : children;
  return <button className={cls} {...rest}>{label}</button>;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return <input ref={ref} className="input" {...props} />;
});

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="label">{children}</label>;
}

export function Card({ children, className='', title, actions }: {
  children: React.ReactNode; className?: string; title?: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
          {title ? <h3 style={{margin:0, fontSize:'1.05rem'}}>{title}</h3> : <div/>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Tag({ children, tone='muted' }: { children: React.ReactNode; tone?: 'ok'|'err'|'muted' }) {
  const styles: Record<string, React.CSSProperties> = {
    ok:   { background:'#e8fbef', color:'#166534', border:'1px solid #bbf7d0' },
    err:  { background:'#fee2e2', color:'#991b1b', border:'1px solid #fecaca' },
    muted:{ background:'#f3f4f6', color:'#374151', border:'1px solid #e5e7eb' },
  };
  return <span style={{...styles[tone], padding:'4px 8px', borderRadius:8, fontSize:12}}>{children}</span>;
}