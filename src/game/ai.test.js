import { describe, it, expect } from 'vitest';
import { stepSchedule } from './ai.js';
import { stageConfig } from '../data/stages.js';

// 以固定步長推進 stepSchedule；hpAt(t) 決定敵堡 HP。回傳生成紀錄 [{ type, mult, t }]
function simulate(cfg, seconds, hpAt, dt = 1 / 60) {
  const w = { cfg, time: 0, rightHp: hpAt(0), nextEnemyIdx: 0 };
  const log = [];
  for (let f = 0; f < Math.round(seconds / dt); f++) {
    w.time += dt;
    w.rightHp = hpAt(w.time);
    stepSchedule(w, (type, mult) => log.push({ type, mult, t: w.time }));
  }
  return log;
}

describe('stepSchedule 單次出怪（EG-004）', () => {
  it('while 被前面的 time+hp 條目卡住時，後面的單次條目不會重複生成', () => {
    const cfg = {
      schedule: [
        { time: 1, type: 'boar', hp: 500 },   // 卡住 while 直到 HP ≤ 500
        { time: 6, type: 'black' },
        { time: 21, type: 'alien' },
        { start: 5, interval: 10, type: 'dog' },
      ],
    };
    const log = simulate(cfg, 100, t => (t < 60 ? 1000 : 400));
    const count = type => log.filter(s => s.type === type).length;
    expect(count('boar')).toBe(1);
    expect(count('black')).toBe(1);
    expect(count('alien')).toBe(1);
    expect(log.find(s => s.type === 'black').t).toBeCloseTo(6, 1);
    expect(log.find(s => s.type === 'boar').t).toBeCloseTo(60, 1);
    expect(count('dog')).toBe(10); // 週期出怪不受影響：5, 15, …, 95
  });

  it('1-10：time 6 / 21 的黑影怪整場各只出現一次，每個單次條目最多生成一次', () => {
    const cfg = stageConfig(10, 1);
    // EC-001 模擬情境：前 94.5 秒敵堡 HP 未降到門檻，之後降到 878
    simulate(cfg, 180, t => (t < 94.5 ? cfg.enemyBaseHp : 878));
    const singles = cfg.schedule.filter(e => e.time !== undefined && !e.interval);
    expect(singles.length).toBeGreaterThan(0);
    for (const e of singles) expect(e._spawned).toBe(1);
  });

  it('沒有 schedule 時回傳 false（交給舊的固定頻率路徑）', () => {
    expect(stepSchedule({ cfg: {}, time: 0, nextEnemyIdx: 0 }, () => {})).toBe(false);
  });
});
