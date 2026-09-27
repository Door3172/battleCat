import React, { useEffect, useState } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Dialog from '../ui/Dialog.jsx';
import { useAudio } from '../audio/useAudio.js';
import { stageConfig } from '../data/stages.js';
import { ENV_TYPES, hasSeenEnvTip, markEnvTipSeen } from '../ui/envInfo.js';

export default function LevelSelect({ chapter = 1, maxStage, highestUnlocked, onBack, onChoose }) {
  const audio = useAudio();
  // 首次遇到某種環境：進戰鬥前先顯示說明（{ stage, type }）
  const [tip, setTip] = useState(null);

  useEffect(() => {
    audio.playMusic('bgm_lobby');
  }, [audio]);

  const stages = Array.from({ length: maxStage }, (_, i) => {
    const n = i + 1;
    const cfg = stageConfig(n, chapter);
    return { n, isBoss: cfg.isBoss, envType: cfg.env?.type ?? null };
  });
  const envTypesHere = [...new Set(stages.map(s => s.envType).filter(Boolean))];

  const choose = (s) => {
    if (s.envType && ENV_TYPES[s.envType] && !hasSeenEnvTip(s.envType)) {
      setTip({ stage: s.n, type: s.envType });
      return;
    }
    onChoose(s.n);
  };

  const startAfterTip = () => {
    if (!tip) return;
    markEnvTipSeen(tip.type);
    const n = tip.stage;
    setTip(null);
    onChoose(n);
  };

  const tipInfo = tip ? ENV_TYPES[tip.type] : null;

  return (
    <div className="relative space-y-3">
      <div className="flex pr-20">
        <Button onClick={onBack} tone="ghost" size="sm">← 返回章節</Button>
      </div>
      <HeroBanner title="貓咪大戰爭" subtitle="選擇關卡" />
      <Card>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {stages.map(s => {
            const locked = s.n > highestUnlocked;
            const env = s.envType ? ENV_TYPES[s.envType] : null;
            return (
              <button
                key={s.n}
                type="button"
                // 只用 onClick：滑鼠、觸控、鍵盤（Enter / 空白鍵）每次操作都只觸發一次
                onClick={() => { if (locked) return; audio.playClick(); choose(s); }}
                aria-disabled={locked || undefined}
                aria-label={`第 ${s.n} 關${s.isBoss ? '（BOSS）' : ''}${env ? `（${env.name}）` : ''}${locked ? '（未解鎖）' : ''}`}
                className={`stage-btn ${locked ? 'locked' : ''} ${s.isBoss ? 'boss' : ''}`}
                title={env ? `${env.name}：${env.summary}` : undefined}
              >
                {s.n}{s.isBoss ? '⭐' : ''}
                {env && <span className="stage-env" aria-label={env.name}>{env.icon}</span>}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-sub mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span>⭐ 標記的關卡會出現 BOSS</span>
          {envTypesHere.map(t => ENV_TYPES[t] && (
            <span key={t}>{ENV_TYPES[t].icon} {ENV_TYPES[t].name}：{ENV_TYPES[t].summary}</span>
          ))}
        </div>
      </Card>

      <Dialog show={!!tip} onClose={() => setTip(null)}>
        {tipInfo && (
          <div className="w-[min(92vw,440px)] space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="text-4xl" aria-hidden="true">{tipInfo.icon}</span>
              <div>
                <div className="text-xs font-semibold text-mute">新的戰場規則</div>
                <div className="text-xl font-extrabold">{tipInfo.name}</div>
              </div>
            </div>
            <p className="text-sm text-sub m-0">{tipInfo.summary}</p>
            <ul className="env-tip-list">
              {tipInfo.tips.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <Button tone="ghost" onClick={() => setTip(null)}>返回</Button>
              <Button tone="primary" onClick={startAfterTip}>知道了，開始戰鬥</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
