const { useEffect, useMemo, useState } = React;

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/services', label: 'Services' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/social', label: 'Social Hub' }
];

function Header({ currentPath }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [currentPath]);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <a className="logo" href="#/">Ethical <span>Multimedia GH</span></a>
        <button className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Open navigation">☰</button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {navItems.map((item) => (
            <a key={item.path} className={currentPath === item.path ? 'active' : ''} href={`#${item.path}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="kicker">Elegant Events • Professional Delivery</p>
            <h1>Where unforgettable celebrations meet multimedia excellence.</h1>
            <p className="lead">From live band performances to premium catering, decor design, and multimedia production, we craft complete event experiences for weddings, private celebrations, and corporate functions.</p>
            <div className="btn-row">
              <a className="btn btn-primary" href="#/contact">Book Your Date</a>
              <a className="btn btn-secondary" href="#/services">Explore Services</a>
            </div>
          </div>
          <img src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=75" alt="Premium evening event setup" loading="eager" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Our Signature Services</h2>
          <div className="grid-3">
            <article className="card service-card"><span className="tag band">Live Band</span><h3>Dynamic Live Music</h3><p>Curated performance sets for weddings, receptions, and executive galas.</p></article>
            <article className="card service-card"><span className="tag catering">Catering</span><h3>Culinary Experiences</h3><p>Elegant dining and buffet presentation with smooth service flow and quality menus.</p></article>
            <article className="card service-card"><span className="tag multimedia">Multimedia</span><h3>Production & Coverage</h3><p>Audio-visual setup, event capture, and post-production assets for your brand story.</p></article>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container grid-2">
          <img src="https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=1200&q=75" alt="Live band performance" loading="lazy" />
          <div>
            <h2>Designed for premium moments.</h2>
            <p>We blend music, hospitality, decor, and multimedia into one coordinated experience with professional, reliable execution.</p>
            <a className="btn btn-outline" href="#/about">Discover Our Approach</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta">
          <h2>Planning an event in Ghana?</h2>
          <p>Let Ethical Multimedia GH deliver a polished, memorable experience from concept to completion.</p>
          <a className="btn btn-primary" href="#/contact">Request a Consultation</a>
        </div>
      </section>
    </main>
  );
}

function ServicesPage() {
  return (
    <main>
      <section className="page-hero"><div className="container"><p className="kicker">Our Services</p><h1>Complete Event Solutions</h1><p>We deliver coordinated, high-quality services for intimate celebrations and large-scale functions.</p></div></section>
      <section className="section"><div className="container grid-2">
        <article className="card"><span className="tag band">Live Band</span><h2>Live Band</h2><p>Professional musicians, custom setlists, smooth transitions, and stage presence that elevates every moment.</p></article>
        <article className="card"><span className="tag catering">Catering</span><h2>Catering</h2><p>Thoughtful menu planning, quality ingredients, and clean presentation for weddings and corporate dining.</p></article>
        <article className="card"><span className="tag decor">Decor</span><h2>Decor</h2><p>Venue styling with floral accents, lighting concepts, and premium table settings that match your theme.</p></article>
        <article className="card"><span className="tag multimedia">Multimedia</span><h2>Multimedia</h2><p>Audio-visual setup, live streaming support, event photography, and edit-ready content delivery.</p></article>
      </div></section>
    </main>
  );
}

function AboutPage() {
  return (
    <main>
      <section className="page-hero"><div className="container"><p className="kicker">About Us</p><h1>Who We Are</h1><p>Ethical Multimedia GH is a multidisciplinary event and production team serving weddings, social gatherings, and corporate experiences across Ghana.</p></div></section>
      <section className="section"><div className="container grid-2"><article className="card"><h2>Who We Are</h2><p>We are event professionals, performers, stylists, and multimedia creatives united by a commitment to quality and reliable delivery.</p></article><article className="card"><h2>What We Do</h2><p>We provide end-to-end event support: live music, catering, decor styling, audiovisual execution, and digital media coverage.</p></article></div></section>
    </main>
  );
}

function ContactPage() {
  const [status, setStatus] = useState({ text: '', error: false });
  const [sending, setSending] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ text: '', error: false });
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setStatus({ text: result.errors?.[0] || result.message || 'Submission failed.', error: true });
      } else {
        event.currentTarget.reset();
        setStatus({ text: result.message, error: false });
      }
    } catch {
      setStatus({ text: 'Connection issue. Please try again shortly.', error: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <main>
      <section className="page-hero"><div className="container"><p className="kicker">Contact</p><h1>Book Ethical Multimedia GH</h1></div></section>
      <section className="section"><div className="container">
        <form className="card" onSubmit={onSubmit}>
          <div className="form-grid">
            <p><label>Full Name<input name="name" required minLength="2" /></label></p>
            <p><label>Email Address<input name="email" type="email" required /></label></p>
            <p><label>Phone<input name="phone" /></label></p>
            <p><label>Service Needed<select name="service"><option value="">Select a service</option><option>Live Band</option><option>Catering</option><option>Decor</option><option>Multimedia</option><option>Full Package</option></select></label></p>
            <p><label>Event Date<input name="eventDate" type="date" /></label></p>
            <p style={{ display: 'none' }}><label>Website<input name="website" autoComplete="off" tabIndex="-1" /></label></p>
          </div>
          <p><label>Event Details<textarea name="message" required minLength="10" placeholder="Share your event type, location, guest count, and preferred services." /></label></p>
          <button className="btn btn-primary" type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send Inquiry'}</button>
          <p className="notice" style={{ color: status.error ? '#8B0000' : '#228B22' }}>{status.text}</p>
        </form>
      </div></section>
    </main>
  );
}

function SocialPage() {
  return (
    <main>
      <section className="page-hero"><div className="container"><p className="kicker">Social Hub</p><h1>Connect With Ethical Multimedia GH</h1></div></section>
      <section className="section"><div className="container card"><ul className="social-list">
        <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
        <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
        <li><a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a></li>
        <li><a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a></li>
      </ul></div></section>
    </main>
  );
}

function Footer() {
  return <footer className="footer"><div className="container"><p>© Ethical Multimedia GH</p></div></footer>;
}

function useHashPath() {
  const getPath = () => {
    const raw = window.location.hash.replace(/^#/, '') || '/';
    return raw.startsWith('/') ? raw : `/${raw}`;
  };
  const [path, setPath] = useState(getPath());
  useEffect(() => {
    const onChange = () => setPath(getPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

function App() {
  const path = useHashPath();
  const page = useMemo(() => {
    if (path === '/services') return <ServicesPage />;
    if (path === '/about') return <AboutPage />;
    if (path === '/contact') return <ContactPage />;
    if (path === '/social') return <SocialPage />;
    return <HomePage />;
  }, [path]);

  return (
    <>
      <Header currentPath={path} />
      {page}
      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
