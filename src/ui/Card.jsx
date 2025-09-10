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
    light: {
      bgTop: SKIN.color.cardTop,
      bgBottom: SKIN.color.cardBottom,
      border: SKIN.color.line,
      shadow: SKIN.shadow.card,
    },
    dark: {
      bgTop: 'rgba(30,41,59,.92)',
      bgBottom: 'rgba(15,23,42,.78)',
      border: '#334155',
      shadow: '0 14px 36px rgba(0,0,0,.5),0 4px 14px rgba(0,0,0,.2)',
    },
  };
  const t = tones[tone] || tones.light;
  return (
    <div
      className={cn('border', bgClass, borderClass, shadowClass, className)}
      style={{
        padding: padPx,
        borderRadius: SKIN.radius.xl,
        backdropFilter: 'blur(6px)',
        background: `linear-gradient(180deg, ${t.bgTop}, ${t.bgBottom})`,
        borderColor: t.border,
        boxShadow: t.shadow,
        fontFamily: SKIN.font.sans,
      }}
    >
      {children}
    </div>
  );
}
