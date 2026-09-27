import React from 'react';
import CatAvatar from './CatAvatar.jsx';

export default function UnitCard({ name, type='ninja', catKey }) {
  return (
    <div className={`unit-card ${type}`}>
      <CatAvatar catKey={catKey} name={name} size={40} />
      <div className="name">{name}</div>
    </div>
  );
}
