import React, { useEffect } from 'react';
import { SKIN } from '../data/skin.js';

export default function Dialog({ show, onClose, children }) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  return (
    <div
      className={`fixed inset-0 grid place-items-center bg-black/50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => { if (show) onClose?.(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white/85 backdrop-blur rounded-2xl border shadow px-4 py-3 text-center"
        style={{ borderColor: SKIN.color.line }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
