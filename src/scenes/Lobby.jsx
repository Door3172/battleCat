import React, { useEffect } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { fmt } from '../utils/number.js';
import { IconCoin } from '../ui/Icons.jsx';
import { useAudio } from '../audio/useAudio.js';

export default function Lobby({ coins, highestUnlocked, goChapter, goLineup, goShop, goUpgrade, goCodex, goGacha, onReset }){
  const audio = useAudio();

  useEffect(() => {
    audio.playMusic('bgm_lobby');
  }, [audio]);

  const menu = [
    { icon: '🐾', label: '隊伍編成', onClick: goLineup },
    { icon: '🛒', label: '商店', onClick: goShop },
    { icon: '🎰', label: '轉蛋', onClick: goGacha },
    { icon: '⬆️', label: '升級', onClick: goUpgrade },
    { icon: '📖', label: '圖鑑', onClick: goCodex },
  ];

  return (
    <div className="space-y-4">
      <HeroBanner
        title="貓咪之戰"
        subtitle="整理隊伍、升級單位，然後一路推進章節！"
        right={<span>🗺️ 世界 {highestUnlocked[1]}・未來 {highestUnlocked[2]}</span>}
      />
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2" pad="lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="coin-badge" aria-label={`目前金幣 ${fmt(coins)}`}>
              <IconCoin width={24} height={24} />
              <span key={coins} className="number-pop tabular-nums">{fmt(coins)}</span>
              <small>金幣</small>
            </div>
            <Button
              onClick={() => {
                if (window.confirm('確定要刪除所有存檔嗎？此動作無法復原')) onReset();
              }}
              tone="ghost"
              size="sm"
            >
              🗑️ 清除存檔
            </Button>
          </div>
          <div className="mt-4 space-y-3" aria-label="主要選單">
            <Button onClick={goChapter} tone="primary" size="lg" sizeMap={{ lg: { f: 22, px: 20, py: 12 } }} block className="lobby-start">▶ 開始遊戲</Button>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {menu.map(m => (
                <Button key={m.label} onClick={m.onClick} className="menu-tile">
                  <span className="menu-tile-icon" aria-hidden="true">{m.icon}</span>
                  <span>{m.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
        <div className="grid gap-4 content-start">
          <Card>
            <div className="font-semibold text-lg">💡 遊玩提示</div>
            <ul className="tip-list">
              <li><span aria-hidden="true">🔓</span><span>通關後才會開啟下一關。</span></li>
              <li><span aria-hidden="true">⏩</span><span>戰鬥可切換 1x / 2x 速度。</span></li>
              <li><span aria-hidden="true">🌗</span><span>各章有不同的戰場規則，記得看預告！</span></li>
            </ul>
          </Card>
          <Card>
            <div className="font-semibold text-lg">🎮 操作說明</div>
            <ul className="tip-list">
              <li><span className="kbd">1</span>~<span className="kbd">5</span><span>召喚貓咪</span></li>
              <li><span className="kbd">Space</span><span>貓咪砲</span></li>
              <li><span className="kbd">P</span><span>暫停</span><span className="kbd">R</span><span>重開</span><span className="kbd">X</span><span>加速</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
