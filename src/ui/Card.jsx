import React from 'react';
import { SKIN } from '../data/skin.js';
import { cn } from '../utils/cn.js';

// 外觀由 styles.css 的 .ui-card / .ui-card-dark 決定。
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
  return (
    <div
      className={cn(
        tone === 'dark' ? 'ui-card-dark' : 'ui-card',
        bgClass,
        borderClass,
        shadowClass,
        className,
      )}
      style={{ padding: padPx }}
    >
      {children}
    </div>
  );
}
