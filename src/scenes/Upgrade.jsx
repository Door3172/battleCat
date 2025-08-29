import React from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Pill from '../ui/Pill.jsx';
import Divider from '../ui/Divider.jsx';
import { buildCatsTpl } from '../game/world.js';
import { upgradeCost } from '../data/cats.js';
import { fmt } from '../utils/number.js';

export default function Upgrade({ coins, setCoins, unlocks, catLevels, setCatLevels, onBack }) {
  const cats = buildCatsTpl(unlocks, catLevels);
  const entries = Object.entries(catLevels);
  return (
    <div className="relative space-y-3">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button onClick={onBack}>⬅️ 返回大廳</Button>
      </div>
      <HeroBanner title="貓咪大戰爭" subtitle="升級" right={<span>金幣：<b className="tabular-nums">{fmt(coins)}</b></span>} />
      <div className="grid md:grid-cols-3 gap-3">
        {entries.map(([key, lv]) => {
          const tpl = cats[key];
          const cost = upgradeCost(lv);
          const canUpgrade = lv < 10 && coins >= cost;
          return (
            <Card key={key}>
              <div className="font-semibold">{tpl.name}</div>
              <div className="text-slate-600 text-sm mt-1">Lv.{lv} HP {tpl.hp} / ATK {tpl.attack}</div>
              <Divider />
              <div className="flex gap-2 items-center flex-wrap">
                <Button
                  onClick={() => {
                    if (!canUpgrade) return;
                    setCoins(c => c - cost);
                    setCatLevels(l => ({ ...l, [key]: lv + 1 }));
                  }}
                  disabled={!canUpgrade}
                >
                  {lv >= 10 ? '已滿級' : `升級（${cost} 金幣）`}
                </Button>
                <Pill tone="sub">成本 {tpl.cost}</Pill>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}