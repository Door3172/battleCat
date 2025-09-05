import React, { useState } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import GachaMachine from '../ui/GachaMachine.jsx';
import { fmt } from '../utils/number.js';
import { BASE_CATS } from '../data/cats.js';
import { drawGacha, GACHA_PRICE } from '../utils/gacha.js';

export default function Gacha({ coins, setCoins, unlocks, setUnlocks, catLevels, setCatLevels, addCatName, onBack }) {
  const [last, setLast] = useState(null);

  const handleDraw = () => {
    const owned = Object.keys(unlocks).filter(k => unlocks[k]);
    const res = drawGacha(owned, coins);
    if (!res.success) return;
    setCoins(res.coins);
    if (!res.duplicate) {
      setUnlocks(u => ({ ...u, [res.catKey]: true }));
      setCatLevels(l => ({ ...l, [res.catKey]: 1 }));
      const name = BASE_CATS[res.catKey]?.name;
      if (name) addCatName(name);
    }
    setLast(res);
  };

  return (
    <div className="space-y-4">
      <HeroBanner title="貓咪大戰爭" subtitle="轉蛋" right={<span>金幣：<b className="tabular-nums">{fmt(coins)}</b></span>} />
      <Card className="space-y-3">
        <GachaMachine />
        <Button onClick={handleDraw} disabled={coins < GACHA_PRICE}>抽一次（{GACHA_PRICE} 金幣）</Button>
        {last && (
          <div className="text-slate-600">
            抽到了 <b>{BASE_CATS[last.catKey].name}</b>（{last.rarity}★）
            {last.duplicate ? `－重複，返還 ${last.refund} 金幣` : '－新角色解鎖！'}
          </div>
        )}
        <Button onClick={onBack} tone="ghost">返回</Button>
      </Card>
    </div>
  );
}
