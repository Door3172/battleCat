import React from 'react';
import { SKIN } from '../data/skin.js';

export default function Pill({ children, tone='default', className='' }){
  return (
    <span
      className={`inline-flex items-center border ${className}`}
      style={{
        padding:'4px 10px', fontSize:12, borderRadius:SKIN.radius.pill,
        background: SKIN.color.white,
        color: tone==='sub'? SKIN.color.mute : SKIN.color.ink,
        borderColor: SKIN.color.line
      }}
    >{children}</span>
  );
}
