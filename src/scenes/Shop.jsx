import React from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Pill from '../ui/Pill.jsx';
import Divider from '../ui/Divider.jsx';
import CatAvatar from '../ui/CatAvatar.jsx';
import { SHOP_UNLOCKS } from '../data/cats.js';
import { fmt } from '../utils/number.js';

export default function Shop({ coins, unlocks, onBack, onBuy }) {
  return (
    <div className="relative space-y-3">
      <div className="flex pr-20">
        <Button onClick={onBack} tone="ghost" size="sm">← 返回大廳</Button>
      </div>
      <HeroBanner title="貓咪大戰爭" subtitle="商店" right={<span>金幣：<b className="tabular-nums">{fmt(coins)}</b></span>} />
      <div className="grid md:grid-cols-3 gap-3">
        {Object.entries(SHOP_UNLOCKS).map(([key, item]) => (
          <Card key={key}>
            <div className="flex items-center gap-3">
              <CatAvatar catKey={key} name={item.name} size={56} />
              <div className="min-w-0">
                <div className="font-semibold">解鎖：{item.name}</div>
                <div className="text-sub text-sm mt-1">加入可編組單位</div>
              </div>
            </div>
            <Divider />
            <div className="flex gap-2 items-center flex-wrap">
              <Button onClick={() => onBuy(key, item)} disabled={unlocks[key] || coins < item.price} tone={unlocks[key] ? 'ghost' : 'primary'}>{unlocks[key] ? '已解鎖' : `購買（${item.price} 金幣）`}</Button>
              <Pill tone="sub">成本 {item.tpl.cost}</Pill>
              <Pill tone="sub">HP {item.tpl.hp}</Pill>
              <Pill tone="sub">ATK {item.tpl.attack}</Pill>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
