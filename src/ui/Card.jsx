import React from 'react';
import { SKIN } from '../data/skin.js';
import { cn } from '../utils/cn.js';

export default function Card({
  children,
  className='',
  pad='md',
  tone='light',
  bgClass,
  borderClass,
  shadowClass,
}) {
  const padPx = pad==='sm'?10 : pad==='lg'?18 : 14;
  const tones = {
    light:{
      bg:'bg-[linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.78))]',
      border:'border-[#e5e7eb]',
      shadow:'shadow-[0_14px_36px_rgba(2,6,23,.10),0_4px_14px_rgba(2,6,23,.06)]',
    },
    dark:{
      bg:'bg-[linear-gradient(180deg,rgba(30,41,59,.92),rgba(15,23,42,.78))]',
      border:'border-[#334155]',
      shadow:'shadow-[0_14px_36px_rgba(0,0,0,.5),0_4px_14px_rgba(0,0,0,.2)]',
    }
  };
  const t = tones[tone] || tones.light;
  return (
    <div
      className={cn('border', t.bg, t.border, t.shadow, bgClass, borderClass, shadowClass, className)}
      style={{
        padding: padPx,
        borderRadius: SKIN.radius.xl,
        backdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </div>
  );
}
