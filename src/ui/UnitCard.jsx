import React from 'react';
import CatAvatar from './CatAvatar.jsx';
import { ROLE_INFO } from './catRoles.js';

// 圖鑑卡片：頭像＋名稱＋定位標籤，左側色條依定位上色（樣式見 styles.css .unit-card.<role>）
export default function UnitCard({ name, role, catKey }) {
  const info = ROLE_INFO[role];
  return (
    <div className={`unit-card ${info ? role : 'unknown'}`}>
      <CatAvatar catKey={catKey} name={name} size={40} />
      <div className="min-w-0">
        <div className="name truncate">{name}</div>
        {info && <span className="unit-role">{info.icon} {info.label}</span>}
      </div>
    </div>
  );
}
