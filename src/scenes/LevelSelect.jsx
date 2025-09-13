import React, { useEffect } from 'react';   // 👈 加 useEffect
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { useAudio } from '../audio/useAudio.js'; // 👈 加

export default function LevelSelect({ maxStage, highestUnlocked, onBack, onChoose }) {
  const audio = useAudio();

  useEffect(() => {
    audio.playMusic('bgm_lobby');
  }, [audio]);

  return (
    <div className="relative space-y-3">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button onClick={onBack}>⬅️ 返回章節</Button>
        </div>
      <HeroBanner title="貓咪大戰爭" subtitle="選擇關卡" />
      <Card>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Array.from({ length: maxStage }, (_, i) => i + 1).map(n => {
                const locked = n > highestUnlocked;
                return (
                  <button
                    key={n}
                    onPointerUp={() => { if (locked) return; onChoose(n); }}
                    className={`stage-btn ${locked ? 'locked' : ''} ${n % 10 === 0 ? 'boss' : ''}`}
                  >
                    {n}{n % 10 === 0 ? '⭐' : ''}
                  </button>
                );
              })}
        </div>
          <div className="text-xs text-sub mt-2">⭐ 每 10 關為 BOSS 關</div>
        </Card>
    </div>
  );
}
