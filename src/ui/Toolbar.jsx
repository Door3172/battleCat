import React from 'react';
import Card from './Card.jsx';

export default function Toolbar({
  left,
  right,
  position,
  side = 'top',
  className = '',
  cardClassName = '',
}) {
  const posClass = position
    ? `${position} ${side === 'bottom' ? 'bottom-0' : 'top-0'} w-full z-10`
    : '';
  return (
    <div className={`grid md:grid-cols-2 gap-3 ${posClass} ${className}`}>
      <Card className={`shadow-md bg-white/80 dark:bg-slate-800/80 ${cardClassName}`}>
        {left}
      </Card>
      <Card className={`shadow-md bg-white/80 dark:bg-slate-800/80 ${cardClassName}`}>
        {right}
      </Card>
    </div>
  );
}
