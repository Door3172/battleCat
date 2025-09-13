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
  const padPx = pad==='sm'?SKIN.size.padSm : pad==='lg'?SKIN.size.padLg : SKIN.size.padMd;
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
      className={cn('border transition-shadow duration-300', bgClass, borderClass, shadowClass, className)}
      style={{
        padding: padPx,
        borderRadius: SKIN.radius.sm,
        backdropFilter: 'blur(6px)',
        background: `linear-gradient(180deg, ${t.bgTop}, ${t.bgBottom})`,
        borderColor: t.border,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        fontFamily: SKIN.font.sans,
      }}
    >
      {children}
    </div>
  );
}
