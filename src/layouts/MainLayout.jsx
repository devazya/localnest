import { useRef } from 'react';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/footer/Footer';

export default function MainLayout({ children, currentPage, onNavigate }) {
  const pageRef = useRef(null);

  const handleNavigate = (page) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }} ref={pageRef}>
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
        {children}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
