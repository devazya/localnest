import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import './styles/globals.css';
import { useEffect } from "react";
import { testConnection } from "./services/supabase/testConnection.js";
import Community from './pages/Community';
import RideShare from './pages/RideShare';
import Events from './pages/Events';
import BuySell from './pages/BuySell';
import Roommates from './pages/Roommates';
import PgListings from './pages/PgListings';
import PgDetails from './pages/PgDetails';

// Lazy page stubs — will be replaced as pages are built
function Stub({ name, onNavigate }) {
  
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>Coming soon — check back after the next batch.</div>
      <button onClick={() => onNavigate('home')} style={{ marginTop: 8, background: 'var(--green-dim)', border: '1px solid rgba(110,231,183,0.25)', color: 'var(--green)', padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
        ← Back to Home
      </button>
    </div>
  );
}

const PAGE_COMPONENTS = {
  home:      (nav) => <Home onNavigate={nav} />,
 pgs: (nav) => <PgListings onNavigate={nav} />,
pgdetails: (nav) => <PgDetails onNavigate={nav} />,
  shops:     (nav) => <Stub name="Shops & Services" onNavigate={nav} />,
  gyms:      (nav) => <Stub name="Gyms & Fitness" onNavigate={nav} />,
 community: () => <Community />,
rideshare: () => <RideShare />,
events: () => <Events />,
buysell: () => <BuySell />,
roommates: () => <Roommates />,
  post:      (nav) => <Stub name="Post Something" onNavigate={nav} />,
  profile:   (nav) => <Stub name="Profile" onNavigate={nav} />,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
    useEffect(() => {
    testConnection();
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = PAGE_COMPONENTS[currentPage] ?? PAGE_COMPONENTS['home'];

  return (
    <MainLayout currentPage={currentPage} onNavigate={navigate}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderPage(navigate)}
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
}
