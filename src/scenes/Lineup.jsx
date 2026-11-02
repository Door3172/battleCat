import React, { useState } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import CatAvatar from '../ui/CatAvatar.jsx';
import { buildCatsTpl } from '../game/world.js';

export default function Lineup({ unlocks, lineup, catLevels, setLineup, addCatName, onBack }){
  const tplAll = buildCatsTpl(unlocks, catLevels);
  const [hint, setHint] = useState('');
  const nameOf = (k) => tplAll[k]?.name ?? k; // 存檔裡可能有已不存在的貓 key，不要崩潰（UI-014）
  const toggle=(key)=>{
    const idx = lineup.indexOf(key);
    if (idx >= 0) {
      if (lineup.length <= 1) { setHint('隊伍至少要有 1 隻貓咪。'); return; }
      setLineup(lineup.filter(k => k !== key));
      setHint('');
    } else {
      if (lineup.length >= 5) { setHint('隊伍最多 5 隻，請先點選要換下的貓咪。'); return; }
      setLineup([...lineup, key]);
      setHint('');
    }
    if (tplAll[key]) addCatName(tplAll[key].name);
 };

  return (
    <div className="relative space-y-3">
      <div className="flex pr-20">
        <Button onClick={onBack} tone="ghost" size="sm">← 返回大廳</Button>
      </div>
      <HeroBanner title="貓咪大戰爭" subtitle="隊伍編成" />
      <Card>
        <div className="font-semibold mb-2">可用單位（點擊加入/移除，最多 5 隻）</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" aria-label="可用單位列表">
          {Object.keys(tplAll).map(k=> (
            <Button key={k} onClick={()=>toggle(k)} size="sm" className={`!justify-start ${lineup.includes(k)?'is-selected':''}`} aria-label={`單位 ${tplAll[k].name}`}>
              <CatAvatar catKey={k} name={tplAll[k].name} size={32} />
              <span className="truncate">{tplAll[k].name}</span>
              {lineup.includes(k) && <span className="ml-auto text-xs">#{lineup.indexOf(k) + 1}</span>}
            </Button>
          ))}
        </div>
          <div className="mt-3 text-sub text-sm">目前編成（{lineup.length}/5）：{lineup.map(nameOf).join('、') || '（尚未選擇）'}</div>
          {hint && <div className="mt-1 text-sm text-highlight" role="status">{hint}</div>}
        </Card>
    </div>
  );
}
