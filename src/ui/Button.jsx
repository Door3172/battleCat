import React, { useRef } from 'react';
import { cn } from '../utils/cn.js';

// 外觀全部由 styles.css 的 .ui-btn* 與主題 CSS 變數決定，切換主題即時生效。
const SIZES = {
  sm: { f: 13, px: 12, py: 8 },
  md: { f: 14, px: 16, py: 10 },
  lg: { f: 16, px: 20, py: 12 },
};

const TONE_CLASS = {
  default: '',
  primary: 'ui-btn-primary',
  accent: 'ui-btn-accent',
  ghost: 'ui-btn-ghost',
};

export default function Button({
  onClick,
  disabled,
  children,
  size = 'md',
  tone = 'default',
  block = false,
  className = '',
  title,
  sizeMap = {},
  ...rest
}) {
  const s = { ...SIZES, ...sizeMap }[size] || SIZES.md;
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
      aria-label={rest['aria-label']}
      onPointerUp={handler}
      onClick={handler}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn('ui-btn', TONE_CLASS[tone] ?? '', block && 'w-full', className)}
      style={{ padding: `${s.py}px ${s.px}px`, fontSize: s.f }}
    >
      {children}
    </button>
  );
}
