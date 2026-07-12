/**
 * useHomeSegment1.js
 * Client state for the Home Segment 1 module selector (§14).
 *
 *  1. `activeModule`      — which Primary Module is currently shown (single
 *                           value, not per-module). Defaults to 'neibo' per
 *                           §9.6 ("the what's-happening-right-now module
 *                           most aligned with the Home philosophy in §1").
 *  2. `lastFilterByModule` — the last-selected Context Filter, remembered
 *                           independently per module (§9.6.1 UX refinement).
 *                           A single Record<ModuleId,string> lookup, not
 *                           five separate useState calls — this is the
 *                           "hard requirement, not a suggestion" data shape
 *                           the spec calls out in §14, since a single shared
 *                           value would silently leak one module's selection
 *                           into another's when switching rapidly.
 *
 * On module switch: read lastFilterByModule[newModule] — never reset.
 * On filter tap: write lastFilterByModule[activeModule] = newFilter.
 */
import { useCallback, useState } from 'react';
import { MODULE_DEFINITIONS, buildInitialFilterMemory } from '../data/homeModules';

const DEFAULT_MODULE = 'neibo';

export function useHomeSegment1() {
  const [activeModule, setActiveModuleState] = useState(DEFAULT_MODULE);
  const [lastFilterByModule, setLastFilterByModule] = useState(buildInitialFilterMemory);

  const activeFilter = lastFilterByModule[activeModule];

  const selectModule = useCallback((moduleId) => {
    setActiveModuleState((prev) => (prev === moduleId ? prev : moduleId));
  }, []);

  const selectFilter = useCallback((filterId) => {
    setLastFilterByModule((prev) => (
      prev[activeModule] === filterId ? prev : { ...prev, [activeModule]: filterId }
    ));
  }, [activeModule]);

  return {
    modules: MODULE_DEFINITIONS,
    activeModule,
    activeFilter,
    selectModule,
    selectFilter,
  };
}
