export function spawnEnemy(world, getCanvasWidth, getCanvasHeight, onEnemySeen){
  const { cfg } = world;
  const cur = world.units.filter(u=>u.team===-1).length;
  if (cur >= cfg.maxEnemies) return;

  const gy = groundY(getCanvasHeight);
  const cw = getCanvasWidth();

  // ✅ BOSS 固定時間出現
  if (cfg.isBoss && !world.bossSpawned && typeof cfg.bossAt === 'number' && (world.time >= cfg.bossAt)) {
    const base = BOSSES[cfg.bossKey] || BOSSES.boarKing;
    const sc = computeScale(cfg, world);
    const scaled = {
      ...base,
      hp: Math.round(base.hp * sc),
      maxHp: Math.round(base.hp * sc),
      attack: Math.round(base.attack * (1.0 + (sc - 1) * 0.6))
    };
    world.units.push(makeUnit(-1, cw - 80, gy - 8, scaled)); // 固定座標
    world.bossSpawned = true;
    onEnemySeen && onEnemySeen(scaled.name);
    return;
  }

  // ✅ 種類固定：先用 sequence，沒有才輪 pool；皆無時 fallback 'dog'
  if (world.enemyIndex == null) world.enemyIndex = 0;
  const seq = Array.isArray(cfg.sequence) && cfg.sequence.length ? cfg.sequence : null;
  const pool = (!seq && cfg.pool && cfg.pool.length) ? cfg.pool : null;

  let key = 'dog';
  if (seq) key = seq[ world.enemyIndex % seq.length ];
  else if (pool) key = pool[ world.enemyIndex % pool.length ];

  world.enemyIndex += 1;
  world.totalSpawns = (world.totalSpawns || 0) + 1;

  const base = ENEMIES[key] || ENEMIES.dog;
  const sc = computeScale(cfg, world);
  const tpl = {
    ...base,
    hp: Math.round(base.hp * sc),
    maxHp: Math.round(base.hp * sc),
    attack: Math.round(base.attack * (0.9 + (sc - 1) * 0.5)) // 無隨機因子
  };

  world.units.push(makeUnit(-1, cw - 80, gy - 8, tpl)); // 固定座標
  onEnemySeen && onEnemySeen(base.name);
}
