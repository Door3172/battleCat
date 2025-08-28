import React from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Pill from '../ui/Pill.jsx';
import { fmt } from '../utils/number.js';
import { IconCoin } from '../ui/Icons.jsx';

export default function Lobby({ coins, highestUnlocked, goLevel, goLineup, goShop, goCodex }){
  return (
    <div className="space-y-4">
      <HeroBanner title="貓咪之戰(Beta)" subtitle="致敬貓咪大戰爭 — V4.8關卡調整" right={<Pill>最高解鎖 {highestUnlocked}</Pill>} />
      <div className="grid md:grid-cols-3 gap-3">
        <Card>
          <div className="text-slate-600 text-sm">狀態</div>
          <div className="text-3xl font-extrabold tabular-nums flex items-center gap-2"><IconCoin />{fmt(coins)}<span className="text-base font-medium ml-1">金幣</span></div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={goLevel} tone="accent">▶️ 開始遊戲（選關）</Button>
            <Button onClick={goLineup}>🧩 隊伍編成</Button>
            <Button onClick={goShop}>🛒 商店</Button>
            <Button onClick={goCodex}>📚 圖鑑</Button>
          </div>
        </Card>
        <Card>
          <div className="font-semibold">提示</div>
          <ul className="list-disc pl-5 text-slate-600 text-sm mt-2 space-y-1">
            <li>線性解鎖：通關後才會開啟下一關。</li>
            <li>10 關為 BOSS（敵塔 ≤60% 或時間 ≥40s 才出）。</li>
            <li>戰鬥支援 1x/2x（按 X 或按鈕）。</li>
          </ul>
        </Card>
        <Card>
          <div className="font-semibold">🧪 小提醒</div>
          <div className="text-slate-600 text-sm">戰鬥中可以按 <b>1~5</b> 召喚；<b>Space</b> 放砲；<b>P</b> 暫停；<b>R</b> 重開；<b>X</b> 加速。</div>
        </Card>
      </div>
    </div>
  );
}
