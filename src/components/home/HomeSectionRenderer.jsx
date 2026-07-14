import { Suspense } from 'react';
import HomeSectionErrorBoundary from './HomeSectionErrorBoundary';

/**
 * HomeSectionRenderer
 * ---------------------------------------------------------------------
 * Reads a HOME_SECTIONS-shaped config array, resolves final order
 * (orderOverride[id] ?? section.defaultOrder), drops disabled/
 * unimplemented (component === null) sections, and renders the rest —
 * each wrapped in its own error boundary and, when `lazy: true`, its
 * own Suspense boundary — so:
 *   - one section's failure never blocks the others
 *   - lazy sections don't block the initial paint of eager ones
 *   - the section sequence is entirely config-driven, not JSX order
 *
 * @param {Object} props
 * @param {import('../../config/homeSections').HomeSectionConfig[]} props.sections
 * @param {Record<string, number>} [props.orderOverride] - e.g. from getHomeSectionOrder()
 * @param {Function} props.onNavigate - passed through to every section
 * @param {Object} [props.fallback] - custom loading fallback node for lazy sections
 */
export default function HomeSectionRenderer({ sections, orderOverride = {}, onNavigate, fallback = null }) {
  const resolved = sections
    .filter((s) => s.enabled && s.component != null)
    .map((s) => ({
      ...s,
      resolvedOrder: orderOverride[s.id] ?? s.defaultOrder,
    }))
    .sort((a, b) => a.resolvedOrder - b.resolvedOrder);

  return (
    <>
      {resolved.map((section) => {
        const SectionComponent = section.component;
        const node = <SectionComponent onNavigate={onNavigate} dataSource={section.dataSource} />;

        return (
          <HomeSectionErrorBoundary key={section.id} sectionId={section.id}>
            {section.lazy ? (
              <Suspense fallback={fallback}>{node}</Suspense>
            ) : (
              node
            )}
          </HomeSectionErrorBoundary>
        );
      })}
    </>
  );
}
