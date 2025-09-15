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
import { getMaxStage } from './data/stages.js';

// 本地存檔版本，用於重大更新時清除舊資料
const SAVE_VERSION = '1';

// 檢查存檔版本並在不一致時清除
(function checkSaveVersion() {
  const stored = localStorage.getItem('saveVersion');
  if (stored !== SAVE_VERSION) {
    localStorage.clear();
    localStorage.setItem('saveVersion', SAVE_VERSION);
  }
})();

export default function App() {
  const [scene, setScene] = useState('lobby');
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('coins');
    return saved ? JSON.parse(saved) : 300;
  });
  const [unlocks, setUnlocks] = useState(() => {
    const saved = localStorage.getItem('unlocks');
    return saved ? JSON.parse(saved) : { ninja:false, knight:false, mage:false, samurai:false, sumo:false, viking:false, cow:false };
  });
  const [codexCats, setCodexCats] = useState(() => {
    const saved = localStorage.getItem('codexCats');
    return saved ? JSON.parse(saved) : ['白喵','坦喵','射喵'];
  });
  const [codexEnemies, setCodexEnemies] = useState(() => {
    const saved = localStorage.getItem('codexEnemies');
    return saved ? JSON.parse(saved) : [];
  });
  const [lineup, setLineup] = useState(() => {
    const saved = localStorage.getItem('lineup');
    return saved ? JSON.parse(saved) : ['white','tank','archer'];
  });
  const [catLevels, setCatLevels] = useState(() => {
    const saved = localStorage.getItem('catLevels');
    return saved ? JSON.parse(saved) : { white:1, tank:1, archer:1 };
  });
  const [researchLv, setResearchLv] = useState(() => {
    const saved = localStorage.getItem('researchLv');
    return saved ? Number(saved) : 1;
  });
  const [cannonLv, setCannonLv] = useState(() => {
    const saved = localStorage.getItem('cannonLv');
    return saved ? Number(saved) : 1;
  });
    const [castleLv, setCastleLv] = useState(() => {
      const saved = localStorage.getItem('castleLv');
      return saved ? Number(saved) : 1;
    });
    const [currentChapter, setCurrentChapter] = useState(() => {
      const saved = localStorage.getItem('currentChapter');
      return saved ? Number(saved) : 1;
    });
    const [currentStage, setCurrentStage] = useState(() => {
      const saved = localStorage.getItem('currentStage');
      return saved ? Number(saved) : 1;
    });
    const [highestUnlocked, setHighestUnlocked] = useState(() => {
      const saved = localStorage.getItem('highestUnlocked');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
          const num = Number(parsed);
          if (!Number.isNaN(num)) return { 1: num, 2: 1 };
        } catch {}
      }
      return { 1: 1, 2: 1 };
    });
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('volume');
    return saved ? Number(saved) : 1;
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved : 'neon';
  });

  const audio = useAudio();

  useEffect(() => {
    localStorage.setItem('coins', JSON.stringify(coins));
  }, [coins]);
  useEffect(() => {
    localStorage.setItem('unlocks', JSON.stringify(unlocks));
  }, [unlocks]);
  useEffect(() => {
    localStorage.setItem('codexCats', JSON.stringify(codexCats));
  }, [codexCats]);
  useEffect(() => {
    localStorage.setItem('codexEnemies', JSON.stringify(codexEnemies));
  }, [codexEnemies]);
  useEffect(() => {
    localStorage.setItem('lineup', JSON.stringify(lineup));
  }, [lineup]);
  useEffect(() => {
    localStorage.setItem('catLevels', JSON.stringify(catLevels));
  }, [catLevels]);
  useEffect(() => {
    localStorage.setItem('researchLv', String(researchLv));
  }, [researchLv]);
  useEffect(() => {
    localStorage.setItem('cannonLv', String(cannonLv));
  }, [cannonLv]);
  useEffect(() => {
    localStorage.setItem('castleLv', String(castleLv));
  }, [castleLv]);
    useEffect(() => {
      localStorage.setItem('currentStage', String(currentStage));
    }, [currentStage]);
    useEffect(() => {
      localStorage.setItem('currentChapter', String(currentChapter));
    }, [currentChapter]);
    useEffect(() => {
      localStorage.setItem('highestUnlocked', JSON.stringify(highestUnlocked));
    }, [highestUnlocked]);
  useEffect(() => {
    localStorage.setItem('volume', String(volume));
  }, [volume]);
  useEffect(() => {
    audio.setMasterVolume(volume);
  }, [audio, volume]);
  useEffect(() => {
    document.body.classList.remove('theme-modern', 'theme-warm', 'theme-minimal', 'theme-neon');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
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

  // ⚠️ 不要在這裡主動播 bgm_lobby，讓各場景自己播
  const handleEnter = async () => {
    await audio.resume();
    setScene('lobby');
  };

  const addCatName = (name) => setCodexCats(prev => prev.includes(name) ? prev : [...prev, name]);
  const addEnemyName = (name) => setCodexEnemies(prev => prev.includes(name) ? prev : [...prev, name]);

  const handleReset = () => {
    localStorage.clear();
    localStorage.setItem('saveVersion', SAVE_VERSION);
    setCoins(300);
    setUnlocks({ ninja:false, knight:false, mage:false, samurai:false, sumo:false, viking:false, cow:false });
    setCodexCats(['白喵','坦喵','射喵']);
    setCodexEnemies([]);
    setLineup(['white','tank','archer']);
    setCatLevels({ white:1, tank:1, archer:1 });
    setResearchLv(1);
    setCannonLv(1);
    setCastleLv(1);
    setCurrentChapter(1);
    setCurrentStage(1);
    setHighestUnlocked({ 1:1, 2:1 });
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
        maxStage={getMaxStage(currentChapter)}
        highestUnlocked={highestUnlocked[currentChapter]}
        onBack={() => setScene('chapter')}
        onChoose={(n) => { setCurrentStage(n); setScene('battle'); }}
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
        setLineup={(arr)=>{ setLineup(arr); }}
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
          coins={coins}
          setCoins={setCoins}
          currentStage={currentStage}
          currentChapter={currentChapter}
          setScene={setScene}
          highestUnlocked={highestUnlocked}
          setHighestUnlocked={setHighestUnlocked}
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
        className="absolute top-4 right-4 p-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        onClick={() => setShowSettings(true)}
      >
        <span className="icon icon-settings text-lg">設定</span>
      </button>
      {scenes[scene]}
      <SettingsDialog
        show={showSettings}
        onClose={() => setShowSettings(false)}
        audio={audio}
        volume={volume}
        setVolume={setVolume}
        theme={theme}
        setTheme={setTheme}
      />
    </main>
  );
}
