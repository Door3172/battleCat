import React from 'react';
import { SKIN } from '../data/skin.js';

export default function Card({ children, className='', pad='md' }) {
  const padPx = pad==='sm'?10 : pad==='lg'?18 : 14;
  return (
    <div
      className={`border ${className}`}
      style={{
        padding: padPx,
        borderRadius: SKIN.radius.xl,
        borderColor: SKIN.color.line,
        background: SKIN.grad.card(SKIN.color.cardTop, SKIN.color.cardBottom),
        boxShadow: 'var(--shadow-card, 0 14px 36px rgba(2,6,23,.10), 0 4px 14px rgba(2,6,23,.06))',
        backdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </div>
  );
}
