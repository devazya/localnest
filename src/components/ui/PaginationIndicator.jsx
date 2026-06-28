export default function PaginationIndicator({ total = 3, active = 0 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 8,
            width: i === active ? 28 : 8,
            borderRadius: 9999,
            background: i === active ? '#6D4CFF' : '#DDD8FF',
            transition: 'width 0.3s ease, background 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}
