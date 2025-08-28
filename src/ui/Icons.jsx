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

export function IconGear({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block' }}
    >
      <path
        d="M10.325 4.317a1 1 0 0 1 1.35-.937l1.518.506a1 1 0 0 0 1.042-.27l1.06-1.06a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 0 1 0 1.414l-1.06 1.06a1 1 0 0 0-.27 1.042l.506 1.518a1 1 0 0 1-.937 1.35l-1.6-.107a1 1 0 0 0-1.052.684l-.492 1.477a1 1 0 0 1-1.9 0l-.492-1.477a1 1 0 0 0-1.052-.684l-1.6.107a1 1 0 0 1-.937-1.35l.506-1.518a1 1 0 0 0-.27-1.042l-1.06-1.06a1 1 0 0 1 0-1.414L7.83 2.556a1 1 0 0 1 1.414 0l1.06 1.06a1 1 0 0 0 1.042.27l1.518-.506ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        fill={SKIN.color.ink}
      />
    </svg>
  );
}
