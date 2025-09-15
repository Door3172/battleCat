import React from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import Pill from './Pill.jsx';
import { fmt } from '../utils/number.js';

export default function HudInfo({ fish, incomeLv, cannonCd, leftHp, rightHp, incomeCost, incomeInc, onUpgrade, onSpeed, speedLabel }){
  return (
    <Card>
      <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-4">
          <dl>
            <dt className="text-xs text-mute">魚量</dt>
            <dd className="text-lg font-bold tabular-nums"><span className="icon icon-gold">{fmt(fish)}</span></dd>
          </dl>
          <dl>
            <dt className="text-xs text-mute">收入 Lv</dt>
            <dd className="text-lg font-bold">{incomeLv}</dd>
          </dl>
          <dl>
            <dt className="text-xs text-mute">大砲冷卻</dt>
            <dd className="text-lg font-bold tabular-nums">{cannonCd<=0?'OK':cannonCd.toFixed(1)+'s'}</dd>
          </dl>
        <Pill aria-label={`左塔 ${leftHp}／右塔 ${rightHp}`}>左塔 {leftHp} ／ 右塔 {rightHp}</Pill>
        <Button onClick={onUpgrade}><span className="icon icon-upgrade">研究力 +{incomeInc.toFixed(1)}（{incomeCost} 魚）</span></Button>
        <Button onClick={onSpeed}><span className="icon icon-speed">速度 {speedLabel}</span></Button>
      </div>
    </Card>
  );
}
