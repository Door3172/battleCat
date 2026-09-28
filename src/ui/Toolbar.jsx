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
      // battle-toolbar：戰鬥控制區樣式（含停用轉場，見 styles.css）
      <div className={`battle-toolbar grid lg:grid-cols-[1.6fr_1fr] gap-4 ${posClass} ${className}`}>
        <Card className={cardClassName}>
          {left}
        </Card>
        <Card className={cardClassName}>
          {right}
        </Card>
      </div>
    );
  }
