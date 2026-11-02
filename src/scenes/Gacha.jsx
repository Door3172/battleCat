import React, { useState } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import GachaMachine from '../ui/GachaMachine.jsx';
import { fmt } from '../utils/number.js';
import { BASE_CATS, GACHA_UNLOCKS } from '../data/cats.js';
import { drawGacha, GACHA_PRICE } from '../utils/gacha.js';
import { GACHA_CHARACTERS } from '../data/gachaPool.js';

// 轉蛋池還沒有角色（CEO-001 擱置中）：顯示「準備中」並停用按鈕，不要按了沒反應（UI-014）
const POOL_READY = GACHA_CHARACTERS.length > 0;

export default function Gacha({ coins, setCoins, unlocks, setUnlocks, catLevels, setCatLevels, addCatName, onBack }) {
  const [last, setLast] = useState(null);
  const [failed, setFailed] = useState(false);

  const handleDraw = () => {
    const owned = Object.keys(unlocks).filter(k => unlocks[k]);
    const res = drawGacha(owned, coins);
    setFailed(!res.success);
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
        <Button onClick={handleDraw} disabled={!POOL_READY || coins < GACHA_PRICE} tone="primary" size="lg">
          {POOL_READY ? `🎰 抽一次（${GACHA_PRICE} 金幣）` : '🎰 轉蛋準備中'}
        </Button>
        {!POOL_READY && <div className="text-sub text-sm text-center">轉蛋角色即將登場，敬請期待！金幣不會被扣除。</div>}
        {POOL_READY && coins < GACHA_PRICE && <div className="text-sub text-sm text-center">金幣不足，去打關卡賺金幣吧！</div>}
        {failed && <div className="text-sub text-sm text-center">這次沒有抽到角色，金幣未扣除，請再試一次。</div>}
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
