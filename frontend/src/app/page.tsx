// We need to import the Link component from Next.js for fast navigation
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
      <header>
        <h1>Welcome to [Your Company Name] ⚡</h1>
        <p>The AI-powered Ad Creative Engine.</p>
      </header>
      
      <nav style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link href="/brand-hub" style={linkStyles}>
          Go to Brand Hub (Onboard a New Brand)
        </Link>
        <Link href="/campaign-launcher" style={linkStyles}>
          Go to Campaign Launcher (Create an Ad)
        </Link>
      </nav>
    </main>
  );
}

// A little bit of styling for our links to make them look like buttons
const linkStyles: React.CSSProperties = {
  display: 'inline-block',
  padding: '15px 30px',
  border: '1px solid #0070f3',
  borderRadius: '5px',
  backgroundColor: '#0070f3',
  color: 'white',
  textDecoration: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};