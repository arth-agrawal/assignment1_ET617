import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container" style={{padding:'0'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0'}}>
              <Link href="/" style={{fontSize:'1.1rem', textDecoration:'none', color:'#0b2035'}}>
                📚 Learn Tracker
              </Link>
              <nav style={{display:'flex', gap:16}}>
                <Link href="/dashboard" style={{color:'#0b2035', textDecoration:'none'}}>Dashboard</Link>
                <Link href="/admin" style={{color:'#0b2035', textDecoration:'none'}}>Admin</Link>
                <Link href="/login" style={{color:'#0b2035', textDecoration:'none'}}>Log in</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="container fadeIn">
          {children}
        </main>

        <footer className="container" style={{paddingTop:0, paddingBottom:24}}>
          <div className="card" style={{textAlign:'center', color:'var(--muted)'}}>
            ET617 • Next.js + Firebase • by <strong>Arth Agrawal (23B1507)</strong>
          </div>
        </footer>
      </body>
    </html>
  );
}