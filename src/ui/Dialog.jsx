import React from 'react';
import { SKIN } from '../data/skin.js';

export default function Dialog({ show, children }){
  return (
    <div className={`${show ? '' : 'hidden'} absolute inset-0 grid place-items-center`} style={{ pointerEvents: show?'auto':'none' }}>
      <div className="bg-white/85 backdrop-blur rounded-2xl border shadow px-4 py-3 text-center" style={{ borderColor: SKIN.color.line }}>{children}</div>
    </div>
  );
}
