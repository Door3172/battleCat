import React from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import Pill from './Pill.jsx';
import { IconCoin } from './Icons.jsx';
import { fmt } from '../utils/number.js';

export default function HudInfo({ fish, incomeLv, cannonCd, leftHp, rightHp, incomeCost, incomeInc, onUpgrade, onSpeed, speedLabel }){
  return (
    <Card>
      <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-4">
        <dl>
          <dt className="text-xs text-slate-500">魚量</dt>
          <dd className="text-lg font-bold tabular-nums flex items-center gap-2"><IconCoin />{fmt(fish)}</dd>
        </dl>
        <dl>
          <dt className="text-xs text-slate-500">收入 Lv</dt>
          <dd className="text-lg font-bold">{incomeLv}</dd>
        </dl>
        <dl>
          <dt className="text-xs text-slate-500">大砲冷卻</dt>
          <dd className="text-lg font-bold tabular-nums">{cannonCd<=0?'OK':cannonCd.toFixed(1)+'s'}</dd>
        </dl>
        <Pill aria-label={`左塔 ${leftHp}／右塔 ${rightHp}`}>左塔 {leftHp} ／ 右塔 {rightHp}</Pill>
        <Button onClick={onUpgrade}>📈 研究力 +{incomeInc.toFixed(1)}（{incomeCost} 魚）</Button>
        <Button onClick={onSpeed}>⏩ 速度 {speedLabel}</Button>
      </div>
    </Card>
  );
}
