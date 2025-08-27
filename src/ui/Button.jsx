import React, { useRef } from 'react';
import { SKIN } from '../data/skin.js';

export default function Button({ onClick, disabled, children, size='md', tone='default', block=false, className='', title }){
  const sizes = { sm:{f:13,px:12,py:8}, md:{f:14,px:14,py:10}, lg:{f:16,px:16,py:12} };
  const s = sizes[size] || sizes.md;
  const tones = {
    default:{bg:SKIN.color.white,fg:SKIN.color.ink,br:SKIN.color.line, hov:'#f8fafc'},
    primary:{bg:SKIN.color.black,fg:SKIN.color.white,br:SKIN.color.black, hov:'#000'},
    ghost:{bg:'rgba(255,255,255,.6)',fg:SKIN.color.ink,br:SKIN.color.line, hov:'rgba(255,255,255,.9)'},
    accent:{bg:SKIN.color.accentA,fg:'#111827',br:SKIN.color.accentB, hov:SKIN.color.accentB}
  };
  const t = tones[tone] || tones.default;
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
      title={title}
      onPointerUp={handler}
      onClick={(e)=>e.preventDefault()}
      disabled={disabled}
      className={`border transition active:scale-[0.98] select-none ${block?'w-full':''} ${className}`}
      style={{
        background:t.bg, color:t.fg, borderColor:t.br,
        padding:`${s.py}px ${s.px}px`, fontSize:s.f, lineHeight:1.15,
        minHeight:SKIN.size.touch, borderRadius:SKIN.radius.pill,
        boxShadow: 'var(--shadow-soft, 0 6px 16px rgba(2,6,23,.06), 0 2px 6px rgba(2,6,23,.06))',
        touchAction:'manipulation'
      }}
      onPointerEnter={(e)=> (e.currentTarget.style.background=t.hov)}
      onPointerLeave={(e)=> (e.currentTarget.style.background=t.bg)}
    >{children}</button>
  );
}
