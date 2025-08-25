import React from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import Pill from './Pill.jsx';
import { IconCoin } from './Icons.jsx';
import { fmt } from '../utils/number.js';

export default function HudInfo({ fish, incomeLv, cannonCd, leftHp, rightHp, incomeCost, onUpgrade, onSpeed, speedLabel }){
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-4">
        <div><div className="text-xs text-slate-500">魚量</div><div className="text-lg font-bold tabular-nums flex items-center gap-2"><IconCoin />{fmt(fish)}</div></div>
        <div><div className="text-xs text-slate-500">收入 Lv</div><div className="text-lg font-bold">{incomeLv}</div></div>
        <div><div className="text-xs text-slate-500">大砲冷卻</div><div className="text-lg font-bold tabular-nums">{cannonCd<=0?'OK':cannonCd.toFixed(1)+'s'}</div></div>
        <Pill>左塔 {leftHp} ／ 右塔 {rightHp}</Pill>
        <Button onClick={onUpgrade}>📈 研究力 +3.2（{incomeCost} 魚）</Button>
        <Button onClick={onSpeed}>⏩ 速度 {speedLabel}</Button>
      </div>
    </Card>
  );
}
