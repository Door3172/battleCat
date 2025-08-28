import React from 'react';
import { SKIN } from '../data/skin.js';

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
        borderRadius: SKIN.radius.pill,
        border: `1px solid ${SKIN.color.line}`,
        background: bg ?? 'var(--progress-bg, #e5e7eb)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          background:
            color ??
            `var(--progress-color, linear-gradient(90deg, ${SKIN.color.ok}, #34d399))`,
        }}
      />
    </div>
  );
}

