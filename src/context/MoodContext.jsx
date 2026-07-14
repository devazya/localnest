/**
 * MoodContext.jsx
 * ---------------------------------------------------------------------
 * Architecture-only, per the Mood Cards brief: "Friend AI should be
 * notified of the selected mood. Use context or state. Do not
 * implement AI logic yet." This is that plumbing and nothing more —
 * it exposes the currently-selected mood slug to anything mounted
 * inside <MoodProvider>, but nothing reads it yet. Friend AI (or a
 * future recommendation layer) can call useMoodContext() when that
 * work starts, without any change to useMoodSelection or MoodCardsSection.
 *
 * useMoodContext() returns null when no <MoodProvider> is an ancestor,
 * rather than throwing — useMoodSelection treats a null context as
 * "no one is listening yet" and simply skips the sync.
 */
import { createContext, useContext, useState, useCallback } from 'react';

const MoodContext = createContext(null);

export function MoodProvider({ children }) {
  const [selectedMood, setSelectedMoodState] = useState(null);

  const setSelectedMood = useCallback((slug) => {
    setSelectedMoodState(slug);
  }, []);

  return (
    <MoodContext.Provider value={{ selectedMood, setSelectedMood }}>
      {children}
    </MoodContext.Provider>
  );
}

export const useMoodContext = () => useContext(MoodContext);
