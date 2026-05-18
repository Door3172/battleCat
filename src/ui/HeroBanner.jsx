import React from 'react';

export default function HeroBanner({ title, subtitle, right }){
  return (
    <div
      className="hero-banner overflow-hidden rounded-[24px] border"
      style={{ borderColor: 'var(--color-line)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="p-5 md:p-7" style={{ background: 'var(--gradient-hero)' }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="hero-title text-white">{title}</div>
            {subtitle && <div className="mt-2 text-sm font-medium text-white/88 md:text-base">{subtitle}</div>}
          </div>
          {right ? <div className="flex items-center gap-2 self-start md:self-auto">{right}</div> : null}
        </div>
      </div>
    </div>
  );
}
