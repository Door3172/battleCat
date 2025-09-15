import React from 'react';

export default function HeroBanner({ title, subtitle, right }){
  return (
    <div className="hero-banner rounded-3xl overflow-hidden border" style={{ borderColor: 'var(--color-line)', boxShadow: 'var(--shadow-card)' }}>
      <div className="p-5 md:p-7" style={{ background: 'var(--gradient-hero)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="hero-title text-[28px] md:text-[36px] font-extrabold tracking-tight text-white" style={{ textShadow: 'var(--shadow-text)' }}>{title}</div>
            {subtitle && <div className="text-white/90 mt-1 font-medium">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2">{right}</div>
        </div>
      </div>
    </div>
  );
}
