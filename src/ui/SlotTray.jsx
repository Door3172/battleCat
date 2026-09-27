import React from 'react';

export default function SlotTray({ children }){
  return (
    <div className="slot-tray p-2 md:p-3">
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
        style={{ gridAutoRows: 'minmax(92px, auto)' }}
        role="list"
        aria-label="裝備欄位"
      >
        {children}
      </div>
    </div>
  );
}
