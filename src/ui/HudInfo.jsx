import React from 'react';
import Button from './Button.jsx';
import Pill from './Pill.jsx';
import { fmt } from '../utils/number.js';

function Stat({ label, children }) {
  return (
    <dl className="hud-stat">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="text-lg font-extrabold tabular-nums">{children}</dd>
    </dl>
  );
}

// 外層已由 Toolbar 包成 Card，這裡不再套 Card。
export default function HudInfo({ fish, incomeLv, cannonCd, leftHp, rightHp, incomeCost, incomeInc, onUpgrade, onSpeed, speedLabel }){
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="魚量"><span className="icon icon-gold text-highlight">{fmt(fish)}</span></Stat>
        <Stat label="收入 Lv">{incomeLv}</Stat>
        <Stat label="大砲冷卻">{cannonCd<=0?'OK':cannonCd.toFixed(1)+'s'}</Stat>
      </div>
      <Pill className="w-full justify-center" aria-label={`左塔 ${leftHp}／右塔 ${rightHp}`}>🏰 我方 {leftHp} ／ 敵方 {rightHp}</Pill>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button onClick={onUpgrade} tone="accent"><span className="icon icon-upgrade">收入升級 +{incomeInc.toFixed(1)}/秒（{incomeCost} 魚）</span></Button>
        <Button onClick={onSpeed}><span className="icon icon-speed">速度 {speedLabel}</span></Button>
      </div>
    </div>
  );
}
