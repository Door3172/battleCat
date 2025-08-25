import React from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Pill from '../ui/Pill.jsx';
import Button from '../ui/Button.jsx';

export default function Codex({ cats, enemies, onBack }){
  return (
    <div className="space-y-3">
      <HeroBanner title="貓咪大戰爭" subtitle="圖鑑" />
      <div className="grid md:grid-cols-2 gap-3">
        <Card>
          <div className="font-semibold mb-1">我方單位</div>
          <div className="flex flex-wrap gap-2">{cats.map(n=> <Pill key={n}>{n}</Pill>)}</div>
        </Card>
        <Card>
          <div className="font-semibold mb-1">敵方單位（已遇見）</div>
          <div className="flex flex-wrap gap-2">
            {enemies.length===0? <span className="text-slate-500 text-sm">未遇見敵人，進入戰鬥試試看！</span> : enemies.map(n=> <Pill key={n}>{n}</Pill>)}
          </div>
        </Card>
      </div>
      <div className="flex gap-2"><Button onClick={onBack}>⬅️ 返回大廳</Button></div>
    </div>
  );
}
