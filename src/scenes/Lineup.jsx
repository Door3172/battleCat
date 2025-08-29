import React from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Pill from '../ui/Pill.jsx';
import { buildCatsTpl } from '../game/world.js';

<<<<<<< ours
export default function Lineup({ unlocks, lineup, catLevels, setLineup, addCatName, onBack }){
  const tplAll = buildCatsTpl(unlocks, catLevels);
=======
export default function Lineup({ unlocks, lineup, setLineup, addCatName, onBack, goShop, goUpgrade }) {
  const tplAll = buildCatsTpl(unlocks);
>>>>>>> theirs
  const toggle=(key)=>{
    const idx = lineup.indexOf(key);
    let next;
    if (idx >= 0) {
      next = lineup.filter(k => k !== key);
    } else {
      next = lineup.length < 5 ? [...lineup, key] : lineup;
    }
    setLineup(next);
    if (tplAll[key]) addCatName(tplAll[key].name);
 };

  return (
    <div className="relative space-y-3">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button onClick={onBack}>⬅️ 返回大廳</Button>
        <Button onClick={goShop}>🛒 商店</Button>
        <Button onClick={goUpgrade}>⬆️ 升級</Button>
      </div>
      <HeroBanner title="貓咪大戰爭" subtitle="隊伍編成" />
      <Card>
        <div className="font-semibold mb-2">可用單位（點擊加入/移除，最多 5 隻）</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" aria-label="可用單位列表">
          {Object.keys(tplAll).map(k=> (
            <Button key={k} onClick={()=>toggle(k)} size="sm" className={lineup.includes(k)?'ring-1 ring-emerald-300':''} aria-label={`單位 ${tplAll[k].name}`}>{tplAll[k].name}</Button>
          ))}
        </div>
        <div className="mt-3 text-slate-600 text-sm">目前編成：{lineup.map(k=>tplAll[k].name).join('、') || '（尚未選擇）'}</div>
      </Card>
    </div>
  );
}
