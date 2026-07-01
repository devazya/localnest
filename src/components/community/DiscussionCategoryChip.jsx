/**
 * DiscussionCategoryChip.jsx — Community module (Segment 3)
 * Small pill showing a discussion's category, tinted with its Community
 * channel's color. Reused on DiscussionCard and inside CreateDiscussionSheet.
 */

export default function DiscussionCategoryChip({ label, color = '#6D4AFF', size = 'sm' }) {
  if (!label) return null;
  const isSm = size === 'sm';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isSm ? '2px 9px' : '5px 12px',
        borderRadius: 999,
        fontSize: isSm ? 10.5 : 12.5,
        fontWeight: 700,
        color,
        background: `${color}14`,
        border: `1px solid ${color}2A`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}
