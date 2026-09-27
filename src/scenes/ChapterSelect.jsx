import React, { useEffect } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { useAudio } from '../audio/useAudio.js';
import * as stages from '../data/stages.js';
import { ENV_TYPES } from '../ui/envInfo.js';

// 章節環境：以 stages.js 的 CHAPTER_ENV 為準（尚未提供時用設計文件的預設）
const chapterEnv = (ch) => ENV_TYPES[stages.CHAPTER_ENV?.[ch]?.type ?? { 1: 'dayNight', 2: 'tide' }[ch]];

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
            <EnvRule env={chapterEnv(1)} />
          </Button>
          <Button onClick={() => onChoose(2)} size="lg" className="flex-col !items-start !justify-start text-left min-h-[96px]">
            <span className="text-2xl">🌊</span>
            <span className="text-lg font-extrabold">第二章・未來篇</span>
            <span className="text-xs font-medium opacity-70">20 關｜深海生物與幽靈鯊</span>
            <EnvRule env={chapterEnv(2)} />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function EnvRule({ env }) {
  if (!env) return null;
  return (
    <span className="chapter-env">
      <b>{env.icon} 戰場規則：{env.name}</b>
      <span>{env.summary}</span>
    </span>
  );
}
