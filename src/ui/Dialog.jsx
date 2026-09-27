import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Dialog({ show, onClose, children, fullscreen = true }) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  const node = (
    <div
      className={`ui-dialog-backdrop ${show ? 'is-open' : ''} ${fullscreen ? 'fixed' : 'absolute'} inset-0 grid place-items-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => { if (show) onClose?.(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="ui-dialog px-5 py-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  // 全螢幕對話框掛到 body：外框 .game-background 有 backdrop-filter，
  // 會讓 position: fixed 改成相對外框定位，頁面一長對話框就跑到畫面外。
  if (fullscreen && typeof document !== 'undefined') return createPortal(node, document.body);
  return node;
}
