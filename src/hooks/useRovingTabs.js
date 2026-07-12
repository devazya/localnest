/**
 * useRovingTabs.js
 * Shared keyboard-navigation logic for the WAI-ARIA Tabs pattern (§12),
 * used by both PrimaryModuleRow and the nested Context Filter tablist so the
 * arrow-key / roving-tabIndex behaviour isn't duplicated across the two.
 *
 * Left/Right (and Up/Down) move focus and activate the next/previous tab;
 * Home/End jump to the first/last. Matches the "automatic activation" tabs
 * pattern, appropriate here since activating a tab just swaps in-place
 * content rather than performing a destructive action.
 */
import { useRef, useCallback } from 'react';

export function useRovingTabs(ids, activeId, onActivate) {
  const refs = useRef({});

  const setRef = useCallback((id) => (el) => { refs.current[id] = el; }, []);

  const handleKeyDown = useCallback((e) => {
    const idx = ids.indexOf(activeId);
    if (idx === -1) return;
    let nextIdx = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % ids.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + ids.length) % ids.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = ids.length - 1;
    else return;

    e.preventDefault();
    const nextId = ids[nextIdx];
    onActivate(nextId);
    // Move DOM focus to the newly-active tab so roving tabIndex stays correct.
    requestAnimationFrame(() => refs.current[nextId]?.focus());
  }, [ids, activeId, onActivate]);

  const getTabProps = useCallback((id) => ({
    tabIndex: id === activeId ? 0 : -1,
    itemRef: setRef(id),
    onKeyDown: handleKeyDown,
  }), [activeId, handleKeyDown, setRef]);

  return { getTabProps };
}
