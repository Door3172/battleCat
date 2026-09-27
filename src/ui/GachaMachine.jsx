import React from 'react';

const BALLS = [
  { left: 18, top: 78, c: '#f87171' },
  { left: 52, top: 92, c: '#facc15' },
  { left: 86, top: 80, c: '#60a5fa' },
  { left: 34, top: 50, c: '#4ade80' },
  { left: 70, top: 54, c: '#f472b6' },
  { left: 100, top: 104, c: '#a78bfa' },
];

export default function GachaMachine() {
  return (
    <div className="gacha-machine" aria-hidden="true">
      <div className="gacha-globe">
        {BALLS.map((b, i) => (
          <span key={i} className="gacha-ball" style={{ left: b.left, top: b.top, background: b.c }} />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="gacha-knob" />
        <div className="gacha-slot" />
      </div>
    </div>
  );
}
