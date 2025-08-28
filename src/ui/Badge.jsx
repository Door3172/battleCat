import React from 'react';
import { SKIN } from '../data/skin.js';

export default function Badge({ children, tone = 'ok', size = 'md', className = '' }) {
  const toneClass = tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : 'bg-danger';
  const sizeMap = {
    sm: { fontSize: 10, padding: '1px 6px' },
    md: { fontSize: 11, padding: '2px 8px' },
  };
  const { fontSize, padding } = sizeMap[size] || sizeMap.md;
  return (
    <span
      className={`inline-flex items-center text-white shadow-soft ${toneClass} ${className}`}
      style={{ fontSize, padding, borderRadius: SKIN.radius.pill }}
    >
      {children}
    </span>
  );
}
