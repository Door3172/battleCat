import React from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Pill from '../ui/Pill.jsx';
import Divider from '../ui/Divider.jsx';
import { buildCatsTpl } from '../game/world.js';
import { upgradeCost } from '../data/cats.js';
import { fmt } from '../utils/number.js';

export default function Upgrade({ coins, setCoins, unlocks, catLevels, setCatLevels, researchLv, setResearchLv, cannonLv, setCannonLv, castleLv, setCastleLv, onBack }) {
  const cats = buildCatsTpl(unlocks, catLevels);
  // 以完整模板列出所有可升級單位，缺少等級資訊時預設為 1 級
  const entries = Object.keys(cats).map(k => [k, catLevels[k] || 1]);
  const researchCost = upgradeCost(researchLv);
  const canUpgradeResearch = researchLv < 10 && coins >= researchCost;
  const cannonCost = upgradeCost(cannonLv);
  const canUpgradeCannon = cannonLv < 10 && coins >= cannonCost;
  const castleCost = upgradeCost(castleLv);
  const canUpgradeCastle = castleLv < 10 && coins >= castleCost;
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
                <div className="text-sub text-sm mt-1">Lv.{lv} HP {tpl.hp} / ATK {tpl.attack}</div>
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
        <Card>
            <div className="font-semibold">研究力</div>
            <div className="text-sub text-sm mt-1">Lv.{researchLv} 初始收入 {(7.5 + 4.5 * (researchLv - 1)).toFixed(1)}</div>
          <Divider />
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              onClick={() => {
                if (!canUpgradeResearch) return;
                setCoins(c => c - researchCost);
                setResearchLv(l => l + 1);
              }}
              disabled={!canUpgradeResearch}
            >
              {researchLv >= 10 ? '已滿級' : `升級（${researchCost} 金幣）`}
            </Button>
          </div>
        </Card>
        <Card>
            <div className="font-semibold">貓砲攻擊力</div>
            <div className="text-sub text-sm mt-1">Lv.{cannonLv} ATK {60 + (cannonLv - 1) * 10}</div>
          <Divider />
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              onClick={() => {
                if (!canUpgradeCannon) return;
                setCoins(c => c - cannonCost);
                setCannonLv(l => l + 1);
              }}
              disabled={!canUpgradeCannon}
            >
              {cannonLv >= 10 ? '已滿級' : `升級（${cannonCost} 金幣）`}
            </Button>
          </div>
        </Card>
        <Card>
            <div className="font-semibold">主堡血量</div>
            <div className="text-sub text-sm mt-1">Lv.{castleLv} HP {1000 + (castleLv - 1) * 100}</div>
          <Divider />
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              onClick={() => {
                if (!canUpgradeCastle) return;
                setCoins(c => c - castleCost);
                setCastleLv(l => l + 1);
              }}
              disabled={!canUpgradeCastle}
            >
              {castleLv >= 10 ? '已滿級' : `升級（${castleCost} 金幣）`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}