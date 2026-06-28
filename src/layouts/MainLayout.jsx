import Navbar from '../components/navigation/Navbar';
import BottomNav from '../components/navigation/BottomNav';
import Footer from '../components/footer/Footer';

export default function MainLayout({ children, currentPage, onNavigate, onAuthOpen, onPostOpen }) {
  const go = (page) => { onNavigate(page); window.scrollTo({ top:0, behavior:'smooth' }); };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Desktop-only top bar */}
      <Navbar currentPage={currentPage} onNavigate={go} onAuthOpen={onAuthOpen} onPostOpen={onPostOpen} />

      {/* Main content
          Mobile: no top padding (pages handle their own headers)
          Desktop: pad for the fixed navbar */}
      <main style={{ minHeight:'100vh' }} className="main-content">
        {children}
      </main>

      {/* Desktop footer */}
      <div className="desktop-footer">
        <Footer onNavigate={go} />
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav currentPage={currentPage} onNavigate={go} onAuthOpen={onAuthOpen} onPostOpen={onPostOpen} />

      <style>{`
        @media (min-width: 960px) {
          .main-content { padding-top: var(--top-bar-h); }
        }
      `}</style>
    </div>
  );
}
