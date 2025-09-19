import { ENEMIES, BOSSES } from '../data/enemies.js';
import { BODY_W } from './world.js';

/*
能力設定 (abilities key 說明)
lifesteal      吸血：{ chance:機率0~1, percent:回復比例0~1 }
freeze         凍結：{ chance:機率, duration:秒數 }
knockback      擊退：{ chance:機率, distance:距離像素 }
slow           緩速：{ chance:機率, duration:秒數, factor:速度倍率(預設0.5) }
critical       暴擊：{ chance:機率, multiplier:傷害倍率(預設2) }
shield         護盾：{ interval:刷新秒數, amount:護盾血量 }
revive         再生：{ chance:機率, percent:復活後血量百分比 }
berserk        狂暴：{ threshold:觸發血量百分比, attackUp:攻擊力提升比例(0.1 = +10%) }
dodge          閃避：{ chance:機率 }
freezeImmune   凍結免疫：true/false
knockbackImmune擊退免疫：true/false
slowImmune     緩速免疫：true/false

範例：
const archer = {
  // ... 其他屬性
  abilities: {
    critical: { chance:0.25, multiplier:2 }, // 25% 機率造成 2 倍傷害
    lifesteal: { chance:0.1, percent:0.2 }, // 10% 機率吸血 20%
    freezeImmune: true                      // 免疫凍結
  }
};
*/

export function groundY(getCanvasHeight) {
  return getCanvasHeight() * 0.72;
}

export function makeUnit(team, x, y, tpl) {
  return {
    id: Math.random().toString(36).slice(2),
    team, x, y,
    hp: tpl.hp, maxHp: tpl.hp,
    speed: tpl.speed, baseSpeed: tpl.speed,
    atk: tpl.attack, baseAtk: tpl.attack, range: tpl.range,
    atkRate: tpl.atkRate, atkCd: 0,
    color: tpl.color, name: tpl.name, bounty: tpl.bounty || 0,
    aoe: !!tpl.aoe,
    aoeRadius: tpl.aoeRadius ?? undefined,
    aoeMinRadius: tpl.aoeMinRadius ?? 0,
    maxTargets: tpl.maxTargets ?? undefined,
    abilities: tpl.abilities || {},
    effects: {},
    shieldHp: 0,
    shieldCd: tpl.abilities && tpl.abilities.shield ? 0 : undefined,
    revived: false,
  };
}

const killBounty = (tpl, cfg) => Math.round((tpl.bounty || 12) * (0.9 + Math.random() * 0.2) * (0.8 + (cfg.difficulty || 1) * 0.1));

function computeScale(cfg, world) {
  const stageFactor = 1 + Math.max(0, (cfg.stageIndex || 1) - 1) * 0.08; // 每關 +8%
  const timeSec = Math.min(world.time || 0, 180);
  const timeFactor = 1 + timeSec * 0.004;                               // 每秒 +0.4%
  const spawnFactor = 1 + Math.min((world.totalSpawns || 0) * 0.015, 0.45);// 每隻 +1.5%
  return (cfg.difficulty || 1) * stageFactor * timeFactor * spawnFactor;
}

export function spawnEnemy(world, getCanvasWidth, getCanvasHeight, onEnemySeen, forcedKey, statMultiplier = 100, applyScale = true) {
  const { cfg } = world;
  const cur = world.units.filter(u => u.team === -1).length;
  if (cur >= cfg.maxEnemies) return;

  const gy = groundY(getCanvasHeight);
  const leftX = 50;
  const rightX = leftX + world.cfg.towerDistance;

  let key = forcedKey;
  if (!key) {
    if (world.enemyIndex == null) world.enemyIndex = 0;
    const seq = Array.isArray(cfg.sequence) && cfg.sequence.length ? cfg.sequence : null;
    const pool = (!seq && cfg.pool && cfg.pool.length) ? cfg.pool : null;
    key = 'dog';
    if (seq) key = seq[world.enemyIndex % seq.length];
    else if (pool) key = pool[world.enemyIndex % pool.length];
    world.enemyIndex = (world.enemyIndex || 0) + 1;
  }

  if (applyScale) world.totalSpawns = (world.totalSpawns || 0) + 1;
  if (BOSSES[key]) {
    const base = BOSSES[key];
    const sc = applyScale ? computeScale(cfg, world) : 1;
    const tpl = {
      ...base,
      hp: Math.round(base.hp * sc * statMultiplier / 100),
      maxHp: Math.round(base.hp * sc * statMultiplier / 100),
      attack: Math.round(base.attack * (1.0 + (sc - 1) * 0.6) * statMultiplier / 100)
    };
    world.units.push(makeUnit(-1, rightX - 30, gy - 8, tpl));
    world.bossSpawned = true;
    onEnemySeen && onEnemySeen(base.name);
    return;
  }

  const base = ENEMIES[key] || ENEMIES.dog;
  const sc = applyScale ? computeScale(cfg, world) : 1;
  const tpl = {
    ...base,
    hp: Math.round(base.hp * sc * statMultiplier / 100),
    maxHp: Math.round(base.hp * sc * statMultiplier / 100),
    attack: Math.round(base.attack * (applyScale ? (0.9 + (sc - 1) * 0.5) : 1) * statMultiplier / 100) // 無隨機因子
  };

  world.units.push(makeUnit(-1, rightX - 30, gy - 8, tpl));
  onEnemySeen && onEnemySeen(base.name);
}

export function spawnBossIfNeeded(world, getCanvasWidth, getCanvasHeight, onEnemySeen) {
  const { cfg } = world;
  if (!(cfg.isBoss && !world.bossSpawned)) return;
  if (typeof cfg.bossAt === 'number' && world.time < cfg.bossAt) return;
  if (typeof cfg.bossHp === 'number' && world.rightHp > cfg.bossHp) return;

  const cur = world.units.filter(u => u.team === -1).length;
  if (cur >= cfg.maxEnemies) return;

  const gy = groundY(getCanvasHeight);
  const leftX = 50;
  const rightX = leftX + world.cfg.towerDistance;
  const base = BOSSES[cfg.bossKey] || BOSSES.boarKing;
  const sc = computeScale(cfg, world);
  const mult = cfg.bossMultiplier ?? 100;
  const scaled = {
    ...base,
    hp: Math.round(base.hp * sc * mult / 100),
    maxHp: Math.round(base.hp * sc * mult / 100),
    attack: Math.round(base.attack * (1.0 + (sc - 1) * 0.6) * mult / 100)
  };
  world.units.push(makeUnit(-1, rightX - 30, gy - 8, scaled));
  world.bossSpawned = true;
  onEnemySeen && onEnemySeen(scaled.name);
}

export function stepUnits(world, getCanvasWidth, getCanvasHeight, dt) {
  const leftX = 50;
  const rightX = leftX + world.cfg.towerDistance;
  let bounty = 0;

  function dealAttack(attacker, target) {
    let dmg = attacker.atk;
    const crit = attacker.abilities?.critical;
    if (crit && Math.random() < crit.chance) {
      dmg *= crit.multiplier ?? 2;
    }

    let dealt = 0;
    if (target) {
      const dodge = target.abilities?.dodge;
      if (!(dodge && Math.random() < dodge.chance)) {
        if (target.shieldHp > 0) {
          const sh = target.shieldHp - dmg;
          if (sh >= 0) { target.shieldHp = sh; dmg = 0; }
          else { target.shieldHp = 0; dmg = -sh; }
        }
        if (dmg > 0) { target.hp -= dmg; dealt = dmg; }
      }
    } else {
      dealt = dmg;
    }

    const ls = attacker.abilities?.lifesteal;
    if (ls && dealt > 0 && Math.random() < ls.chance) {
      const heal = dealt * ls.percent;
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
    }

    if (target && dealt > 0) {
      const fr = attacker.abilities?.freeze;
      if (fr && !target.abilities?.freezeImmune && Math.random() < fr.chance) {
        target.effects.frozen = Math.max(target.effects.frozen || 0, fr.duration);
      }
      const kb = attacker.abilities?.knockback;
      if (kb && !target.abilities?.knockbackImmune && Math.random() < kb.chance) {
        target.x += kb.distance * (attacker.team === 1 ? 1 : -1);
      }
      const sl = attacker.abilities?.slow;
      if (sl && !target.abilities?.slowImmune && Math.random() < sl.chance) {
        target.effects.slow = Math.max(target.effects.slow || 0, sl.duration);
        target.effects.slowFactor = sl.factor ?? 0.5;
      }
    }
    return dealt;
  }

  function damageTower(attacker) {
    const key = attacker.team === 1 ? 'rightHp' : 'leftHp';
    const before = world[key];
    const dealt = dealAttack(attacker, null);
    world[key] = before - dealt;
    if (world.debug || (typeof process !== 'undefined' && process.env.DEBUG_TOWER)) {
      console.log(`${attacker.name}@${attacker.x} ${key}: ${before} -> ${world[key]}`);
    }
  }

  for (let i = 0; i < world.units.length; i++) {
    const u = world.units[i];
    if (u.hp <= 0) continue;

    const ab = u.abilities || {};
    // shield refresh
    if (ab.shield) {
      u.shieldCd = (u.shieldCd ?? 0) - dt;
      if (u.shieldCd <= 0) {
        u.shieldHp = ab.shield.amount;
        u.shieldCd = ab.shield.interval;
      }
    }

    // frozen effect
    if (u.effects.frozen > 0) {
      u.effects.frozen -= dt;
      if (u.effects.frozen > 0) {
        continue;
      } else {
        u.effects.frozen = 0;
      }
    }

    // slow effect
    if (u.effects.slow > 0) {
      u.effects.slow -= dt;
      if (u.effects.slow <= 0) {
        u.effects.slow = 0;
        delete u.effects.slowFactor;
      }
    }

    const speedFactor = u.effects.slow > 0 ? (u.effects.slowFactor ?? 0.5) : 1;
    u.speed = u.baseSpeed * speedFactor;

    u.atk = u.baseAtk;
    // berserk
    if (ab.berserk) {
      const { threshold, attackUp } = ab.berserk;
      if (u.hp <= u.maxHp * threshold) {
        u.atk = u.baseAtk * (1 + attackUp);
      }
    }

    // 最近目標
    let target = null, best = 1e9;
    for (let j = 0; j < world.units.length; j++) {
      if (i === j) continue;
      const v = world.units[j];
      if (v.hp <= 0 || v.team === u.team) continue;
      const d = Math.abs(v.x - u.x);
      if (d < best) { best = d; target = v; }
    }

    const enemyBaseX = u.team === 1 ? rightX : leftX;
    const distBase = Math.abs(enemyBaseX - u.x);

    u.atkCd -= dt;
    const dist = target ? Math.abs(target.x - u.x) : Infinity;
    const triggerRange = u.range + BODY_W * 0.4;
    const trigger = (target && dist <= triggerRange && dist >= (u.aoeMinRadius ?? 0)) ||
      distBase <= triggerRange;

    if (u.atkCd <= 0 && trigger) {
      if (u.aoe) {
        const rMax = (u.aoeRadius ?? u.range) + BODY_W * 0.4;
        const rMin = u.aoeMinRadius ?? 0;
        let hits = 0;
        for (let k = 0; k < world.units.length; k++) {
          const t = world.units[k];
          if (t.hp <= 0 || t.team === u.team) continue;
          const distToAttacker = Math.abs(t.x - u.x);
          if (distToAttacker <= rMax && distToAttacker >= rMin) {
            dealAttack(u, t);
            hits++;
            if (u.maxTargets && hits >= u.maxTargets) break;
          }
        }
        if (distBase <= rMax && (!u.maxTargets || hits < u.maxTargets)) {
          damageTower(u);
          hits++;
        }
        if (hits > 0) u.atkCd = u.atkRate;
      } else {
        if (target && dist <= triggerRange && dist >= (u.aoeMinRadius ?? 0)) {
          dealAttack(u, target);
        } else {
          damageTower(u);
        }
        u.atkCd = u.atkRate;
      }
    }

    // 移動
    let move = u.speed * dt * (u.team === 1 ? 1 : -1);
    if (target) {
      const d = Math.abs(target.x - u.x);
      const stopDist = Math.max(u.range * 0.98, u.aoeMinRadius ?? 0);
      const stop = d <= stopDist;
      if (stop) move = 0;
      if (d < BODY_W * 0.9) move = 0;
    }
    if ((u.team === 1 && u.x >= rightX - 18) || (u.team === -1 && u.x <= leftX + 18)) move = 0;
    u.x += move;
  }

  // 清屍 + 賞金（這裡保留原隨機，因為不影響出怪時間/種類）
  const next = [];
  for (const u of world.units) {
    if (u.hp > 0) next.push(u);
    else {
      const rv = u.abilities?.revive;
      if (rv && !u.revived && Math.random() < rv.chance) {
        u.hp = Math.round(u.maxHp * rv.percent);
        u.revived = true;
        next.push(u);
      } else if (u.team === -1) {
        bounty += killBounty(u, world.cfg);
      }
    }
  }
  world.units = next;
  return bounty;
}
