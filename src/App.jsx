import React, { useState } from 'react';
import Lobby from './scenes/Lobby.jsx';
import LevelSelect from './scenes/LevelSelect.jsx';
import Shop from './scenes/Shop.jsx';
import Codex from './scenes/Codex.jsx';
import Lineup from './scenes/Lineup.jsx';
import Battle from './scenes/Battle.jsx';

// 👇 新增
import { useAudio } from './audio/useAudio.js';

export default function App() {
  const [scene, setScene] = useState('lobby');
  const [coins, setCoins] = useState(300);
  const [unlocks, setUnlocks] = useState({ ninja:false, knight:false, mage:false, samurai:false, sumo:false, viking:false, cow:false });
  const [codexCats, setCodexCats] = useState(['白喵','坦喵','射喵']);
  const [codexEnemies, setCodexEnemies] = useState([]);
  const [lineup, setLineup] = useState(['white','tank','archer']);
  const [currentStage, setCurrentStage] = useState(1);
  const [highestUnlocked, setHighestUnlocked] = useState(1);

  // 👇 新增：全域 audio
  const audio = useAudio();

  // 第一次點進 app 時，確保有 resume()
  const handleEnter = async () => {
    await audio.resume();
    audio.playMusic('bgm_lobby'); // 預設進來先播大廳 BGM
    setScene('lobby');
  };

  if (!scene) {
    // 一開始顯示一個「開始」按鈕來解鎖音訊
    return (
      <div className="w-full h-full flex items-center justify-center">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
          onClick={handleEnter}
        >
          ▶️ 開始遊戲
        </button>
      </div>
    );
  }

  const addCatName = (name) => setCodexCats(prev => prev.includes(name) ? prev : [...prev, name]);
  const addEnemyName = (name) => setCodexEnemies(prev => prev.includes(name) ? prev : [...prev, name]);

  const scenes = {
    lobby: (
      <Lobby
        coins={coins}
        highestUnlocked={highestUnlocked}
        goLevel={()=>setScene('level')}
        goLineup={()=>setScene('lineup')}
        goShop={()=>setScene('shop')}
        goCodex={()=>setScene('codex')}
      />
    ),
    level: (
      <LevelSelect
        highestUnlocked={highestUnlocked}
        onBack={()=>setScene('lobby')}
        onChoose={(n)=>{ setCurrentStage(n); setScene('battle'); }}
      />
    ),
    shop: (
      <Shop
        coins={coins}
        unlocks={unlocks}
        onBack={()=>setScene('lobby')}
        onBuy={(key, item)=>{
          if (coins < item.price || unlocks[key]) return;
          setCoins(c=>c-item.price);
          setUnlocks(u=>({...u, [key]:true}));
          addCatName(item.tpl.name);
        }}
      />
    ),
    codex: (
      <Codex
        cats={codexCats}
        enemies={codexEnemies}
        onBack={()=>setScene('lobby')}
      />
    ),
    lineup: (
      <Lineup
        unlocks={unlocks}
        lineup={lineup}
        setLineup={(arr)=>{ setLineup(arr); }}
        addCatName={addCatName}
        onBack={()=>setScene('lobby')}
      />
    ),
    battle: (
      <Battle
        coins={coins}
        setCoins={setCoins}
        currentStage={currentStage}
        setScene={setScene}
        highestUnlocked={highestUnlocked}
        setHighestUnlocked={setHighestUnlocked}
        lineup={lineup}
        unlocks={unlocks}
        addEnemyName={addEnemyName}
        audio={audio}  {/* 👈 傳下去給 Battle 用 */}
      />
    ),
  };

  return (
    <div className="w-full mx-auto max-w-5xl p-4 space-y-4">
      {scenes[scene]}
    </div>
  );
}
