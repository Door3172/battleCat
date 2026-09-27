import React, { useEffect } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { useAudio } from '../audio/useAudio.js';

export default function ChapterSelect({ onBack, onChoose }) {
  const audio = useAudio();

  useEffect(() => {
    audio.playMusic('bgm_lobby');
  }, [audio]);

  return (
    <div className="relative space-y-3">
      <div className="flex pr-20">
        <Button onClick={onBack} tone="ghost" size="sm">← 返回大廳</Button>
      </div>
      <HeroBanner title="貓咪大戰爭" subtitle="選擇章節" />
      <Card>
        <div className="grid sm:grid-cols-2 gap-3">
          <Button onClick={() => onChoose(1)} size="lg" className="flex-col !items-start !justify-start text-left min-h-[96px]">
            <span className="text-2xl">🌍</span>
            <span className="text-lg font-extrabold">第一章・世界篇</span>
            <span className="text-xs font-medium opacity-70">20 關｜小狗、野豬與星眼巨像</span>
          </Button>
          <Button onClick={() => onChoose(2)} size="lg" className="flex-col !items-start !justify-start text-left min-h-[96px]">
            <span className="text-2xl">🌊</span>
            <span className="text-lg font-extrabold">第二章・未來篇</span>
            <span className="text-xs font-medium opacity-70">20 關｜深海生物與幽靈鯊</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
