import React from 'react';
import { SKIN } from '../data/skin.js';

export function IconCat({ size=18 }){
  return (
    <span style={{ display:'inline-block', width:size, height:size, position:'relative' }}>
      <span style={{ position:'absolute', inset:0, borderRadius:8, background:'#fff', border:`2px solid ${SKIN.color.ink}` }} />
      <span style={{ position:'absolute', left:3, top:-3, width:6, height:8, borderLeft:`2px solid ${SKIN.color.ink}`, borderTop:`2px solid ${SKIN.color.ink}` }} />
      <span style={{ position:'absolute', right:3, top:-3, width:6, height:8, borderRight:`2px solid ${SKIN.color.ink}`, borderTop:`2px solid ${SKIN.color.ink}` }} />
    </span>
  );
}

export function IconCoin({ size=14 }){
  return <span style={{ display:'inline-block', width:size, height:size, borderRadius:999, background:SKIN.color.accentA, border:`1px solid ${SKIN.color.accentB}` }} />;
}
