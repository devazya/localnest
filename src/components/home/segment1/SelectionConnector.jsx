/**
 * SelectionConnector.jsx
 * Draws the single continuous highlight shape joining the selected
 * PrimaryModuleItem's pill (top) to its active ContextFilterChip (bottom),
 * so the two read as one connected selection area instead of two separate
 * tinted elements with a gap between them — whichever module/filter pair
 * is active, and however far either row has been scrolled.
 *
 * Both rows scroll independently, so a flat CSS background can't do this —
 * the pill and the chip need to be measured live and joined with a shape
 * that tapers between their two (possibly quite different) x-positions
 * and widths. This component owns exactly that measurement + the SVG path
 * that bridges them; it renders nothing else and controls no state.
 *
 * Renders absolutely-positioned behind the two rows (negative z-index,
 * inside the .selectionStage stacking context) — the pill and chip's own
 * opaque backgrounds sit visually on top of it, unchanged.
 */
import { useLayoutEffect, useState } from 'react';

export default function SelectionConnector({ stageRef, activeModule, activeFilter }) {
  const [path, setPath] = useState(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const moduleRow = stage.querySelector('#s1-modules-panel');
    const filterRow = stage.querySelector('#s1-filters-panel');

    function recalc() {
      const pillEl = stage.querySelector(`#s1-module-pill-${activeModule}`);
      const chipEl = stage.querySelector(`#s1-filter-tab-${activeFilter}`);
      if (!stage || !pillEl || !chipEl) { setPath(null); return; }

      const stageRect = stage.getBoundingClientRect();
      const pRect = pillEl.getBoundingClientRect();
      const cRect = chipEl.getBoundingClientRect();

      // Nothing meaningful to draw if either element is scrolled fully
      // out of view (zero-width rects some browsers report at extremes).
      if (pRect.width === 0 || cRect.width === 0) { setPath(null); return; }

      const a = {
        left: pRect.left - stageRect.left,
        right: pRect.right - stageRect.left,
        bottom: pRect.bottom - stageRect.top,
      };
      const b = {
        left: cRect.left - stageRect.left,
        right: cRect.right - stageRect.left,
        top: cRect.top - stageRect.top,
      };

      // Guard against the rows not having settled into their expected
      // top-to-bottom order yet (e.g. mid-layout on first paint).
      if (b.top <= a.bottom) { setPath(null); return; }

      const midY = (a.bottom + b.top) / 2;
      const d = [
        `M ${a.left} ${a.bottom}`,
        `L ${a.right} ${a.bottom}`,
        `C ${a.right} ${midY}, ${b.right} ${midY}, ${b.right} ${b.top}`,
        `L ${b.left} ${b.top}`,
        `C ${b.left} ${midY}, ${a.left} ${midY}, ${a.left} ${a.bottom}`,
        'Z',
      ].join(' ');
      setPath(d);
    }

    recalc();

    const ro = new ResizeObserver(recalc);
    ro.observe(stage);

    moduleRow?.addEventListener('scroll', recalc, { passive: true });
    filterRow?.addEventListener('scroll', recalc, { passive: true });
    window.addEventListener('resize', recalc);

    // Covers the spring/scale entrance animation on the selected pill and
    // the fade transition on the chip — both shift geometry for ~200ms
    // after a selection change, so keep sampling briefly after mount.
    const settleTimers = [50, 150, 300, 500].map((t) => setTimeout(recalc, t));

    return () => {
      ro.disconnect();
      moduleRow?.removeEventListener('scroll', recalc);
      filterRow?.removeEventListener('scroll', recalc);
      window.removeEventListener('resize', recalc);
      settleTimers.forEach(clearTimeout);
    };
  }, [stageRef, activeModule, activeFilter]);

  if (!path) return null;

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <path d={path} fill="var(--s1-accent-secondary)" />
    </svg>
  );
}
