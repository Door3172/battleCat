import React from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Pill from '../ui/Pill.jsx';
import { fmt } from '../utils/number.js';
import { IconCoin } from '../ui/Icons.jsx';

export default function Lobby({ coins, highestUnlocked, goChapter, goLineup, goShop, goUpgrade, goCodex, goGacha, onReset }){
  return (
      <div className="space-y-4">
        <HeroBanner
          title="貓咪之戰"
          subtitle="整理隊伍、升級單位，然後一路推進章節。"
          right={<Pill>世界 {highestUnlocked[1]} / 未來 {highestUnlocked[2]}</Pill>}
        />
      <div className="grid md:grid-cols-3 gap-3">
        <Card>
          <div className="text-sm font-medium text-sub">目前資源</div>
          <div className="mt-2 flex items-center gap-2 text-3xl font-extrabold tabular-nums">
            <IconCoin />
            <span className="text-highlight number-pop">{fmt(coins)}</span>
            <span className="ml-1 text-base font-medium">金幣</span>
          </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2" aria-label="主要選單">
              <Button onClick={goChapter} tone="accent">開始遊戲</Button>
            <Button onClick={goLineup}>隊伍編成</Button>
            <Button onClick={goShop}>商店</Button>
            <Button onClick={goGacha}>轉蛋</Button>
            <Button onClick={goUpgrade}>升級</Button>
            <Button onClick={goCodex}>圖鑑</Button>
            <Button
              onClick={() => {
                if (window.confirm('確定要刪除所有存檔嗎？此動作無法復原')) onReset();
              }}
              tone="ghost"
            >
              清除存檔
            </Button>
          </div>
        </Card>
        <Card>
          <div className="font-semibold">遊玩提示</div>
          <ul className="list-disc pl-5 text-sub text-sm mt-2 space-y-1">
            <li>線性解鎖：通關後才會開啟下一關。</li>
            <li>戰鬥支援 1x/2x（按 X 或按鈕）。</li>
          </ul>
        </Card>
        <Card>
          <div className="font-semibold">操作說明</div>
          <div className="mt-2 text-sm text-sub">戰鬥中可按 <b>1~5</b> 召喚，<b>Space</b> 放砲，<b>P</b> 暫停，<b>R</b> 重開，<b>X</b> 加速。</div>
        </Card>
      </div>
    </div>
  );
}
