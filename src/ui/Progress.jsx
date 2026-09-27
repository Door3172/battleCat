import React from 'react';

export default function Progress({
  value,
  max = 1,
  w = 120,
  h = 8,
  bg,
  color,
  className = '',
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      className={className}
      style={{
        width: `var(--progress-width, ${w}px)`,
        height: `var(--progress-height, ${h}px)`,
        borderRadius: 999,
        border: '1px solid var(--color-line)',
        background: bg ?? 'var(--progress-bg)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: 999,
          transition: 'width 0.2s ease',
          background:
            color ??
            'var(--progress-color, linear-gradient(90deg, var(--color-ok), var(--color-primary)))',
        }}
      />
    </div>
  );
}

