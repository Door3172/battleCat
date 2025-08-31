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
      <div className="absolute top-4 right-4 flex gap-2">
        <Button onClick={onBack}>⬅️ 返回大廳</Button>
      </div>
      <HeroBanner title="貓咪大戰爭" subtitle="選擇章節" />
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => onChoose(1)}>世界篇</Button>
          <Button onClick={() => onChoose(2)}>未來篇</Button>
        </div>
      </Card>
    </div>
  );
}
