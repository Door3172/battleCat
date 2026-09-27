import React from 'react';

export default function UnitCard({ name, type='ninja' }) {
  return (
    <div className={`unit-card ${type}`}>
      <div className="name">{name}</div>
    </div>
  );
}
