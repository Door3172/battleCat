import React from 'react';

export default function HeroBanner({ title, subtitle, right }){
  return (
    <div className="hero-banner">
      <div className="p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="hero-title">{title}</div>
            {subtitle && (
              // 短副標（頁面名稱，如「商店」）顯示成緞帶標籤；長副標（說明文字）維持一般文字
              subtitle.length <= 8
                ? <div className="hero-tag">{subtitle}</div>
                : <div className="hero-sub mt-1.5 text-sm md:text-base">{subtitle}</div>
            )}
          </div>
          {right ? <div className="hero-chip self-start md:self-auto">{right}</div> : null}
        </div>
      </div>
    </div>
  );
}
