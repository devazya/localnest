import { useEffect, useState } from 'react';
import HomeSectionRenderer from '../components/home/HomeSectionRenderer';
import { HOME_SECTIONS, getHomeSectionOrder } from '../config/homeSections';
import { MoodProvider } from '../context/MoodContext';

/**
 * Home.jsx — thin config-driven page shell.
 * ---------------------------------------------------------------------
 * All section markup/logic lives in components registered inside
 * HOME_SECTIONS (src/config/homeSections.js) and is rendered in order by
 * HomeSectionRenderer. Adding, removing, reordering, or feature-flagging
 * a section is a config change, not a Home.jsx change.
 */
export default function Home({ onNavigate }) {
  const [orderOverride, setOrderOverride] = useState({});

  useEffect(() => {
    let cancelled = false;
    getHomeSectionOrder().then((order) => {
      if (!cancelled) setOrderOverride(order);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    // MoodProvider: lets Mood Cards publish the selected mood for Friend
    // AI (or a future recommendation layer) to read later — see
    // context/MoodContext.jsx. Nothing reads it yet.
    <MoodProvider>
      <HomeSectionRenderer
        sections={HOME_SECTIONS}
        orderOverride={orderOverride}
        onNavigate={onNavigate}
      />
    </MoodProvider>
  );
}
