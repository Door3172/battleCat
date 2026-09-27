import { describe, it, expect, vi, afterEach } from 'vitest';
import { stepSchedule, stepUnits, makeUnit, absorbDamage, applyCannon, pushWithinBounds } from './ai.js';
import { stageConfig, getMaxStage } from '../data/stages.js';

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

  it('沒有 schedule 時什麼都不做', () => {
    const spawned = [];
    stepSchedule({ cfg: {}, time: 10, nextEnemyIdx: 0 }, t => spawned.push(t));
    expect(spawned).toEqual([]);
  });
});

// EG-008：舊的固定頻率生怪路徑已移除，所有關卡都必須靠 schedule 出怪
describe('每一關都有 schedule', () => {
  for (const chapter of [1, 2]) {
    it(`第 ${chapter} 章每關的 stageConfig().schedule 都是非空陣列`, () => {
      const max = getMaxStage(chapter);
      expect(max).toBeGreaterThan(0);
      const missing = [];
      for (let stage = 1; stage <= max; stage++) {
        const { schedule } = stageConfig(stage, chapter);
        if (!Array.isArray(schedule) || schedule.length === 0) missing.push(`${chapter}-${stage}`);
      }
      expect(missing).toEqual([]);
    });
  }
});

// ── EG-006：貓咪砲套用護盾 / 閃避 / 擊退免疫 / 邊界 ──
const tpl = (o = {}) => ({ hp: 1000, attack: 50, speed: 10, range: 20, atkRate: 1, color: '#000', name: 'x', ...o });
const mkWorld = (units = [], towerDistance = 750) => ({ units, cfg: { towerDistance }, leftHp: 1000, rightHp: 1000, time: 0 });

describe('absorbDamage（護盾先吸收）', () => {
  it('護盾吸得完：只扣護盾，回傳 0', () => {
    const u = makeUnit(-1, 400, 0, tpl()); u.shieldHp = 100;
    expect(absorbDamage(u, 80)).toBe(0);
    expect([u.shieldHp, u.hp]).toEqual([20, 1000]);
  });
  it('護盾吸不完：護盾歸零，剩下的扣 HP', () => {
    const u = makeUnit(-1, 400, 0, tpl()); u.shieldHp = 50;
    expect(absorbDamage(u, 80)).toBe(30);
    expect([u.shieldHp, u.hp]).toEqual([0, 970]);
  });
});

describe('applyCannon（貓咪砲）', () => {
  afterEach(() => vi.restoreAllMocks());

  it('一般敵人：扣血並往右推 60；我方與死亡單位不受影響', () => {
    const foe = makeUnit(-1, 400, 0, tpl());
    const cat = makeUnit(1, 300, 0, tpl());
    const dead = makeUnit(-1, 500, 0, tpl()); dead.hp = 0;
    applyCannon(mkWorld([foe, cat, dead]), 60, 60);
    expect([foe.hp, foe.x]).toEqual([940, 460]);
    expect([cat.hp, cat.x]).toEqual([1000, 300]);
    expect([dead.hp, dead.x]).toEqual([0, 500]);
  });

  it('有護盾：護盾吸得完 → HP 不變、不推開；吸不完（有扣 HP）→ 照常推開（EG-007）', () => {
    const crab = makeUnit(-1, 400, 0, tpl({ abilities: { shield: { interval: 45, amount: 500 } } }));
    crab.shieldHp = 500;
    applyCannon(mkWorld([crab]), 60, 60);
    expect([crab.shieldHp, crab.hp, crab.x]).toEqual([440, 1000, 400]);
    crab.shieldHp = 60; // 剛好吸完：扣血 0 → 仍不推
    applyCannon(mkWorld([crab]), 60, 60);
    expect([crab.shieldHp, crab.hp, crab.x]).toEqual([0, 1000, 400]);
    crab.shieldHp = 20; // 吸不完的部分扣 HP → 推開
    applyCannon(mkWorld([crab]), 60, 60);
    expect([crab.shieldHp, crab.hp, crab.x]).toEqual([0, 960, 460]);
  });

  it('擊退免疫：照常受傷，位置不變', () => {
    const whale = makeUnit(-1, 400, 0, tpl({ abilities: { knockbackImmune: true } }));
    applyCannon(mkWorld([whale]), 60, 60);
    expect([whale.hp, whale.x]).toEqual([940, 400]);
  });

  it('閃避：擲中時完全無效（不扣血、不推）；沒擲中照常', () => {
    const shark = makeUnit(-1, 400, 0, tpl({ abilities: { dodge: { chance: 0.2 } } }));
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.2 → 閃避
    applyCannon(mkWorld([shark]), 60, 60);
    expect([shark.hp, shark.x]).toEqual([1000, 400]);
    Math.random.mockReturnValue(0.5); // ≥ 0.2 → 命中
    applyCannon(mkWorld([shark]), 60, 60);
    expect([shark.hp, shark.x]).toEqual([940, 460]);
  });

  it('推開不超過主堡邊界（右邊界 50+750-18 = 782），已在邊界外的不會被拉回', () => {
    const near = makeUnit(-1, 760, 0, tpl());
    const out = makeUnit(-1, 800, 0, tpl());
    applyCannon(mkWorld([near, out], 750), 60, 60);
    expect(near.x).toBe(782);
    expect(out.x).toBe(800);
    expect([near.hp, out.hp]).toEqual([940, 940]); // 傷害照常
  });

  it('pushWithinBounds 往左推也受左邊界 68 限制', () => {
    const u = makeUnit(1, 90, 0, tpl());
    pushWithinBounds(mkWorld(), u, -60);
    expect(u.x).toBe(68);
  });
});

describe('一般攻擊仍套用相同規則（stepUnits）', () => {
  afterEach(() => vi.restoreAllMocks());

  it('打有護盾的敵人：先扣護盾', () => {
    const cat = makeUnit(1, 400, 0, tpl({ attack: 50 }));
    const foe = makeUnit(-1, 410, 0, tpl({ attack: 0 }));
    foe.shieldHp = 30;
    stepUnits(mkWorld([cat, foe]), () => 900, () => 400, 0.01);
    expect([foe.shieldHp, foe.hp]).toEqual([0, 980]);
  });

  it('打會閃避的敵人：擲中時不扣血', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const cat = makeUnit(1, 400, 0, tpl({ attack: 50 }));
    const foe = makeUnit(-1, 410, 0, tpl({ attack: 0, abilities: { dodge: { chance: 0.2 } } }));
    stepUnits(mkWorld([cat, foe]), () => 900, () => 400, 0.01);
    expect(foe.hp).toBe(1000);
  });
});

// ── EG-009：出手事件 atkSeq（UI 攻擊動畫用）──
describe('atkSeq 出手計數', () => {
  const W = () => 900, H = () => 400;
  const run = (w, sec, dt = 0.01) => { for (let i = 0; i < Math.round(sec / dt); i++) stepUnits(w, W, H, dt); };

  it('makeUnit 初始為 0', () => {
    expect(makeUnit(1, 0, 0, tpl()).atkSeq).toBe(0);
  });

  it('攻擊一次 +1；冷卻中不增加；冷卻結束再出手 +1', () => {
    const cat = makeUnit(1, 400, 0, tpl({ attack: 10, atkRate: 1 }));
    const foe = makeUnit(-1, 410, 0, tpl({ attack: 0, atkRate: 999 }));
    const w = mkWorld([cat, foe]);
    stepUnits(w, W, H, 0.01);
    expect(cat.atkSeq).toBe(1);
    expect(foe.hp).toBe(990);
    run(w, 0.5); // 冷卻中
    expect(cat.atkSeq).toBe(1);
    run(w, 0.6); // 冷卻結束
    expect(cat.atkSeq).toBe(2);
    expect(foe.hp).toBe(980);
  });

  it('打主堡也算出手', () => {
    const cat = makeUnit(1, 50 + 750 - 20, 0, tpl({ attack: 10, atkRate: 1 }));
    const w = mkWorld([cat]);
    stepUnits(w, W, H, 0.01);
    expect(cat.atkSeq).toBe(1);
    expect(w.rightHp).toBe(990);
  });

  it('AOE 有命中 +1；AOE 範圍內沒有任何目標（冷卻沒重設）不增加', () => {
    const hitter = makeUnit(1, 400, 0, tpl({ aoe: true, aoeRadius: 30, range: 20 }));
    const foe = makeUnit(-1, 410, 0, tpl({ attack: 0, atkRate: 999 }));
    const w = mkWorld([hitter, foe]);
    stepUnits(w, W, H, 0.01);
    expect(hitter.atkSeq).toBe(1);

    // 射程 50 觸發攻擊，但 AOE 半徑只有 5 → 打不到 30px 外的目標
    const misser = makeUnit(1, 400, 0, tpl({ aoe: true, aoeRadius: 5, range: 50, speed: 0 }));
    const far = makeUnit(-1, 430, 0, tpl({ attack: 0, atkRate: 999, speed: 0 }));
    const w2 = mkWorld([misser, far]);
    run(w2, 0.1);
    expect(misser.atkSeq).toBe(0);
    expect(misser.atkCd).toBeLessThanOrEqual(0);
    expect(far.hp).toBe(1000);
  });
});
