import React, { useEffect } from 'react';
import { SKIN } from '../data/skin.js';

export default function Dialog({ show, onClose, children, fullscreen = true }) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  const panelStyle = {
    borderColor: SKIN.color.line,
    background: `linear-gradient(180deg, ${SKIN.color.cardTop}, ${SKIN.color.cardBottom})`,
    boxShadow: SKIN.shadow.card,
    color: SKIN.color.ink,
    backdropFilter: 'blur(14px)',
  };

  return (
    <div
      className={`${fullscreen ? 'fixed' : 'absolute'} inset-0 grid place-items-center bg-black/50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => { if (show) onClose?.(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="rounded-2xl border px-4 py-3 text-center"
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
