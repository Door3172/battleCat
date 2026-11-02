import React, { useEffect, useRef, useState } from 'react';
import HeroBanner from '../ui/HeroBanner.jsx';
import CatAvatar from '../ui/CatAvatar.jsx';
import EnvIndicator from '../ui/EnvIndicator.jsx';
import SlotTray from '../ui/SlotTray.jsx';
import HudInfo from '../ui/HudInfo.jsx';
import Dialog from '../ui/Dialog.jsx';
import Toolbar from '../ui/Toolbar.jsx';
import Button from '../ui/Button.jsx';
import Pill from '../ui/Pill.jsx';
import { createWorld } from '../game/world.js';
import { spawnEnemy, stepUnits, stepSchedule, applyCannon, groundY, makeUnit, spawnBossIfNeeded } from '../game/ai.js';
import { drawAll } from '../game/draw.js';
import { stepEnv, pollEnvCues } from '../game/environment.js';
import { rand } from '../utils/math.js';
import { useAudio } from '../audio/useAudio.js';
import { stageConfig, getMaxStage } from '../data/stages.js';

// 進場 / 重開後自動開始的延遲（ms）
const AUTO_START_MS = 300;
// 可以按召喚的狀態（prestart / ready 時按召喚會直接開打）
const SUMMONABLE = ['running', 'prestart', 'ready'];
// 召喚按鈕：滿版寬度，左右內距縮小，手機 5 格並排時「12.3s」也放得下
const SLOT_BTN_SIZE = { sm: { f: 13, px: 4, py: 8 } };

// HUD 用的 world 快照
const snapshotUi = (w) => ({
  fish: Math.floor(w.fish),
  incomeLv: w.incomeLv,
  cannonCd: w.cannonCd,
  leftHp: Math.max(0, Math.floor(w.leftHp)),
  rightHp: Math.max(0, Math.floor(w.rightHp)),
  state: w.state,
  time: w.time,
});

export default function Battle({
  setCoins, currentStage, currentChapter, setScene, setHighestUnlocked, onNextStage,
  lineup, unlocks, catLevels, addEnemyName,
  researchLv, cannonLv, castleLv
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(0);
  const abortedRef = useRef(false);
  const autoStartRef = useRef(0);
  const [timeScale, setTimeScale] = useState(1);
  const timeScaleRef = useRef(1);
  const worldRef = useRef(null);

  // 建立（或取得）目前的戰鬥世界。只動 ref、不 setState，render 期間也可以安全呼叫
  const ensureWorld = () => {
    if (worldRef.current) return worldRef.current;
    const w = createWorld(currentStage, unlocks, catLevels, researchLv, cannonLv, castleLv, currentChapter);
    w.state = 'prestart';
    worldRef.current = w;
    return w;
  };

  const [ui, setUi] = useState(() => snapshotUi(ensureWorld()));

  const audio = useAudio();
  const maxStage = getMaxStage(currentChapter);
  const hasNextStage = currentStage < maxStage;

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
    const cfg = stageConfig(currentStage, currentChapter);
    const minWidth = cfg.towerDistance + 100;
    const targetW = Math.max(minWidth, Math.round(targetH * 1.9));
    c.width = Math.floor(targetW * dpr); c.height = Math.floor(targetH * dpr);
    // 戰場比外框寬時（手機）等比例縮小顯示，兩座主堡都看得到（UI-014）；
    // 戰鬥座標仍以 targetW × targetH 計算，只有顯示尺寸改變
    c.style.width = targetW + 'px'; c.style.maxWidth = '100%'; c.style.height = 'auto';
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

  // 切到背景分頁 / 切換 App 時自動暫停，回來時停在「已暫停」
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && worldRef.current?.state === 'running') togglePause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const startGame = () => {
    const w = ensureWorld();
    if (w.state === 'running') return;
    clearTimeout(autoStartRef.current);
    w.state = 'running'; w.last = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
    setUi(s => ({ ...s, state: 'running' }));
  };
  // 進場、重開後 AUTO_START_MS 自動開始（觸控裝置沒有鍵盤也能開打）
  const scheduleAutoStart = () => {
    clearTimeout(autoStartRef.current);
    const w = ensureWorld();
    autoStartRef.current = setTimeout(() => {
      if (worldRef.current === w && (w.state === 'prestart' || w.state === 'ready')) startGame();
    }, AUTO_START_MS);
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
    setUi(snapshotUi(w));
    forceResize(); draw();
    audio.playMusic('bgm_battle'); // 勝敗後音樂已淡出停止；同一首正在播時不會重播
    scheduleAutoStart();
  };

  const exitBattle = () => {
    clearTimeout(autoStartRef.current);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    worldRef.current = null;
    abortedRef.current = true;
  };

  useEffect(() => {
    // StrictMode 的模擬卸載會先跑一次 exitBattle，重新掛載時要復原（EG-012）
    abortedRef.current = false;
    scheduleAutoStart();
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
    w.units.push(makeUnit(1, 80 + rand(-6, 6), y, tpl, key));
    audio.playSfx('sfx_summon'); // 召喚叮一聲
    setUi(snapshotUi(w)); // 魚量與冷卻立即反映（不必等下一次 HUD 更新）
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
    const dmg = 60 + (cannonLv - 1) * 10; const knock = 60;
    applyCannon(w, dmg, knock); // 套用閃避、護盾、擊退免疫與主堡邊界（ai.js）
    w.cannonCd = 20;
    draw();
  };

  const loop = (now) => {
    const w = ensureWorld(); if (w.state !== 'running') return;
    const rawDt = Math.min(0.05, (now - w.last) / 1000); w.last = now;
    const dt = rawDt * timeScaleRef.current;
    w.time += dt; w.fish += w.income * dt;
    if (w.cannonCd > 0) w.cannonCd = Math.max(0, w.cannonCd - dt);
    for (const k in w.summonCd) w.summonCd[k] = Math.max(0, (w.summonCd[k] || 0) - dt);
    spawnBossIfNeeded(w, getWorldHeight, addEnemyName);
    // 依關卡 schedule 生怪（ai.js）
    stepSchedule(w, (type, mult) => spawnEnemy(w, getWorldHeight, addEnemyName, type, mult));
    stepEnv(w, dt); // 章節環境：推進階段、潮汐推力
    for (const kind of pollEnvCues(w)) audio.playEnvCue?.(kind);
    const bountyGain = stepUnits(w, getWorldWidth, getWorldHeight, dt);
    if (bountyGain > 0) w.fish += bountyGain;
    if (w.rightHp <= 0) { w.state = 'win'; awardWin(w); }
    else if (w.leftHp <= 0) { w.state = 'lose'; handleLose(); }
    w.hudTick += dt;
    if (w.hudTick > 0.12 || w.state !== 'running') {
      w.hudTick = 0;
      setUi(snapshotUi(w));
    }
    draw();
    if (w.state === 'running') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  // 勝利：金幣與下一關解鎖立即發放；停在結算視窗，由玩家選擇下一步（不再自動回大廳，EG-012）
  const awardWin = (w) => {
    if (abortedRef.current) return;
    const reward = w.cfg.rewardCoins ?? 0;
    setCoins(c => c + reward);
    setHighestUnlocked(h => ({
      ...h,
      [currentChapter]: Math.min(maxStage, Math.max(h[currentChapter] ?? 1, currentStage + 1)),
    }));
    audio.fadeOutMusic(300);
    audio.playSfx('sfx_win');
  };

  const handleLose = () => {
    if (abortedRef.current) return;
    audio.fadeOutMusic(300);
    audio.playSfx('sfx_lose');
  };

  const leaveTo = (scene) => { exitBattle(); setScene(scene); };

  const draw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const w = ensureWorld();
    drawAll(ctx, w, getWorldWidth, getWorldHeight, currentStage, timeScaleRef.current); // 用 ref：loop 閉包裡的 state 會停在舊值（EG-005）
  };


  // 用函式呼叫產生 JSX（不要寫成 <BattleControls /> 元件）：元件內宣告的元件每次 render 都是新型別，
  // HUD 每 0.12 秒更新就會把整個召喚區卸載重掛（EG-011）
  const renderBattleControls = () => {
    const w = ensureWorld();
    const summon = (k) => () => spawnCat(k);
    const canAct = SUMMONABLE.includes(ui.state);
    return (
      <>
        <SlotTray>
          {lineup.map((k, i) => {
            const tpl = w.catsTpl[k];
            const cd = w.summonCd[k] || 0;
            const disabled = !tpl || cd > 0 || !canAct;
            // 魚不夠：格子變暗（仍可按，按了不會扣魚）
            const poor = !!tpl && ui.fish < tpl.cost;
            return (
              <div
                key={k}
                className={`slot-card${poor ? ' is-poor' : ''}`}
                role="listitem"
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="relative">
                    <CatAvatar catKey={k} name={tpl?.name} size={48} className="slot-avatar" />
                    <span className="slot-num">{i + 1}</span>
                  </span>
                  <div className="slot-name w-full font-semibold text-[13px] leading-tight text-ink truncate">{tpl?.name || k}</div>
                  <Pill tone="sub" className="slot-cost">🐟 {tpl?.cost ?? '?'}</Pill>
                </div>
                <div className="slot-action mt-2">
                  <Button onClick={summon(k)} disabled={disabled} size="sm" sizeMap={SLOT_BTN_SIZE} block aria-label={`召喚 ${tpl?.name || k}`}>
                    {cd > 0 ? `${cd.toFixed(1)}s` : '召喚'}
                  </Button>
                </div>
              </div>
            );
          })}
        </SlotTray>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 items-center gap-2" aria-label="戰鬥控制">
          <Button onClick={fireCannon} disabled={ui.cannonCd > 0 || ui.state !== 'running'} tone="primary">🧨 貓咪砲 {ui.cannonCd > 0 ? `(${ui.cannonCd.toFixed(1)}s)` : ''}</Button>
          <Button onClick={togglePause} disabled={ui.state !== 'running' && ui.state !== 'paused'}>{ui.state === 'paused' ? '▶️ 繼續' : '⏸️ 暫停'}</Button>
          <Button onClick={resetWorld}>🔄 重開</Button>
          <Button onClick={() => leaveTo('lobby')}>🏠 返回大廳</Button>
        </div>
      </>
    );
  };

  const rewardCoins = worldRef.current?.cfg.rewardCoins ?? stageConfig(currentStage, currentChapter).rewardCoins ?? 0;
  const ended = ui.state === 'win' || ui.state === 'lose';

  return (
    <>
      <HeroBanner compact title="貓咪大戰爭" subtitle="1~5 召喚、Space 大砲、X 1x/2x、P 暫停、R 重開" />
      <div ref={wrapRef} className="relative w-full overflow-hidden">
        <canvas ref={canvasRef} className="rounded-2xl border shadow w-full block mx-auto" />
        <EnvIndicator getEnv={() => worldRef.current?.env ?? null} />
        {ui.state === 'prestart' && <div className="fixed inset-0 bg-black/50 pointer-events-none" />}
        <Dialog fullscreen={false} show={ui.state === 'ready' || ui.state === 'paused'}>
          {ui.state === 'ready' && <div className="text-lg font-semibold">戰鬥即將自動開始（亦可按下 1~5 任一鍵或召喚按鈕提前開始）</div>}
          {ui.state === 'paused' && (
            // 單行排版：手機上戰場縮小後高度只有約 150px，也放得下
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold whitespace-nowrap">已暫停</div>
              <Button tone="primary" onClick={togglePause}>▶️ 繼續（P）</Button>
            </div>
          )}
        </Dialog>
      </div>
      <p className="battle-rotate-hint">📱 橫放手機，戰場會更大</p>
      <Toolbar
        left={renderBattleControls()}
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

      {/* 結算視窗（EG-012 / UI-014）：全螢幕，手機上戰場縮小時也放得下按鈕 */}
      <Dialog show={ended}>
        {ui.state === 'win' && (
          <div className="battle-result w-[min(88vw,380px)] space-y-4">
            <div className="battle-result-title">🎉 勝利！</div>
            <div className="battle-result-reward">+{rewardCoins} 金幣</div>
            <div className="grid gap-2">
              {hasNextStage && (
                <Button tone="primary" size="lg" block onClick={() => onNextStage?.()}>下一關 ▶（第 {currentStage + 1} 關）</Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={resetWorld} block>🔄 再玩一次</Button>
                <Button onClick={() => leaveTo('lobby')} block>🏠 返回大廳</Button>
              </div>
            </div>
          </div>
        )}
        {ui.state === 'lose' && (
          <div className="battle-result w-[min(88vw,380px)] space-y-4">
            <div className="battle-result-title">😿 戰敗…</div>
            <p className="text-sub text-sm m-0">試著升級研究力、貓咪，或調整隊伍編成再挑戰！</p>
            <div className="grid gap-2">
              <Button tone="primary" size="lg" block onClick={resetWorld}>🔄 再試一次</Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => leaveTo('upgrade')} block>⬆️ 去升級</Button>
                <Button onClick={() => leaveTo('lobby')} block>🏠 返回大廳</Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
