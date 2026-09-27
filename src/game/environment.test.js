import { describe, it, expect, vi, afterEach } from 'vitest';
import { createEnv, stepEnv, getEnvModifiers, pollEnvCues } from './environment.js';
import { stepUnits, makeUnit } from './ai.js';

const DAY_NIGHT = { type: 'dayNight', dayLength: 45, nightLength: 25, warnTime: 5,
  enemyAtkMul: 1.2, enemySpeedMul: 1.15, bountyMul: 1.5, startPhase: 'day' };
const TIDE = { type: 'tide', calmLength: 24, surgeLength: 6, warnTime: 4, pushSpeed: 32 };

const mkWorld = (env, towerDistance = 750) => ({
  units: [], time: 0, leftHp: 1000, rightHp: 1000,
  cfg: { towerDistance, env }, env: createEnv(env),
});
// 以固定步長推進，模擬遊戲迴圈；回傳推進過程中收到的音效提示
const run = (w, sec, dt = 0.05) => {
  const cues = [];
  for (let t = 0; t < sec - 1e-9; t += dt) { stepEnv(w, dt); cues.push(...pollEnvCues(w)); }
  return cues;
};
const tpl = (o = {}) => ({ hp: 100, attack: 10, speed: 10, range: 10, atkRate: 1, color: '#000', name: 'x', bounty: 20, ...o });

afterEach(() => vi.restoreAllMocks());

describe('createEnv', () => {
  it('無環境 → null；world.env 結構符合設計文件 §4.2', () => {
    expect(createEnv(null)).toBeNull();
    expect(createEnv(false)).toBeNull();
    expect(createEnv({ type: 'unknown' })).toBeNull();
    expect(Object.keys(createEnv(DAY_NIGHT)).sort())
      .toEqual(['events', 'phase', 'phaseLeft', 'phaseProgress', 'type', 'warning'].sort());
    expect(createEnv(DAY_NIGHT)).toMatchObject({ type: 'dayNight', phase: 'day', phaseLeft: 45, warning: null, events: 0 });
    expect(createEnv(TIDE)).toMatchObject({ type: 'tide', phase: 'calm', phaseLeft: 24, warning: null, events: 0 });
    expect(createEnv({ ...DAY_NIGHT, startPhase: 'night' }).phase).toBe('night');
  });
});

describe('晝夜 dayNight', () => {
  it('階段切換、預告時間、進度', () => {
    const w = mkWorld(DAY_NIGHT);
    run(w, 39.9);
    expect(w.env.warning).toBeNull();
    run(w, 0.2); // t = 40.1：夜晚前 5 秒內
    expect(w.env.warning.next).toBe('night');
    expect(w.env.warning.in).toBeCloseTo(4.9, 5);
    expect(w.env.phaseProgress).toBeCloseTo(40.1 / 45, 5);
    run(w, 5); // t = 45.1
    expect(w.env).toMatchObject({ phase: 'night', events: 1, warning: null });
    expect(w.env.phaseLeft).toBeCloseTo(24.9, 5);
    run(w, 25); // t = 70.1：天亮，白天前不預告
    expect(w.env).toMatchObject({ phase: 'day', events: 2, warning: null });
  });

  it('音效提示：nightWarn → dayStart，各一次', () => {
    const w = mkWorld(DAY_NIGHT);
    expect(run(w, 150)).toEqual(['nightWarn', 'dayStart', 'nightWarn', 'dayStart']);
  });

  it('夜晚倍率：敵人攻擊 / 速度（與 berserk、slow 疊乘）、賞金；白天全為 1；我方不受影響', () => {
    const w = mkWorld(DAY_NIGHT);
    expect(getEnvModifiers(w)).toEqual({ enemyAtkMul: 1, enemySpeedMul: 1, bountyMul: 1 });
    run(w, 46);
    expect(getEnvModifiers(w)).toEqual({ enemyAtkMul: 1.2, enemySpeedMul: 1.15, bountyMul: 1.5 });

    const cat = makeUnit(1, 100, 0, tpl());
    const foe = makeUnit(-1, 700, 0, tpl({ abilities: { berserk: { threshold: 0.5, attackUp: 1 } } }));
    foe.hp = 40; foe.effects.slow = 5; foe.effects.slowFactor = 0.5;
    w.units.push(cat, foe);
    stepUnits(w, () => 900, () => 400, 0.01);
    expect(cat.atk).toBe(10);
    expect(cat.speed).toBe(10);
    expect(foe.atk).toBeCloseTo(10 * 2 * 1.2, 9);   // baseAtk × berserk × 夜晚
    expect(foe.speed).toBeCloseTo(10 * 0.5 * 1.15, 9); // baseSpeed × slow × 夜晚
  });

  it('夜晚擊殺賞金 ×1.5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // killBounty 隨機因子 = 1
    const kill = (w) => {
      const foe = makeUnit(-1, 700, 0, tpl({ bounty: 20 })); foe.hp = 0;
      w.units = [foe];
      return stepUnits(w, () => 900, () => 400, 0.01);
    };
    const w = mkWorld(DAY_NIGHT);
    const day = kill(w);
    run(w, 46);
    expect(kill(w)).toBe(Math.round(day * 1.5));
    expect(kill(mkWorld(null))).toBe(day); // 無環境與白天相同
  });
});

describe('潮汐 tide', () => {
  it('順序 calm → flood → calm → ebb → calm → flood，潮水前 4 秒預告並標示方向', () => {
    const w = mkWorld(TIDE);
    const seen = [];
    let last = null;
    for (let i = 0; i < 2000; i++) { // 100 秒
      stepEnv(w, 0.05);
      if (w.env.phase !== last) { seen.push(w.env.phase); last = w.env.phase; }
    }
    expect(seen).toEqual(['calm', 'flood', 'calm', 'ebb', 'calm', 'flood', 'calm']);

    const w2 = mkWorld(TIDE);
    run(w2, 19.9); expect(w2.env.warning).toBeNull();
    run(w2, 0.2);  expect(w2.env.warning).toMatchObject({ next: 'flood' });
    run(w2, 10);   // t = 30.1：第二段平靜
    run(w2, 20);   // t = 50.1：退潮前 3.9 秒
    expect(w2.env.phase).toBe('calm');
    expect(w2.env.warning.next).toBe('ebb');
    expect(w2.env.warning.in).toBeCloseTo(3.9, 5);
  });

  it('音效提示：floodWarn、ebbWarn 交替', () => {
    expect(run(mkWorld(TIDE), 125)).toEqual(['floodWarn', 'ebbWarn', 'floodWarn', 'ebbWarn']);
  });

  it('推力：漲潮往左、退潮往右，每秒 32px；擊退免疫與死亡單位不動；平靜不推', () => {
    const w = mkWorld(TIDE);
    const cat = makeUnit(1, 400, 0, tpl());
    const foe = makeUnit(-1, 500, 0, tpl());
    const whale = makeUnit(-1, 450, 0, tpl({ abilities: { knockbackImmune: true } }));
    const dead = makeUnit(-1, 300, 0, tpl()); dead.hp = 0;
    w.units.push(cat, foe, whale, dead);

    run(w, 24); // 平靜
    expect(cat.x).toBeCloseTo(400, 6); // 累加浮點誤差可能讓最後一幀含極微量潮水時間
    expect(foe.x).toBeCloseTo(500, 6);
    run(w, 1);  // 漲潮 1 秒
    expect(w.env.phase).toBe('flood');
    expect(cat.x).toBeCloseTo(368, 6);
    expect(foe.x).toBeCloseTo(468, 6);
    expect(whale.x).toBe(450);
    expect(dead.x).toBe(300);

    run(w, 5 + 24 + 1); // 漲潮結束、平靜 24 秒、退潮 1 秒
    expect(w.env.phase).toBe('ebb');
    expect(cat.x).toBeCloseTo(400 - 32 * 6 + 32, 6);
    expect(foe.x).toBeCloseTo(500 - 32 * 6 + 32, 6);
    expect(whale.x).toBe(450);
  });

  it('一幀跨越階段邊界時，推力只算潮水期間的時間', () => {
    const w = mkWorld(TIDE);
    const cat = makeUnit(1, 400, 0, tpl());
    w.units.push(cat);
    stepEnv(w, 23.5);
    stepEnv(w, 1); // 平靜 0.5 秒 + 漲潮 0.5 秒
    expect(cat.x).toBeCloseTo(400 - 16, 6);
  });

  it('邊界：不會被推過主堡邊界（左 68、右 towerDistance+32），已在邊界外的單位不會被拉回', () => {
    const w = mkWorld(TIDE, 750); // 右邊界 50+750-18 = 782
    const nearLeft = makeUnit(1, 75, 0, tpl());
    const outRight = makeUnit(-1, 800, 0, tpl()); // 例如被大砲擊退到邊界外
    w.units.push(nearLeft, outRight);
    run(w, 30); // 整段漲潮
    expect(nearLeft.x).toBe(68);
    expect(outRight.x).toBeCloseTo(800 - 192, 6);

    const w2 = mkWorld(TIDE, 750);
    const outLeft = makeUnit(-1, 60, 0, tpl());
    w2.units.push(outLeft);
    run(w2, 30); // 漲潮：outLeft 已在左邊界外 → 不動
    expect(outLeft.x).toBe(60);
    const nearRight = makeUnit(1, 770, 0, tpl());
    w2.units.push(nearRight);
    run(w2, 30); // 退潮：nearRight 停在右邊界；outLeft 往右推回場內
    expect(nearRight.x).toBe(782);
    expect(outLeft.x).toBeCloseTo(60 + 192, 6);
  });
});

describe('暫停與無環境', () => {
  it('dt = 0 不推進任何狀態、不推動單位', () => {
    const w = mkWorld(TIDE);
    run(w, 24.5); // 漲潮中
    const cat = makeUnit(1, 400, 0, tpl()); w.units.push(cat);
    const before = { ...w.env };
    for (let i = 0; i < 100; i++) stepEnv(w, 0);
    expect(w.env).toEqual(before);
    expect(cat.x).toBe(400);
  });

  it('world.env === null：stepEnv 無作用、倍率全為 1、無音效提示', () => {
    const w = mkWorld(null);
    const cat = makeUnit(1, 400, 0, tpl()); w.units.push(cat);
    stepEnv(w, 10);
    expect(w.env).toBeNull();
    expect(cat.x).toBe(400);
    expect(getEnvModifiers(w)).toEqual({ enemyAtkMul: 1, enemySpeedMul: 1, bountyMul: 1 });
    expect(pollEnvCues(w)).toEqual([]);
  });

  it('2x 倍速（dt 加倍）等於同樣遊戲時間的 1x', () => {
    const a = mkWorld(DAY_NIGHT), b = mkWorld(DAY_NIGHT);
    run(a, 50, 0.05); run(b, 50, 0.1);
    expect(b.env.phase).toBe(a.env.phase);
    expect(b.env.phaseLeft).toBeCloseTo(a.env.phaseLeft, 6);
  });
});
