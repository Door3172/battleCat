import React, { useState } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import GachaMachine from '../ui/GachaMachine.jsx';
import { fmt } from '../utils/number.js';
import { BASE_CATS, GACHA_UNLOCKS } from '../data/cats.js';
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
      const name = (BASE_CATS[res.catKey] || GACHA_UNLOCKS[res.catKey])?.name;
      if (name) addCatName(name);
    }
    setLast(res);
  };

  return (
    <div className="relative space-y-3">
      <div className="flex pr-20">
        <Button onClick={onBack} tone="ghost" size="sm">← 返回大廳</Button>
      </div>
      <HeroBanner title="貓咪大戰爭" subtitle="轉蛋" right={<span>金幣：<b className="tabular-nums">{fmt(coins)}</b></span>} />
      <Card className="flex flex-col items-center gap-4 py-6">
        <GachaMachine />
        <Button onClick={handleDraw} disabled={coins < GACHA_PRICE} tone="primary" size="lg">🎰 抽一次（{GACHA_PRICE} 金幣）</Button>
        {last && (
          <div className="text-sub text-center">
            抽到了 <b className="text-highlight">{(BASE_CATS[last.catKey] || GACHA_UNLOCKS[last.catKey]).name}</b>（{last.rarity}★）
            {last.duplicate ? `－重複，返還 ${last.refund} 金幣` : '－新角色解鎖！'}
          </div>
        )}
      </Card>
    </div>
  );
}
