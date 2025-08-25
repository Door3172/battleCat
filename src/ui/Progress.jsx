import React from 'react';
import { SKIN } from '../data/skin.js';

export default function Progress({ value, max=1, w=120, h=8 }){
  const pct = Math.max(0, Math.min(1, value/max));
  return (
    <div style={{ width:w, height:h, borderRadius:SKIN.radius.pill, border:`1px solid ${SKIN.color.line}`, background:'#e5e7eb', overflow:'hidden' }}>
      <div style={{ width:`${pct*100}%`, height:'100%', background:`linear-gradient(90deg, ${SKIN.color.ok}, #34d399)` }} />
    </div>
  );
}
