import React from 'react';
import { SKIN } from '../data/skin.js';

export default function SlotTray({ children }){
  return (
    <div className="rounded-3xl border p-2 md:p-3" style={{ borderColor: SKIN.color.line, background: SKIN.grad.card('rgba(255,255,255,.96)', 'rgba(248,250,252,.86)'), boxShadow: 'var(--shadow-card, 0 14px 36px rgba(2,6,23,.10), 0 4px 14px rgba(2,6,23,.06))' }}>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
        style={{ gridAutoRows: 'minmax(92px, auto)' }}
        role="list"
        aria-label="裝備欄位"
      >
        {children}
      </div>
    </div>
  );
}
