import React, { useRef } from 'react';
import { SKIN } from '../data/skin.js';

export default function Button({
  onClick,
  disabled,
  children,
  size = 'md',
  tone = 'default',
  block = false,
  className = '',
  title,
  toneMap = {},
  sizeMap = {},
}) {
  const defaultSizes = {
    sm: { f: 13, px: 12, py: 8 },
    md: { f: 14, px: 14, py: 10 },
    lg: { f: 16, px: 16, py: 12 },
  };
  const s = { ...defaultSizes, ...sizeMap }[size] || defaultSizes.md;
  const defaultTones = {
    default: { bg: SKIN.color.white, fg: SKIN.color.ink, br: SKIN.color.line, hov: '#f8fafc' },
    primary: { bg: SKIN.color.primary, fg: SKIN.color.white, br: SKIN.color.primaryHover, hov: SKIN.color.primaryHover },
    ghost: {
      bg: 'rgba(255,255,255,.6)',
      fg: SKIN.color.ink,
      br: SKIN.color.line,
      hov: 'rgba(255,255,255,.9)',
    },
    accent: {
      bg: SKIN.color.secondary,
      fg: SKIN.color.white,
      br: SKIN.color.secondaryHover,
      hov: SKIN.color.secondaryHover,
    },
  };
  const t = { ...defaultTones, ...toneMap }[tone] || defaultTones.default;
  const btnLock = useRef(false);

  const handler = (e)=>{
    if(disabled) return;
    if(btnLock.current) return;
    btnLock.current = true;
    try{ onClick && onClick(e); }
    finally{ setTimeout(()=>(btnLock.current=false), 120); }
  };

  return (
    <button
      type="button"
      title={title}
      onPointerUp={handler}
      onClick={handler}
      disabled={disabled}
      aria-disabled={disabled}
      className={`border transition-colors duration-300 active:scale-95 select-none rounded-xl bg-gradient-to-b from-[var(--btn-from)] to-[var(--btn-to)] [color:var(--btn-fg)] border-[var(--btn-br)] shadow-[var(--btn-shadow)] [font-family:var(--btn-font)] px-[var(--btn-px)] py-[var(--btn-py)] [font-size:var(--btn-fs)] min-h-[var(--btn-min-h)] leading-[1.15] [touch-action:manipulation] hover:from-[var(--btn-hov-from)] hover:to-[var(--btn-hov-to)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--btn-br)] disabled:opacity-50 disabled:pointer-events-none ${block ? 'w-full' : ''} ${className}`}
      style={{
        '--btn-from': t.bg,
        '--btn-to': t.br,
        '--btn-hov-from': t.hov,
        '--btn-hov-to': t.br,
        '--btn-fg': t.fg,
        '--btn-br': t.br,
        '--btn-py': `${s.py}px`,
        '--btn-px': `${s.px}px`,
        '--btn-fs': `${s.f}px`,
        '--btn-min-h': `${SKIN.size.touch}px`,
        '--btn-shadow': '0 4px 12px rgba(0,0,0,0.15)',
        '--btn-font': SKIN.font.display,
      }}
    >
      {children}
    </button>
  );
}
