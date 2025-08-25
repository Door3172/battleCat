import React from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { MAX_STAGE } from '../data/stages.js';

export default function LevelSelect({ highestUnlocked, onBack, onChoose }){
  return (
    <div className="space-y-3">
      <HeroBanner title="貓咪大戰爭" subtitle="選擇關卡" right={<Button onClick={onBack}>⬅️ 返回</Button>} />
      <Card>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({length:MAX_STAGE},(_,i)=>i+1).map(n=>{
            const locked = n>highestUnlocked;
            return (
              <button key={n} onPointerUp={()=>{ if(locked) return; onChoose(n); }} className={`px-2 py-2 rounded-xl border text-sm shadow-sm ${locked?'bg-slate-100 text-slate-400 cursor-not-allowed':'bg-white hover:bg-slate-50'} ${n%10===0?'ring-1 ring-amber-300':''}`}>
                {n}{n%10===0?'⭐':''}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-slate-600 mt-2">⭐ 每 10 關為 BOSS 關（敵塔 ≤60% 或時間 ≥40s 才會出現）</div>
      </Card>
    </div>
  );
}
