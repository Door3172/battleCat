import React, { useEffect, useState } from 'react';
import Lobby from './scenes/Lobby.jsx';
import ChapterSelect from './scenes/ChapterSelect.jsx';
import LevelSelect from './scenes/LevelSelect.jsx';
import Shop from './scenes/Shop.jsx';
import Codex from './scenes/Codex.jsx';
import Lineup from './scenes/Lineup.jsx';
import Gacha from './scenes/Gacha.jsx';
import Upgrade from './scenes/Upgrade.jsx';
import Battle from './scenes/Battle.jsx';
import { useAudio } from './audio/useAudio.js';
import SettingsDialog from './ui/SettingsDialog.jsx';
import { ENV_TYPES, hasSeenEnvTip } from './ui/envInfo.js';
import { getMaxStage, stageConfig } from './data/stages.js';
import { readSaved, writeSaved, parseNumber, parseObject, parseArray, parseString } from './utils/storage.js';

// 本地存檔版本，用於重大更新時清除舊資料
const SAVE_VERSION = '1';

// 清除存檔時要保留的玩家設定 key（音量、主題）；以後新增設定 key 加在這裡
const PRESERVED_KEYS = ['audioVolumes', 'theme'];

// 合法的主題（與 SettingsDialog 的 THEMES、index.html 的開機腳本一致）
const THEME_KEYS = ['minimal', 'modern', 'warm', 'neon'];

// 各存檔 key 的預設值（新遊戲 / 清除存檔共用）
const DEFAULTS = {
  coins: 300,
  unlocks: { ninja: false, knight: false, mage: false, samurai: false, sumo: false, viking: false, cow: false },
  codexCats: ['白喵', '坦喵', '射喵'],
  codexEnemies: [],
  lineup: ['white', 'tank', 'archer'],
  catLevels: { white: 1, tank: 1, archer: 1 },
  researchLv: 1,
  cannonLv: 1,
  castleLv: 1,
  currentChapter: 1,
  currentStage: 1,
  highestUnlocked: { 1: 1, 2: 1 },
};

// 清除遊戲進度：保留 PRESERVED_KEYS，其餘清空，並寫回 saveVersion
function clearSaveData() {
  try {
    const kept = PRESERVED_KEYS
      .map(key => [key, localStorage.getItem(key)])
      .filter(([, value]) => value !== null);
    localStorage.clear();
    kept.forEach(([key, value]) => localStorage.setItem(key, value));
    localStorage.setItem('saveVersion', SAVE_VERSION);
  } catch {}
}

// 檢查存檔版本並在不一致時清除
(function checkSaveVersion() {
  if (readSaved('saveVersion', null, parseString) !== SAVE_VERSION) {
    clearSaveData();
  }
})();

// 舊存檔的 highestUnlocked 可能是單一數字（只有第一章時代），或缺少新章節的 key
const parseHighestUnlocked = (raw) => {
  const parsed = JSON.parse(raw);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { ...DEFAULTS.highestUnlocked, ...parsed };
  const num = Number(parsed);
  return Number.isFinite(num) ? { ...DEFAULTS.highestUnlocked, 1: num } : null;
};

const parseTheme = (raw) => (THEME_KEYS.includes(raw) ? raw : null);

// 讀檔失敗（資料損毀）時退回預設值；值改變時自動寫回 localStorage（格式與舊版相同，不影響既有存檔）
function usePersistentState(key, parse, serialize = JSON.stringify) {
  const [value, setValue] = useState(() => readSaved(key, DEFAULTS[key], parse));
  useEffect(() => { writeSaved(key, value, serialize); }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [scene, setScene] = useState('lobby');
  const [coins, setCoins] = usePersistentState('coins', parseNumber);
  const [unlocks, setUnlocks] = usePersistentState('unlocks', parseObject);
  const [codexCats, setCodexCats] = usePersistentState('codexCats', parseArray);
  const [codexEnemies, setCodexEnemies] = usePersistentState('codexEnemies', parseArray);
  const [lineup, setLineup] = usePersistentState('lineup', parseArray);
  const [catLevels, setCatLevels] = usePersistentState('catLevels', parseObject);
  const [researchLv, setResearchLv] = usePersistentState('researchLv', parseNumber, String);
  const [cannonLv, setCannonLv] = usePersistentState('cannonLv', parseNumber, String);
  const [castleLv, setCastleLv] = usePersistentState('castleLv', parseNumber, String);
  const [currentChapter, setCurrentChapter] = usePersistentState('currentChapter', parseNumber, String);
  const [currentStage, setCurrentStage] = usePersistentState('currentStage', parseNumber, String);
  const [highestUnlocked, setHighestUnlocked] = usePersistentState('highestUnlocked', parseHighestUnlocked);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => readSaved('theme', 'minimal', parseTheme));
  // 「下一關」遇到首次出現的環境：先到關卡選擇顯示說明視窗（EG-012）
  const [pendingStage, setPendingStage] = useState(null);
  // 同一關「再玩一次」以外的重新進場（例如從大廳重進同一關）用這個 key 讓 Battle 重新掛載
  const [battleRun, setBattleRun] = useState(0);

  const audio = useAudio();

  useEffect(() => {
    document.body.classList.remove(...THEME_KEYS.map(t => `theme-${t}`));
    document.body.classList.add(`theme-${theme}`);
    writeSaved('theme', theme, String);
  }, [theme]);

  // ✅ 一次性自動解鎖音訊（任意互動就解鎖）
  useEffect(() => {
    const unlock = async () => {
      await audio.resume();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [audio]);

  const addCatName = (name) => setCodexCats(prev => prev.includes(name) ? prev : [...prev, name]);
  const addEnemyName = (name) => setCodexEnemies(prev => prev.includes(name) ? prev : [...prev, name]);

  const handleReset = () => {
    clearSaveData();
    setCoins(DEFAULTS.coins);
    setUnlocks(DEFAULTS.unlocks);
    setCodexCats(DEFAULTS.codexCats);
    setCodexEnemies(DEFAULTS.codexEnemies);
    setLineup(DEFAULTS.lineup);
    setCatLevels(DEFAULTS.catLevels);
    setResearchLv(DEFAULTS.researchLv);
    setCannonLv(DEFAULTS.cannonLv);
    setCastleLv(DEFAULTS.castleLv);
    setCurrentChapter(DEFAULTS.currentChapter);
    setCurrentStage(DEFAULTS.currentStage);
    setHighestUnlocked(DEFAULTS.highestUnlocked);
  };

  const startStage = (n) => {
    setCurrentStage(n);
    setBattleRun(r => r + 1);
    setScene('battle');
  };

  // 結算視窗「下一關」：首次遇到的環境要先看說明（LevelSelect 的 autoStage 會直接打開說明視窗）
  const goNextStage = () => {
    const next = currentStage + 1;
    if (next > getMaxStage(currentChapter)) return;
    const envType = stageConfig(next, currentChapter).env?.type;
    if (envType && ENV_TYPES[envType] && !hasSeenEnvTip(envType)) {
      setCurrentStage(next);
      setPendingStage(next);
      setScene('level');
      return;
    }
    startStage(next);
  };

  const scenes = {
    lobby: (
      <Lobby
        coins={coins}
        highestUnlocked={highestUnlocked}
        goChapter={()=>setScene('chapter')}
        goLineup={()=>setScene('lineup')}
        goShop={()=>setScene('shop')}
        goGacha={()=>setScene('gacha')}
        goUpgrade={()=>setScene('upgrade')}
        goCodex={()=>setScene('codex')}
        onReset={handleReset}
      />
    ),
    chapter: (
      <ChapterSelect
        onBack={() => setScene('lobby')}
        onChoose={(ch) => { setCurrentChapter(ch); setScene('level'); }}
      />
    ),
    level: (
      <LevelSelect
        chapter={currentChapter}
        maxStage={getMaxStage(currentChapter)}
        highestUnlocked={highestUnlocked[currentChapter] ?? 1}
        autoStage={pendingStage}
        onAutoStageHandled={() => setPendingStage(null)}
        onBack={() => setScene('chapter')}
        onChoose={startStage}
      />
    ),
    shop: (
      <Shop
        coins={coins}
        unlocks={unlocks}
        onBack={() => setScene('lobby')}
        onBuy={(key, item) => {
          if (coins < item.price || unlocks[key]) return;
          setCoins(c=>c-item.price);
          setUnlocks(u=>({...u, [key]:true}));
          setCatLevels(l=>({...l, [key]:1}));
          addCatName(item.tpl.name);
        }}
      />
    ),
    gacha: (
      <Gacha
        coins={coins}
        setCoins={setCoins}
        unlocks={unlocks}
        setUnlocks={setUnlocks}
        catLevels={catLevels}
        setCatLevels={setCatLevels}
        addCatName={addCatName}
        onBack={() => setScene('lobby')}
      />
    ),
    codex: (
      <Codex
        cats={codexCats}
        enemies={codexEnemies}
        onBack={() => setScene('lobby')}
      />
    ),
    lineup: (
      <Lineup
        unlocks={unlocks}
        lineup={lineup}
        catLevels={catLevels}
        setLineup={setLineup}
        addCatName={addCatName}
        onBack={() => setScene('lobby')}
      />
    ),
    upgrade: (
      <Upgrade
        coins={coins}
        setCoins={setCoins}
        unlocks={unlocks}
        catLevels={catLevels}
        setCatLevels={setCatLevels}
        researchLv={researchLv}
        setResearchLv={setResearchLv}
        cannonLv={cannonLv}
        setCannonLv={setCannonLv}
        castleLv={castleLv}
        setCastleLv={setCastleLv}
        onBack={()=>setScene('lobby')}
      />
    ),
    battle: (
      <Battle
        // 換關（下一關）或重新進場時重新掛載，戰鬥狀態從頭開始
        key={`${currentChapter}-${currentStage}-${battleRun}`}
        setCoins={setCoins}
        currentStage={currentStage}
        currentChapter={currentChapter}
        setScene={setScene}
        setHighestUnlocked={setHighestUnlocked}
        onNextStage={goNextStage}
        lineup={lineup}
        unlocks={unlocks}
        catLevels={catLevels}
        addEnemyName={addEnemyName}
        researchLv={researchLv}
        cannonLv={cannonLv}
        castleLv={castleLv}
      />
    ),
  };

  return (
    <main className="game-background relative w-full mx-auto max-w-5xl p-4 sm:p-8 space-y-4 min-h-full font-sans text-ink">
      <button
        type="button"
        aria-label="開啟設定"
        className="ui-btn ui-corner-btn absolute right-4 top-4 z-20"
        onClick={() => { audio.playClick(); setShowSettings(true); }}
      >
        <span className="icon">設定</span>
      </button>
      {scenes[scene]}
      <SettingsDialog
        show={showSettings}
        onClose={() => setShowSettings(false)}
        audio={audio}
        theme={theme}
        setTheme={setTheme}
      />
    </main>
  );
}
