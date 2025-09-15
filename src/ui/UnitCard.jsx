import React from 'react';

export default function UnitCard({ name, type='ninja', attack=50, hp=100 }) {
  return (
    <div className={`unit-card ${type}`}>
      <div className="name">{name}</div>
      <div className="stats">
        <span className="attack">{attack}</span>
        <span className="hp">{hp}</span>
      </div>
    </div>
  );
}
