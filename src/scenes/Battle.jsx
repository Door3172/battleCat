import React, { useEffect, useRef, useState } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import SlotTray from '../ui/SlotTray.jsx';
import HudInfo from '../ui/HudInfo.jsx';
import Dialog from '../ui/Dialog.jsx';
import Toolbar from '../ui/Toolbar.jsx';
import Button from '../ui/Button.jsx';
import Pill from '../ui/Pill.jsx';
import { SKIN } from '../data/skin.js';
import { fmt } from '../utils/number.js';
import { createWorld } from '../game/world.js';
import { spawnEnemy, stepUnits, groundY, makeUnit, spawnBossIfNeeded } from '../game/ai.js';
import { drawAll } from '../game/draw.js';
import { rand } from '../utils/math.js';
import { useAudio } from '../audio/useAudio.js';

export default function Battle({
  coins, setCoins, currentStage, setScene, highestUnlocked, setHighestUnlocked,
  lineup, unlocks, addEnemyName
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(0);
  const [timeScale, setTimeScale] = useState(1);
  const worldRef = useRef(null);
  const [ui, setUi] = useState({ fish: 0, incomeLv: 1, cannonCd: 0, leftHp: 1000, rightHp: 1000, state: 'ready', time: 0 });

  const audio = useAudio();

  const getCanvasWidth = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); const c = canvasRef.current; return c ? c.width / dpr : 900; };
  const getCanvasHeight = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); const c = canvasRef.current; return c ? c.height / dpr : 400; };
  const forceResize = () => {
    const el = wrapRef.current, c = canvasRef.current; if (!el || !c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = Math.max(320, Math.min(1000, el.clientWidth || window.innerWidth));
    const vh = window.innerHeight || 560;
    const targetH = Math.max(180, Math.min(Math.round(vw / 1.9), Math.round(vh * 0.6)));
    const targetW = Math.round(targetH * 1.9);
    c.width = Math.floor(targetW * dpr); c.height = Math.floor(targetH * dpr);
    c.style.width = targetW + 'px'; c.style.height = targetH + 'px';
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  useEffect(() => {
    const onResize = () => { forceResize(); draw(); };
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('fullscreenchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      document.removeEventListener('fullscreenchange', onResize);
    }
  }, []);

  // ✅ 進入戰鬥 → 切戰鬥 BGM；離開 → 切回大廳 BGM（crossfade，避免互蓋）
  useEffect(() => {
    audio.playMusic('bgm_battle');
    return () => { audio.playMusic('bgm_lobby'); };
  }, [audio]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      if (e.code === 'Space') e.preventDefault();
      const G = ensureWorld();
      if (G.state === 'ready') startGame();
      const keys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'];
      if (keys.includes(e.code)) {
        const idx = keys.indexOf(e.code);
        const key = lineup[idx];
        if (key) spawnCat(key);
        return;
      }
      switch (e.code) {
        case 'Space': fireCannon(); break;
        case 'KeyP': togglePause(); break;
        case 'KeyR': resetWorld(); break;
        case 'KeyX': toggleSpeed(); break;
        default: break;
      }
    };
    document.addEventListener('keydown', onKey, { passive: false });
    return () => document.removeEventListener('keydown', onKey);
  }, [lineup, timeScale]);

  const ensureWorld = () => {
    if (worldRef.current) return worldRef.current;
    worldRef.current = createWorld(currentStage, unlocks);
    setUi(s => ({ ...s, fish: Math.floor(worldRef.current.fish), incomeLv: worldRef.current.incomeLv, leftHp: 1000, rightHp: 1000, cannonCd: 0, state: 'ready', time: 0 }));
    return worldRef.current;
  };

  const startGame = () => {
    const w = ensureWorld();
    if (w.state === 'running') return;
    w.state = 'running'; w.last = performance.now();
    cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(loop);
    setUi(s => ({ ...s, state: 'running' }));
  };
  const togglePause = () => {
    const w = ensureWorld();
    if (w.state === 'running') { w.state = 'paused'; setUi(s => ({ ...s, state: 'paused' })); cancelAnimationFrame(rafRef.current); }
    else if (w.state === 'paused') startGame();
  };
  const toggleSpeed = () => setTimeScale(s => s === 1 ? 2 : 1);
  const resetWorld = () => {
    cancelAnimationFrame(rafRef.current);
    worldRef.current = null;
    const w = ensureWorld();
    setUi({ fish: w.fish, incomeLv: w.incomeLv, cannonCd: 0, leftHp: w.leftHp, rightHp: w.rightHp, state: 'ready', time: 0 });
    forceResize(); draw();
  };

  const canSummon = (key) => { const w = ensureWorld(); return (w.summonCd[key] || 0) <= 0; };
  const spawnCat = (key) => {
    const w = ensureWorld();
    if (w.state === 'ready') startGame();
    if (w.state !== 'running') return;
    const tpl = w.catsTpl[key]; if (!tpl) return;
    if (!canSummon(key)) return;
    if (w.fish < tpl.cost) return;
    if (w.units.filter(u => u.team === 1).length > 70) return;
    w.fish -= tpl.cost; w.summonCd[key] = tpl.cd;
    const y = groundY(getCanvasHeight) - 8 + rand(-3, 3);
    w.units.push(makeUnit(1, 80 + rand(-6, 6), y, tpl));
    audio.playSfx('sfx_summon'); // 召喚叮一聲
  };

  const upgradeIncome = () => {
    const w = ensureWorld();
    if (w.state !== 'running') return;
    if (w.fish < w.incomeCost) return;
    w.fish -= w.incomeCost; w.income += 4.8; w.incomeLv += 1; w.incomeCost = Math.round(w.incomeCost * 1.7);
    setUi(s => ({ ...s, fish: Math.floor(w.fish), incomeLv: w.incomeLv }));
  };

  const fireCannon = () => {
    const w = ensureWorld();
    if (w.state !== 'running' || w.cannonCd > 0) return;
    const dmg = 58 * w.cfg.difficulty; const knock = 70;
    w.units.forEach(u => { if (u.team === -1) { u.hp -= dmg; u.x += knock; } });
    w.cannonCd = 14;
    draw();
  };

  const loop = (now) => {
    const w = ensureWorld(); if (w.state !== 'running') return;
    const rawDt = Math.min(0.05, (now - w.last) / 1000); w.last = now;
    const dt = rawDt * timeScale;
    w.time += dt; w.fish += w.income * dt;
    if (w.cannonCd > 0) w.cannonCd = Math.max(0, w.cannonCd - dt);
    for (const k in w.summonCd) w.summonCd[k] = Math.max(0, (w.summonCd[k] || 0) - dt);
    spawnBossIfNeeded(w, getCanvasWidth, getCanvasHeight, addEnemyName);
    if (Array.isArray(w.cfg.schedule)) {

      while (w.nextEnemyIdx < w.cfg.schedule.length && w.time >= w.cfg.schedule[w.nextEnemyIdx].time) {
        const entry = w.cfg.schedule[w.nextEnemyIdx];
        spawnEnemy(w, getCanvasWidth, getCanvasHeight, addEnemyName, entry.type);
        w.nextEnemyIdx += 1;

      for (const e of w.cfg.schedule) {
        // hp 條件（敵方城堡血量）
        if (typeof e.hp === 'number' && w.rightHp > e.hp) continue;
        const start = e.start ?? e.time ?? 0;
        const end = e.until ?? Infinity;
        const interval = e.interval;
        const maxSpawn = e.count ?? (interval ? Infinity : 1);
        if (e._next == null) e._next = start;
        if (e._spawned == null) e._spawned = 0;
        if (w.time >= e._next && w.time <= end && e._spawned < maxSpawn) {
          spawnEnemy(w, getCanvasWidth, getCanvasHeight, addEnemyName, e.type);
          e._spawned += 1;
          if (interval && w.time + interval <= end && e._spawned < maxSpawn) e._next += interval; else e._next = Infinity;
        }

      }
    } else {
      w.enemyClock -= dt;
      if (w.enemyClock <= 0) {
        spawnEnemy(w, getCanvasWidth, getCanvasHeight, addEnemyName);
        w.enemyClock = w.cfg.spawnRate; // 固定頻率
      }
    }
    const bountyGain = stepUnits(w, getCanvasWidth, getCanvasHeight, dt);
    if (bountyGain > 0) w.fish += bountyGain;
    if (w.rightHp <= 0) { w.state = 'win'; awardWin(); }
    else if (w.leftHp <= 0) { w.state = 'lose'; handleLose(); }
    w.hudTick += dt;
    if (w.hudTick > 0.12 || w.state !== 'running') {
      w.hudTick = 0;
      setUi({ fish: Math.floor(w.fish), incomeLv: w.incomeLv, cannonCd: w.cannonCd, leftHp: Math.max(0, Math.floor(w.leftHp)), rightHp: Math.max(0, Math.floor(w.rightHp)), state: w.state, time: w.time });
    }
    draw();
    if (w.state === 'running') rafRef.current = requestAnimationFrame(loop);
  };

  const awardWin = async () => {
    await audio.fadeOutMusic(300);
    audio.playSfx('sfx_win');
    setCoins(c => c + 120);
    const next = Math.min(30, Math.max(highestUnlocked, currentStage + 1));
    setHighestUnlocked(next);
    setTimeout(() => setScene('lobby'), 300);
  };

  const handleLose = async () => {
    await audio.fadeOutMusic(300);
    audio.playSfx('sfx_lose');
    setTimeout(() => setScene('lobby'), 300);
  };

  const draw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); const w = ensureWorld();
    drawAll(ctx, w, getCanvasWidth, getCanvasHeight, currentStage, timeScale);
  };

  const BattleControls = () => {
    const w = ensureWorld();
    const summon = (k) => () => spawnCat(k);
    return (
      <>
        <SlotTray>
          {lineup.map((k, i) => {
            const cd = w.summonCd[k] || 0; const disabled = cd > 0 || ui.state !== 'running';
            return (
              <div key={k} className="flex flex-col rounded-2xl border bg-white px-2 py-2" style={{ borderColor: SKIN.color.line, minHeight: 92 }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-[13px] leading-tight text-slate-800 break-words">
                    <span className="mr-1">{i + 1}️⃣</span>
                    <span>{w.catsTpl[k]?.name || k}</span>
                  </div>
                  <Pill tone="sub">{w.catsTpl[k]?.cost ?? '?'}</Pill>
                </div>
                <div className="mt-2">
                  <Button onClick={summon(k)} disabled={disabled} size="sm" block>
                    {w.catsTpl[k]?.name || k}{cd > 0 ? `（${cd.toFixed(1)}s）` : ''}
                  </Button>
                </div>
              </div>
            );
          })}
        </SlotTray>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button onClick={fireCannon} disabled={ui.cannonCd > 0 || ui.state !== 'running'} tone="primary">🧨 貓咪砲 {ui.cannonCd > 0 ? `(${ui.cannonCd.toFixed(1)}s)` : ''}</Button>
          <Button onClick={togglePause}>{ui.state === 'paused' ? '▶️ 繼續' : '⏸️ 暫停'}</Button>
          <Button onClick={resetWorld}>🔄 重開</Button>
          <Button onClick={() => setScene('lobby')}>🏠 返回大廳</Button>
        </div>
      </>
    );
  };

  return (
    <>
      <HeroBanner title="貓咪大戰爭" subtitle="1~5 召喚、Space 大砲、X 1x/2x、P 暫停、R 重開" />
      <div ref={wrapRef} className="relative w-full overflow-hidden">
        <canvas ref={canvasRef} className="rounded-2xl border shadow w-full block mx-auto" />
        <Dialog show={ui.state !== 'running'}>
          {ui.state === 'ready' && <div className="text-lg font-semibold">按下 1~5 任一鍵或點下方按鈕開始</div>}
          {ui.state === 'paused' && <div className="text-lg font-semibold">已暫停（按 P 繼續）</div>}
          {ui.state === 'win' && <div className="text-lg font-semibold">🎉 勝利！+120 金幣，已返回大廳</div>}
          {ui.state === 'lose' && <div className="text-lg font-semibold">😿 戰敗… 試著升級研究力或調整編成</div>}
        </Dialog>
      </div>
      <Toolbar
        left={<BattleControls />}
        right={
          <HudInfo
            fish={ui.fish}
            incomeLv={ui.incomeLv}
            cannonCd={ui.cannonCd}
            leftHp={ui.leftHp}
            rightHp={ui.rightHp}
            incomeCost={ensureWorld().incomeCost}
            onUpgrade={upgradeIncome}
            onSpeed={toggleSpeed}
            speedLabel={`${timeScale}x`}
          />
        }
      />
    </>
  );
}
