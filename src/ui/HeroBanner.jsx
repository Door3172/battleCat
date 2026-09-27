import React from 'react';

export default function HeroBanner({ title, subtitle, right }){
  return (
    <div className="hero-banner">
      <div className="p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="hero-title">{title}</div>
            {subtitle && <div className="hero-sub mt-1.5 text-sm font-medium md:text-base">{subtitle}</div>}
          </div>
          {right ? <div className="hero-chip self-start md:self-auto">{right}</div> : null}
        </div>
      </div>
    </div>
  );
}
