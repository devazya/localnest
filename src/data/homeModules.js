/**
 * homeModules.js
 * Normative Module Definitions — Design Spec v2.3 §16.
 *
 * This is the single source of truth for:
 *  - the five Primary Modules (§9.6) and their order
 *  - each module's pastel icon colors (§7)
 *  - each module's Context Filters list + first-session default (§9.6.1, §16)
 *
 * Segment 1's *engineering* scope is limited to rendering whichever filter
 * set a module is given (§16 scope note) — the dynamism described for Neibo
 * ("morning content differs from evening") is a backend/content concern.
 * These arrays are the static, correct filter sets to render today.
 */

// Simple slug helper — "Lost & Found" -> "lost-found"
export function slugify(label) {
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Small glyph per filter label, used by the Context Filter row chips.
// Falls back to no icon (plain text chip) for labels not listed here.
const FILTER_ICONS = {
  'Highlights': '✨', 'Sports': '🏆', 'Events': '📅', 'Activity': '🏃', 'Deals': '🏷️',
};

function filters(labels) {
  return labels.map((label) => ({ id: slugify(label), label, emoji: FILTER_ICONS[label] }));
}

/* ── Icon glyphs — plain path data (NOT JSX — this file stays a .js data
   module per project convention, so icons are described declaratively and
   rendered by PrimaryModuleItem.jsx, which is a .jsx file). Each icon is a
   list of SVG primitives in a 24x24 viewBox. `strokeColor`/`fillColor`
   tokens are resolved to the module's iconTone at render time. ── */
const ICONS = {
  neibo: [
    { tag: 'path', d: 'M3 11.5 12 4l9 7.5M5.5 10v9.5a1 1 0 0 0 1 1H10v-5.5h4V20.5h3.5a1 1 0 0 0 1-1V10', stroked: true },
  ],
  neara: [
    { tag: 'path', d: 'M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z', stroked: true },
    { tag: 'circle', cx: 12, cy: 9.3, r: 2.4, filled: true },
  ],
  stay: [
    { tag: 'path', d: 'M3 19v-7a2 2 0 0 1 2-2h5v3M3 19h18v-5.5a2.5 2.5 0 0 0-2.5-2.5H10M3 19v2M21 19v2M7 10V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3', stroked: true },
  ],
  marketplace: [
    { tag: 'path', d: 'M6 8h12l1 13H5L6 8Zm3 0a3 3 0 0 1 6 0', stroked: true },
  ],
  vroom: [
    { tag: 'path', d: 'M5 16.5h14M5 16.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3.5 16.5V11l1.7-4.5A2 2 0 0 1 7 5h10a2 2 0 0 1 1.9 1.4L20.5 11v5.5M3.5 11h17', stroked: true },
  ],
};

/**
 * MODULE_DEFINITIONS — order is normative: Neibo, Neara, Stay, Marketplace,
 * Vroom (§9.6). Do not add a 6th entry (§15 acceptance checklist).
 */
export const MODULE_DEFINITIONS = [
  {
    id: 'neibo',
    label: 'Neibo',
    emoji: '🏘',
    icon: ICONS.neibo,
    circleFill: '#FFE8E0',
    iconTone: '#E8734A',
    purpose: 'The heartbeat of the neighborhood — community activity, not business listings.',
    contextFilters: filters(['Highlights', 'Sports', 'Events', 'Activity', 'Deals']),
    defaultFilterId: 'highlights',
  },
  {
    id: 'neara',
    label: 'Neara',
    emoji: '📍',
    icon: ICONS.neara,
    circleFill: '#E4F0FF',
    iconTone: '#4A8FE8',
    purpose: 'Discovery of nearby businesses only — never resident listings.',
    contextFilters: filters([
      'General', 'Tea', 'Cafe', 'Restaurant', 'Bakery', 'Juice', 'Barber',
      'Salon', 'Tailor', 'Laundry', 'Mart', 'Pharmacy', 'Electronics',
      'Pet Shop', 'Printing', 'Hardware',
    ]),
    defaultFilterId: 'general',
  },
  {
    id: 'stay',
    label: 'Stay',
    emoji: '🛏',
    icon: ICONS.stay,
    circleFill: '#FFF3D6',
    iconTone: '#D9A441',
    purpose: 'The single accommodation ecosystem.',
    contextFilters: filters([
      'Boys PG', 'Girls PG', 'Co-living', 'Hostels',
      'Hotels', 'BnB', 'Short Stay', 'Service Apartments',
    ]),
    defaultFilterId: 'boys-pg',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    emoji: '🛒',
    icon: ICONS.marketplace,
    circleFill: '#F0E8FF',
    iconTone: '#8B5CF6',
    purpose: 'Resident-to-resident commerce — community listings only.',
    contextFilters: filters([
      'Electronics', 'Furniture', 'Books', 'Fashion',
      'Gaming', 'Cycles', 'Rent', 'Exchange', 'Miscellaneous',
    ]),
    defaultFilterId: 'electronics',
  },
  {
    id: 'vroom',
    label: 'Vroom',
    emoji: '🚗',
    icon: ICONS.vroom,
    circleFill: '#E0F7F5',
    iconTone: '#3AAFA0',
    purpose: 'Neighborhood transportation.',
    contextFilters: filters([
      'Office Ride', 'Airport', 'Metro', 'Cab Share', 'Bike Pool',
      'Weekend Ride', 'Recurring Ride', 'Women Only', 'Trusted Drivers',
    ]),
    defaultFilterId: 'office-ride',
  },
];

export const MODULE_BY_ID = Object.fromEntries(MODULE_DEFINITIONS.map((m) => [m.id, m]));

/** Initial `lastFilterByModule` state — §14. */
export function buildInitialFilterMemory() {
  return Object.fromEntries(MODULE_DEFINITIONS.map((m) => [m.id, m.defaultFilterId]));
}
