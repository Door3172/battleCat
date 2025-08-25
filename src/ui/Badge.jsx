import React from 'react';
import { SKIN } from '../data/skin.js';

export default function Badge({ children, tone='ok' }){
  const bg = tone==='ok'?SKIN.color.ok : (tone==='warn'?SKIN.color.warn:SKIN.color.danger);
  return (
    <span style={{
      fontSize:11, borderRadius:SKIN.radius.pill, padding:'2px 8px',
      background:bg, color:'#fff', boxShadow:'var(--shadow-soft, 0 6px 16px rgba(2,6,23,.06), 0 2px 6px rgba(2,6,23,.06))'
    }}>{children}</span>
  );
}
