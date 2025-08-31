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
import { stageConfig } from '../data/stages.js';

export default function Battle({
  coins, setCoins, currentStage, setScene, highestUnlocked, setHighestUnlocked,
  lineup, unlocks, catLevels, addEnemyName,
  researchLv, cannonLv, castleLv
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(0);
  const abortedRef = useRef(false);
  const [timeScale, setTimeScale] = useState(1);
  const timeScaleRef = useRef(1);
  const worldRef = useRef(null);
  const [ui, setUi] = useState({ fish: 0, incomeLv: 1, cannonCd: 0, leftHp: 1000 + (castleLv - 1) * 100, rightHp: 1000, state: 'prestart', time: 0 });

  const audio = useAudio();

  const getCanvasWidth = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); const c = canvasRef.current; return c ? c.width / dpr : 900; };
  const getCanvasHeight = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); const c = canvasRef.current; return c ? c.height / dpr : 400; };
  const getWorldWidth = () => getCanvasWidth();
  const getWorldHeight = () => getCanvasHeight();
  const forceResize = () => {
    const el = wrapRef.current, c = canvasRef.current; if (!el || !c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = Math.max(320, el.clientWidth || window.innerWidth);
    const vh = window.innerHeight || 560;
    const targetH = Math.max(180, Math.min(Math.round(vw / 1.9), Math.round(vh * 0.5)));
    const cfg = stageConfig(currentStage);
    const minWidth = cfg.towerDistance + 100;
    const targetW = Math.max(minWidth, Math.round(targetH * 1.9));
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
      if (G.state === 'ready' || G.state === 'prestart') startGame();
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
  }, [lineup]);

  const ensureWorld = () => {
    if (worldRef.current) return worldRef.current;
    worldRef.current = createWorld(currentStage, unlocks, catLevels, researchLv, cannonLv, castleLv);
    const w = worldRef.current;
    w.state = 'prestart';
    setUi(s => ({
      ...s,
      fish: Math.floor(w.fish),
      incomeLv: w.incomeLv,
      leftHp: w.leftHp,
      rightHp: w.rightHp,
      cannonCd: 0,
      state: 'prestart',
      time: 0
    }));
    return w;
  };

  const startGame = () => {
    const w = ensureWorld();
    if (w.state === 'running') return;
    w.state = 'running'; w.last = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
    setUi(s => ({ ...s, state: 'running' }));
  };
  const togglePause = () => {
    const w = ensureWorld();
    if (w.state === 'running') {
      w.state = 'paused';
      setUi(s => ({ ...s, state: 'paused' }));
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    } else if (w.state === 'paused') startGame();
  };
  const toggleSpeed = () => {
    setTimeScale(s => {
      const ns = s === 1 ? 2 : 1;
      timeScaleRef.current = ns;
      return ns;
    });
  };
  const resetWorld = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    worldRef.current = null;
    const w = ensureWorld();
    w.state = 'ready';
    setUi({ fish: w.fish, incomeLv: w.incomeLv, cannonCd: 0, leftHp: w.leftHp, rightHp: w.rightHp, state: 'ready', time: 0 });
    forceResize(); draw();
  };

  const exitBattle = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    worldRef.current = null;
    abortedRef.current = true;
  };

  useEffect(() => {
    const timer = setTimeout(() => startGame(), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => exitBattle();
  }, []);

  const canSummon = (key) => { const w = ensureWorld(); return (w.summonCd[key] || 0) <= 0; };
  const spawnCat = (key) => {
    const w = ensureWorld();
    if (w.state === 'ready' || w.state === 'prestart') startGame();
    if (w.state !== 'running') return;
    const tpl = w.catsTpl[key]; if (!tpl) return;
    if (!canSummon(key)) return;
    if (w.fish < tpl.cost) return;
    if (w.units.filter(u => u.team === 1).length > 70) return;
    w.fish -= tpl.cost; w.summonCd[key] = tpl.cd;
    const y = groundY(getWorldHeight) - 8 + rand(-3, 3);
    w.units.push(makeUnit(1, 80 + rand(-6, 6), y, tpl));
    audio.playSfx('sfx_summon'); // 召喚叮一聲
  };

  const calcIncomeIncrement = () => 3 + 1.5 * (researchLv - 1);

  const upgradeIncome = () => {
    const w = ensureWorld();
    if (w.state !== 'running') return;
    if (w.fish < w.incomeCost) return;
    w.fish -= w.incomeCost;
    w.income += calcIncomeIncrement();
    w.incomeLv += 1;
    w.incomeCost = Math.round(w.incomeCost + 100 * (w.incomeLv - 1));
    setUi(s => ({ ...s, fish: Math.floor(w.fish), incomeLv: w.incomeLv }));
  };

  const fireCannon = () => {
    const w = ensureWorld();
    if (w.state !== 'running' || w.cannonCd > 0) return;
    const dmg = (60 + (cannonLv - 1) * 10) * (w.cfg.difficulty || 1); const knock = 60;
    w.units.forEach(u => { if (u.team === -1) { u.hp -= dmg; u.x += knock; } });
    w.cannonCd = 14;
    draw();
  };

  const loop = (now) => {
    const w = ensureWorld(); if (w.state !== 'running') return;
    const rawDt = Math.min(0.05, (now - w.last) / 1000); w.last = now;
    const dt = rawDt * timeScaleRef.current;
    w.time += dt; w.fish += w.income * dt;
    if (w.cannonCd > 0) w.cannonCd = Math.max(0, w.cannonCd - dt);
    for (const k in w.summonCd) w.summonCd[k] = Math.max(0, (w.summonCd[k] || 0) - dt);
    spawnBossIfNeeded(w, getWorldWidth, getWorldHeight, addEnemyName);
    if (Array.isArray(w.cfg.schedule)) {

      while (w.nextEnemyIdx < w.cfg.schedule.length) {
        const entry = w.cfg.schedule[w.nextEnemyIdx];
        if (entry.time === undefined) {
          w.nextEnemyIdx += 1;
          continue;
        }
        if (w.time >= entry.time) {
          if (typeof entry.hp === 'number' && w.rightHp > entry.hp) break;
          // 單次時間生成的敵人若在上方 while 產生
          // 需要標記已生成，避免下方循環再次生成
          spawnEnemy(w, getWorldWidth, getWorldHeight, addEnemyName, entry.type, entry.multiplier ?? 100, false);
          entry._spawned = (entry._spawned || 0) + 1;
          entry._next = Infinity;
          w.nextEnemyIdx += 1;
          continue;
        }
        break;
      }

      for (const e of w.cfg.schedule) {
        const start = e.start ?? e.time ?? 0;
        const end = e.until ?? Infinity;
        const interval = e.interval;
        const maxSpawn = e.count ?? (interval ? Infinity : 1);
        if (e._next == null) e._next = start;
        if (e._spawned == null) e._spawned = 0;
        if (w.time >= e._next && w.time <= end && e._spawned < maxSpawn) {
          if (typeof e.hp !== 'number' || w.rightHp <= e.hp) {
            spawnEnemy(w, getWorldWidth, getWorldHeight, addEnemyName, e.type, e.multiplier ?? 100, false);
            e._spawned += 1;
            if (interval && w.time + interval <= end && e._spawned < maxSpawn) {
              e._next = w.time + interval;
            } else if (e._spawned >= maxSpawn || (interval && w.time + interval > end)) {
              e._next = Infinity;
            }
          }
        }
      }
    } else {
      w.enemyClock -= dt;
      if (w.enemyClock <= 0) {
        spawnEnemy(w, getWorldWidth, getWorldHeight, addEnemyName, undefined, 100);
        w.enemyClock = w.cfg.spawnRate; // 固定頻率
      }
    }
    const bountyGain = stepUnits(w, getWorldWidth, getWorldHeight, dt);
    if (bountyGain > 0) w.fish += bountyGain;
    if (w.rightHp <= 0) { w.state = 'win'; awardWin(); }
    else if (w.leftHp <= 0) { w.state = 'lose'; handleLose(); }
    w.hudTick += dt;
    if (w.hudTick > 0.12 || w.state !== 'running') {
      w.hudTick = 0;
      setUi({ fish: Math.floor(w.fish), incomeLv: w.incomeLv, cannonCd: w.cannonCd, leftHp: Math.max(0, Math.floor(w.leftHp)), rightHp: Math.max(0, Math.floor(w.rightHp)), state: w.state, time: w.time });
    }
    draw();
    if (w.state === 'running') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  const awardWin = async () => {
    if (abortedRef.current) return;
    await audio.fadeOutMusic(300);
    audio.playSfx('sfx_win');
    setCoins(c => c + worldRef.current.cfg.rewardCoins);
    const next = Math.min(30, Math.max(highestUnlocked, currentStage + 1));
    setHighestUnlocked(next);
    setTimeout(() => setScene('lobby'), 300);
  };

  const handleLose = async () => {
    if (abortedRef.current) return;
    await audio.fadeOutMusic(300);
    audio.playSfx('sfx_lose');
    setTimeout(() => setScene('lobby'), 300);
  };

  const draw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); const w = ensureWorld();
    drawAll(ctx, w, getWorldWidth, getWorldHeight, currentStage, timeScale);
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
              <div
                key={k}
                className="flex flex-col rounded-2xl border bg-white px-2 py-2 transition-transform hover:scale-105"
                style={{ borderColor: SKIN.color.line, minHeight: 92 }}
                role="listitem"
              >
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
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 items-center gap-2" aria-label="戰鬥控制">
          <Button onClick={fireCannon} disabled={ui.cannonCd > 0 || ui.state !== 'running'} tone="primary">🧨 貓咪砲 {ui.cannonCd > 0 ? `(${ui.cannonCd.toFixed(1)}s)` : ''}</Button>
          <Button onClick={togglePause}>{ui.state === 'paused' ? '▶️ 繼續' : '⏸️ 暫停'}</Button>
          <Button onClick={resetWorld}>🔄 重開</Button>
          <Button onClick={() => { exitBattle(); setScene('lobby'); }}>🏠 返回大廳</Button>
        </div>
      </>
    );
  };

  return (
    <>
      <HeroBanner title="貓咪大戰爭" subtitle="1~5 召喚、Space 大砲、X 1x/2x、P 暫停、R 重開" />
      <div ref={wrapRef} className="relative w-full overflow-hidden">
        <canvas ref={canvasRef} className="rounded-2xl border shadow w-full block mx-auto" />
        {ui.state === 'prestart' && <div className="fixed inset-0 bg-black/50 pointer-events-none" />}
        <Dialog fullscreen={false} show={['ready', 'paused', 'win', 'lose'].includes(ui.state)}>
          {ui.state === 'ready' && <div className="text-lg font-semibold">戰鬥即將自動開始（亦可按下 1~5 任一鍵或點下方按鈕提前開始）</div>}
          {ui.state === 'paused' && <div className="text-lg font-semibold">已暫停（按 P 繼續）</div>}
          {ui.state === 'win' && (
            <div className="text-lg font-semibold">
              🎉 勝利！+{worldRef.current?.cfg.rewardCoins ?? 0} 金幣，已返回大廳
            </div>
          )}
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
            incomeInc={calcIncomeIncrement()}
            onUpgrade={upgradeIncome}
            onSpeed={toggleSpeed}
            speedLabel={`${timeScale}x`}
          />
        }
      />
    </>
  );
}
