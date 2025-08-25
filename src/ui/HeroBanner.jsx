import React from 'react';
import { SKIN } from '../data/skin.js';

export default function HeroBanner({ title, subtitle, right }){
  return (
    <div className="rounded-3xl overflow-hidden border" style={{ borderColor: SKIN.color.line, boxShadow: 'var(--shadow-card, 0 14px 36px rgba(2,6,23,.10), 0 4px 14px rgba(2,6,23,.06))' }}>
      <div className="p-5 md:p-7" style={{ background: SKIN.grad.hero(SKIN.color.accentA, SKIN.color.accentB) }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-white" style={{ textShadow: '0 2px 0 rgba(0,0,0,.18)' }}>{title}</div>
            {subtitle && <div className="text-white/90 mt-1 font-medium">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2">{right}</div>
        </div>
      </div>
    </div>
  );
}
