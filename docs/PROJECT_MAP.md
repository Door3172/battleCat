# 專案地圖（PROJECT_MAP）

> 本檔是整個專案的邏輯總覽，讓任何角色的 AI 能快速上手。**改動系統行為後請同步更新對應章節。**
> 最後全面審閱：2026-09-27（CEO）

---

## 0. 目錄結構

```
index.html                 入口 HTML（<body class="theme-neon">，實際主題由 App 覆寫）
vite.config.js             base '/battleCat/'、vitest 用 jsdom
tailwind.config.js         顏色對應 CSS 變數（primary/secondary/ink/bg/ok/warn/danger）
.github/workflows/deploy-pages.yml   push main → build → GitHub Pages
public/
  audio/                   bgm_lobby_v2 / bgm_battle_v2 / sfx_summon / sfx_win / sfx_lose
  pic/                     16 張角色 WebP（256px，約 300KB；UI-004 起用於戰場與各畫面頭像）
  ui-redesign.html         tools/generate_ui.py 產生的 UI 草稿，與遊戲無關
src/
  main.jsx                 React 掛載
  App.jsx                  場景切換 + 全部存檔狀態（localStorage）
  styles.css               CSS 變數、4 種主題、共用 class
  scenes/                  各畫面（Lobby / ChapterSelect / LevelSelect / Battle / Lineup / Shop / Gacha / Upgrade / Codex）
  ui/                      可重用元件（Button / Card / Dialog / HeroBanner / HudInfo / SlotTray / Toolbar / Pill / Badge / Progress / Icons / UnitCard / GachaMachine / SettingsDialog / Divider）
  game/                    戰鬥引擎：world.js（建世界）、ai.js（生怪/移動/攻擊/能力）、draw.js（Canvas 繪製）
  data/                    純資料：cats / enemies / spawns / spawns2 / stages / gachaPool / gachaRates / skin
  audio/                   AudioManager 單例 + useAudio hook
  utils/                   cn / gacha / math(clamp, rand) / number(fmt)
tools/generate_ui.py       產生 ui-redesign.html 的腳本（與遊戲無關）
```

---

## 1. 場景流程與存檔（App.jsx）

**沒有 router**，`App` 用 `scene` state 切換：

```
lobby ──開始遊戲──► chapter ──選章──► level ──選關──► battle ──勝/敗 300ms 後──► lobby
  ├─ lineup（隊伍編成）
  ├─ shop（商店）
  ├─ gacha（轉蛋）
  ├─ upgrade（升級）
  └─ codex（圖鑑）
```
右上角「設定」按鈕在所有場景都存在 → `SettingsDialog`（音量、主題）。

### localStorage 存檔 key（全部由 App 管理，以 props 往下傳）

| key | 預設 | 說明 |
|---|---|---|
| `saveVersion` | `'1'` | 與 `SAVE_VERSION` 不符時清除存檔（`clearSaveData()`，**保留玩家設定**，見下） |
| `coins` | 300 | 金幣（永久貨幣） |
| `unlocks` | `{ninja:false,...,cow:false}` | 已解鎖的商店/轉蛋貓 |
| `catLevels` | `{white:1,tank:1,archer:1}` | 各貓等級（未記錄視為 1） |
| `lineup` | `['white','tank','archer']` | 出戰隊伍（最多 5） |
| `codexCats` / `codexEnemies` | 初始 3 貓名 / [] | 圖鑑（存「中文名稱」，不是 key） |
| `researchLv` / `cannonLv` / `castleLv` | 1 | 研究力 / 貓砲 / 主堡 等級（上限 10） |
| `currentChapter` / `currentStage` | 1 | 目前選擇 |
| `highestUnlocked` | `{1:1, 2:1}` | 各章已解鎖的最高關 |
| `audioVolumes` | `{master:1, music:.8, summon:.8, ui:.8, result:.8}` | 分類音量，**由音訊模組讀寫**（見 §8），App 不管理。舊 key `volume` 已不再使用（首次載入會被轉成 master） |
| `theme` | `'minimal'` | `minimal` / `modern` / `warm` / `neon` |

「清除存檔」= `handleReset()`，把遊戲進度全部重設。清除邏輯集中在 `App.jsx` 的 `clearSaveData()`（`handleReset` 與 `checkSaveVersion` 共用）：清空 localStorage 但**保留 `PRESERVED_KEYS`（`audioVolumes`、`theme`）**，再寫回 `saveVersion`。新增玩家設定類的 key 時，要加進 `PRESERVED_KEYS`（AU-004）。

---

## 2. UI 系統

- **主題**：`styles.css` 在 `:root` 定義完整的設計 token（CSS 變數），`body.theme-minimal / modern / warm / neon` 各自覆寫**全部** token。App 切換 `body` class，所有畫面（含 Canvas）即時跟著變。
  - Minimal＝白底靛藍、Modern＝深色玻璃藍紫、Warm＝奶油橘粉、Neon＝深夜青＋洋紅螢光。
  - Token 分組：品牌色（`--color-primary*`、`--color-secondary*`、`*-ink` 為其上文字色）、文字、狀態、背景/表面（`--color-card-*`、`--color-inset`、`--color-line(-strong)`）、按鈕（`--btn-*`）、Pill（`--pill-*`）、橫幅（`--hero-*`）、圓角（`--radius-card/panel`、`--btn-radius`）、戰場 Canvas（`--field-*`）。
  - **新增主題**：複製一個 `body.theme-*` 區塊把所有變數填上，再到 `SettingsDialog.jsx` 的 `themes` 陣列加選項。
- **DOM 元件一律用 CSS class / `var(--*)`**，不要在 JSX 用 `SKIN.color.*`（那是 JS 讀值，React 不會因主題切換重畫）。
- **`src/data/skin.js`**：`SKIN.color.*`、`SKIN.field.*`（戰場用）是讀 CSS 變數的 getter，**給 Canvas（draw.js）用**；有快取，body class 改變時自動清空。另有 `SKIN.size`、`SKIN.radius`、`SKIN.shadow`、`SKIN.grad`。
- **Tailwind** 顏色對應 CSS 變數（`text-ink`、`bg-ok` 等）。
- 共用 class：`.ui-btn`（`-primary/-accent/-ghost`）、`.ui-card`/`.ui-card-dark`、`.ui-pill`、`.ui-divider`、`.ui-dialog(-backdrop)`、`.ui-select`、`.hero-banner`/`.hero-title`/`.hero-sub`/`.hero-chip`、`.stage-btn`（`.locked` 顯示 🔒 / `.boss`）、`.slot-tray`、`.hud-stat`、`.unit-card`、`.gacha-*`、`.game-background`、`.text-sub`/`.text-mute`/`.text-highlight`。
- **元件重點**：
  - `Button`：`tone` = default/primary/ghost/accent，`size` = sm/md/lg；同時綁 `onPointerUp` 與 `onClick`，用 120ms 鎖防止重複觸發。可傳 `aria-label`。點擊時呼叫 `audio.playClick()`（disabled 不播）。
  - `SettingsDialog`：五條分類音量滑桿（主音量 / 背景音樂 / 召喚 / 按鈕 / 勝敗，直接呼叫 `audio.getVolumes()` / `audio.setVolume()`，除音樂外都有 ▶ 試聽）＋風格選單。只收 `show`、`onClose`、`audio`、`theme`、`setTheme`。
  - `Card`：`tone` light/dark。
  - `Dialog`：`fullscreen` 決定 fixed/absolute，Esc 或點背景呼叫 `onClose`。`fullscreen` 時用 portal 掛到 `document.body`（外框 `.game-background` 有 backdrop-filter，會讓 fixed 改成相對外框定位）。
  - `HeroBanner`：每個場景的頂部標題列；`right` 內容會包在半透明膠囊 `.hero-chip` 裡。
  - 各場景的「← 返回」按鈕放在橫幅**上方**一列（ghost/sm），右上角留給 App 的「設定」按鈕。
  - `HudInfo`（不再自帶 Card）/ `SlotTray` / `Toolbar`（`lg` 以上左 1.6 : 右 1）：戰鬥畫面下方控制區。
  - `CatAvatar`（`catKey`, `name`, `size`）：圓形貓咪頭像；沒有圖（`jaycat`、`jay`）或載入失敗時顯示名字首字的漸層徽章。用於隊伍編成、升級、商店、戰鬥召喚欄、圖鑑。深色主題（modern/neon）頭像底色用 `--avatar-bg` 亮色，避免黑線條看不清。
  - `catArt.js`：`CAT_ART_KEYS`（有圖的貓）、`catArtUrl(key)`（含 `import.meta.env.BASE_URL`）、`catKeyByName(中文名)`（圖鑑用，唯讀 `cats.js`）、`preloadCatArt()` / `getCatImage(key)`（Canvas 用）。**新增角色圖**：放 `public/pic/<key>.webp`（最長邊 256px）並把 key 加進 `CAT_ART_KEYS`。
  - `UnitCard`：圖鑑用，頭像＋名稱＋左側類型色條（已移除原本寫死的假攻擊/血量）。`Codex.jsx` 的 `typeMap` 名稱對不上的問題仍在。
  - `GachaMachine`：CSS 扭蛋機外觀（顏色跟主題 secondary），無動畫/邏輯。
- 戰場畫面**不是 DOM**，是 Canvas（見 §4 draw.js），天空/地面/文字顏色讀 `SKIN.field.*`。**貓咪**用 `public/pic/<unit.key>.webp` 角色圖（高 38px，`draw.js` 載入時預載），圖未載入完成或沒有圖時退回色塊 + 耳朵；**敵人**仍是色塊。

---

## 3. 友軍（貓咪）— `src/data/cats.js`

### 單位模板欄位（貓/敵人共用大部分）
| 欄位 | 意義 |
|---|---|
| `name` | 中文名 |
| `cost` | 召喚花費的「魚」（貓專用） |
| `cd` | 召喚冷卻秒數（貓專用） |
| `hp` / `attack` | 血量 / 每次攻擊傷害 |
| `speed` | 移動速度（px/秒） |
| `range` | 射程（px），實際觸發距離 = `range + BODY_W*0.4`（BODY_W=22） |
| `atkRate` | 攻擊間隔秒數（**越小越快**） |
| `aoe` / `aoeRadius` / `aoeMinRadius` / `maxTargets` | 範圍攻擊、半徑、最小距離（死角）、最多命中數（含主堡） |
| `hpIncrement` / `atkIncrement` | 每升 1 級增加量（貓專用） |
| `abilities` | 特殊能力（見 §4.4） |
| `color` | Canvas 上的色塊顏色 |

### 三種來源
1. **`BASE_CATS`**（預設擁有）：white 白喵、tank 坦喵、archer 射喵、giant 巨人喵、bird 鳥喵、fish 魚喵、lizard 蜥蜴喵。
2. **`SHOP_UNLOCKS`**（金幣購買，`{ name, price, tpl }`）：ninja 忍者喵(120)、knight 騎士喵(300)、mage 法師喵(390)、samurai 武士喵(360)、sumo 相撲喵(300)、viking 維京喵(400)、cow 牛喵(200)、jaycat 禁節貓娘(520)、jay 禁節喵(520)、void 虛空秘典喵(1200)、azurePhantom 蒼藍幻影喵(1200)。
3. **`GACHA_UNLOCKS`**：目前是空物件。

### 等級計算 — `world.js` 的 `buildCatsTpl(unlocks, catLevels)`
- `hp = tpl.hp + hpIncrement*(lv-1)`，`attack = tpl.attack + atkIncrement*(lv-1)`。
- 納入順序：`BASE_CATS` → 已解鎖的 `GACHA_UNLOCKS` → 已解鎖的 `SHOP_UNLOCKS`（皆依宣告順序）。這個順序就是隊伍編成、升級畫面的列表順序。
- 商店貓由 `buildCatsTpl` **自動遍歷 `SHOP_UNLOCKS`**，`unlocks[key]` 為 true 就用 `SHOP_UNLOCKS[key].tpl` 納入（AL-001，2026-09-27）。**新增商店貓只要在 `cats.js` 的 `SHOP_UNLOCKS` 加一筆**，不必再改 `world.js`；想調整列表順序，就調整 `SHOP_UNLOCKS` 裡的宣告順序。
- 此函式同時被 Battle、Lineup、Upgrade 使用。

### 隊伍編成（Lineup.jsx）
- 點擊切換，最多 5 隻；戰鬥中按 1~5 對應 lineup 順序。

---

## 4. 戰鬥引擎

### 4.1 世界狀態 — `world.js` `createWorld()`
- 我方主堡 x=50，敵方主堡 x=`50 + towerDistance`。地面 y = 畫布高 × 0.72。
- 我方主堡 HP = `1000 + (castleLv-1)*100`；敵方主堡 HP = 關卡 `enemyBaseHp`。
- 初始魚 150，收入 `7.5 + 4.5*(researchLv-1)` 魚/秒。
- `units` 陣列中 `team: 1` 是貓，`team: -1` 是敵人。
- 單位由 `ai.js` 的 `makeUnit(team, x, y, tpl, key)` 建立，主要欄位：`id`、`key`、`team`、`x`/`y`、`hp`/`maxHp`、`speed`/`baseSpeed`、`atk`/`baseAtk`、`range`、`atkRate`/`atkCd`、`color`、`name`、`bounty`、`aoe*`/`maxTargets`、`abilities`、`effects`、`shieldHp`/`shieldCd`、`revived`。
- **`unit.key`**（EG-002）：模板 key。貓 = cats key（`'white'`、`'ninja'`…，來自 `spawnCat(key)`）；敵人 = `ENEMIES` key；BOSS = `BOSSES` key。找不到 key 而退回預設時，`key` 也跟著是退回後的 `'dog'` / `'boarKing'`，與實際外觀數值一致。可供 `draw.js` 選角色圖。

### 4.2 主迴圈 — `Battle.jsx` `loop()`
每幀（dt 上限 0.05s × 倍速 1x/2x）：
1. 時間、魚收入、大砲 CD、各貓召喚 CD 遞減
2. `spawnBossIfNeeded`（依 `boss.time` 與 `boss.hp` 條件）
3. 依關卡 `schedule` 生怪（見 §5）
4. `stepUnits`：能力處理 → 找最近敵人 → 攻擊 → 移動 → 清屍、計算擊殺賞金（加到**魚**）
5. 勝負判定：敵堡 HP≤0 勝 / 我堡 HP≤0 敗 → 300ms 後回大廳
6. HUD 每 0.12s 同步到 React state，Canvas 每幀重畫

**操作**：1~5 召喚、Space 貓咪砲、X 切 1x/2x、P 暫停、R 重開。進場 300ms 後自動開始。
**我方上限**：場上貓 > 70 隻不能再召喚。

### 4.3 戰鬥規則（`ai.js` `stepUnits`）
- 目標 = X 距離最近的存活敵方單位。
- 目標在射程內（且 ≥ `aoeMinRadius`）或敵堡在射程內就攻擊。
- 非 AOE：打目標，否則打主堡。AOE：對半徑內所有敵人（最多 `maxTargets`），名額有剩且主堡在範圍內也打主堡。
- 移動：與目標距離 ≤ `range*0.98` 停下；貼太近（< BODY_W*0.9）停下；抵達敵堡前 18px 停下。
- **貓咪砲**（`fireCannon`）：全體敵人扣 `60 + (cannonLv-1)*10` HP 並擊退 60px，CD 20 秒。**無視護盾、閃避、擊退免疫**。
- **戰鬥中收入升級**（HUD 按鈕，標籤寫「研究力」但其實是戰鬥內收入）：花 `incomeCost` 魚，收入 +`3 + 1.5*(researchLv-1)`；cost 從 100 起，每次 += `100*(新等級-1)`。

### 4.4 能力系統（`abilities`，貓敵共用，說明也寫在 `ai.js` 開頭註解）
| key | 參數 | 效果 |
|---|---|---|
| `critical` | chance, multiplier(2) | 暴擊 |
| `lifesteal` | chance, percent | 依實際傷害回血 |
| `freeze` | chance, duration | 目標停止行動 |
| `knockback` | chance, distance | 擊退 |
| `slow` | chance, duration, factor(0.5) | 緩速 |
| `shield` | interval, amount | 每 interval 秒刷新護盾（出場立即有） |
| `revive` | chance, percent | 死亡時機率復活一次 |
| `berserk` | threshold, attackUp | HP ≤ threshold 時攻擊 ×(1+attackUp) |
| `dodge` | chance | 閃避傷害 |
| `freezeImmune` / `knockbackImmune` / `slowImmune` | true | 免疫 |

### 4.5 繪製 — `draw.js`
- `drawAll`：背景漸層、地面、兩座主堡（含血條）、所有單位、左上角資訊文字、勝敗遮罩。
- `drawUnit`：色塊 + 耳朵 + 血條；貓顯示名字，敵人一律顯示「敵」。
- 畫布寬度 = max(towerDistance+100, 高×1.9)，支援 DPR（上限 2）。

---

## 5. 關卡 — `spawns.js` / `spawns2.js` / `stages.js`

- **章節**：1 = 世界篇（`SPAWNS`，20 關）、2 = 未來篇（`SPAWNS2`，20 關，海洋主題敵人）。對應表在 `stages.js` 的 `SPAWNS_MAP`。
- `getMaxStage(chapter)` = 該章最大關卡編號。
- `stageConfig(stage, chapter)` 回傳：`enemyBaseHp`(預設1000)、`towerDistance`(預設750)、`schedule`（深拷貝、依 time 排序）、`isBoss/bossKey/bossAt/bossHp/bossMultiplier`、`rewardCoins`。

### 關卡資料格式
```js
5: {
  enemyBaseHp: 1000,        // 敵堡 HP
  towerDistance: 800,       // 兩堡距離(px)
  reward: 250,              // 勝利金幣
  boss: { time: 1, key: 'boarKing', hp: 2000, multiplier: 100 }, // 可選；time 秒後且敵堡 HP ≤ hp 才出
  schedule: [
    { time: 1, type: 'hippo', multiplier: 100 },                 // 單次
    { start: 8, interval: 10, until: 60, type: 'dog', multiplier: 200 }, // 週期
    { hp: 500, interval: 6, type: 'dog' },                       // 敵堡 HP ≤ 500 後才開始
  ],
}
```
- `type` 必須是 `ENEMIES` 或 `BOSSES` 的 **key**（不是中文名）；找不到會**默默變成 dog**。
- `multiplier`：百分比，**同時放大 HP 與攻擊**（不是數量）。
- 可選 `count`：週期出怪的總次數上限（有 `interval` 時預設無限，否則為 1；實作在 `Battle.jsx` 生怪迴圈）。
- 檢查方式：用 Node 匯入 `SPAWNS`/`SPAWNS2`/`ENEMIES`/`BOSSES`，確認每個 `schedule[].type` 與 `boss.key` 都存在於 `ENEMIES` 或 `BOSSES`（2026-09-27 檢查 246 筆，全部合法）。
- 排程出的敵人**不套用**難度成長；BOSS（`boss` 欄位）**會套用** `computeScale`：每關 +8%、每秒 +0.4%（上限 180s）、每已出怪 +1.5%（上限 +45%）。
- 關卡解鎖：勝利後 `highestUnlocked[章] = min(最大關, max(原值, 本關+1))`。已通關的關卡可重複刷獎勵。
- 關卡選擇畫面依 `stageConfig(n, chapter).isBoss` 標 ⭐（UI-002）；`App` 會傳 `chapter` 給 `LevelSelect`。

### 新增章節需要改的地方
`spawnsN.js` 新檔 → `stages.js` 的 `SPAWNS_MAP` → `ChapterSelect.jsx` 按鈕 → `App.jsx` 的 `highestUnlocked` 預設值與 `handleReset` → `Lobby.jsx` 右上 Pill 顯示。

---

## 6. 敵人 — `src/data/enemies.js`

欄位同 §3，另有 `bounty`（擊殺獲得的魚，實際 ×0.9~1.1 隨機）。

- **ENEMIES（第一章系）**：dog 小狗、snake 小蛇、hippo 河馬、red 紅色怪、boar 野豬、black 黑影怪、alien 外星、metal 金屬怪（未被任何關卡使用）、elephant 大象、snail 蝸牛、bull 公牛
- **ENEMIES（第二章海洋系）**：clownfish 小丑魚、angelfish 神仙魚、pufferfish 河豚（必定擊退）、hermitCrab 寄居蟹（護盾）、babySquid 小墨魚（緩速）、octopusling 小章魚（復活）、dolphin 海豚（擊退）、spermWhale 抹香鯨（免疫緩速/擊退）、colossalLobster 巨龍蝦（護盾）
- **BOSSES**：boarKing 野豬王（1-10、1-19）、alienEye 星眼巨像（1-15）、mechGolem 機甲巨像（1-20）、octopusKing 章魚王（2-10）、ghostShark 幽靈鯊（2-20，多重能力＋三免疫）

敵人第一次出現時呼叫 `addEnemyName(中文名)` 加入圖鑑。

---

## 7. 經濟（金錢）

### 兩種貨幣
| 貨幣 | 範圍 | 來源 | 用途 |
|---|---|---|---|
| **金幣 coins** | 永久（存檔） | 關卡勝利 `reward`、轉蛋重複返還 | 商店解鎖、轉蛋、升級 |
| **魚 fish** | 單場戰鬥 | 初始 150、每秒收入、擊殺賞金 | 召喚貓、戰鬥內收入升級 |

### 金幣支出
- 商店：`SHOP_UNLOCKS[key].price`
- 轉蛋：`GACHA_PRICE = 150`
- 升級（貓 / 研究力 / 貓砲 / 主堡，皆上限 Lv10）：`upgradeCost(lv) = floor(100 × 1.5^(lv-1))`
  → Lv1→2: 100、2→3: 150、3→4: 225 … 9→10: 2562；單項升滿總計 7,486。

### 升級效果
| 項目 | 效果 |
|---|---|
| 貓等級 | +hpIncrement / +atkIncrement 每級 |
| 研究力 researchLv | 戰鬥初始收入 `7.5+4.5*(lv-1)`；戰鬥內每次收入升級 +`3+1.5*(lv-1)` |
| 貓砲 cannonLv | 傷害 `60+10*(lv-1)` |
| 主堡 castleLv | HP `1000+100*(lv-1)` |

### 轉蛋 — `utils/gacha.js`、`data/gachaRates.js`、`data/gachaPool.js`
- 稀有度機率 `RARITY_RATES` {1: 80%, 2: 15%, 3: 5%}；重複返還 `REFUND_RATES` {1: 5%, 2: 10%, 3: 20%}（× 150）。
- 抽池 `GACHA_CHARACTERS = [{ key, rarity }]`，**目前是空陣列 → 按了抽蛋不會有任何反應**。
- 抽到的 key 會寫入 `unlocks`，但要能在戰鬥中出現，該 key 必須存在於 `BASE_CATS` 或 `GACHA_UNLOCKS`（且 `buildCatsTpl` 只會納入 `GACHA_UNLOCKS` 中已解鎖的）。

---

## 8. 音效 — `src/audio/`

- `AudioManager` 單例（Web Audio API）。節點：`musicFade`（淡入淡出用）→ `music` 分類 gain → `master`；`summon` / `ui` / `result` 分類 gain → `master`。淡入淡出只動 `musicFade`，不會改到使用者設定的音量。
- **音量分類**（AU-002）：`master` 總音量、`music` 背景音樂、`summon` 召喚音效、`ui` 按鈕音效、`result` 勝敗音效。
  - 由音訊模組自己存到 localStorage `audioVolumes`（`{ master, music, summon, ui, result }`，0~1；預設 master 1、其他 0.8）。沒有 `audioVolumes` 時會把舊 key `volume` 轉成 `master`（舊 key 不刪）。
  - 對外 API：`audio.getVolumes()`、`audio.setVolume(category, value)`（立即生效並存檔；AudioContext 尚未建立也可呼叫，建立時套用）、`audio.playClick()`（按鈕音效，60ms 冷卻）。舊的 `setMasterVolume` / `setMusicVolume` / `setSfxVolume` 保留為相容用（轉呼叫 `setVolume`）。
  - 音效 → 分類：`sfx_summon`→summon、`sfx_click`→ui、`sfx_win`/`sfx_lose`→result；其他 key 預設 summon，可用 `audio.register(key, url, { category })` 指定。
- 註冊的 key：`bgm_lobby`、`bgm_battle`、`sfx_summon`、`sfx_win`、`sfx_lose`（路徑經 `import.meta.env.BASE_URL` 處理），在 `useAudio.js` 模組載入時註冊。`sfx_click` 不是音檔，是振盪器即時合成（三角波 1100→650Hz、約 70ms）。
- **預載**：`resume()` 第一次建立 AudioContext 後，依註冊順序在背景下載＋解碼所有音檔（載入失敗會還原成 URL，下次可重試）。
- `playMusic`（硬切；**同一首正在播就不重播**，只取消進行中的淡出；`{ restart: true }` 可強制重播）、`crossfadeMusic`（淡入淡出）、`fadeOutMusic`（淡出後停止；之後若有新的播放請求，停止動作會被取消）、`playSfx`（預設 80ms 冷卻）。播放 / 淡出都走 token 機制，「最後一次請求」生效，避免競態。所有公開方法失敗只 `console.warn`，不支援 Web Audio 的環境（測試）不會報錯。
- 瀏覽器需使用者互動才能播放：App 在第一次 pointerdown/keydown/touchstart 時 `audio.resume()`；在那之前的播放請求會等到解鎖後才開始。
- 播放時機：Lobby / ChapterSelect / LevelSelect → bgm_lobby（同一首不重播）；Battle 進場 → bgm_battle、離場 → bgm_lobby；召喚 → sfx_summon；勝/敗 → 淡出 + sfx。

---

## 9. 圖鑑 — `scenes/Codex.jsx`
- 我方：`codexCats`（購買、轉蛋、編成時加入）；敵方：`codexEnemies`（戰鬥中遇到時加入）。存的是中文名。
- `typeMap` 用名稱對應卡片類型，但裡面寫的是「忍者貓/法師貓」等，與實際名稱「忍者喵/法師喵」不符。

---

## 10. 建置、測試、部署
- `npm run build` 可正常建置（2026-09-27 確認）。
- `npm test`：目前 repo 內的 `node_modules` 缺 vitest，需先 `npm install`。唯一測試 `src/App.test.jsx` 只檢查「開啟設定」按鈕存在。
- 部署：`.github/workflows/deploy-pages.yml`，push `main` 自動部署。另有 `npm run deploy:local`（gh-pages 分支方式，備用）。

---

## 11. 已知問題 / 技術債（由 CEO 維護；其他角色發現問題請用跨角色請求回報 CEO）

| # | 領域 | 問題 | 位置 | 任務 |
|---|---|---|---|---|
| 1 | 關卡 | ~~第二章第 9 關 `type: '小丑魚'` 用了中文名，找不到 key → 變成 **小狗 ×1000%**~~ ✅ 已修（2026-09-27） | `spawns2.js` 第 9 關 | LV-001 |
| 2 | 經濟 | 轉蛋池 `GACHA_CHARACTERS` 為空，轉蛋功能實際無作用 | `gachaPool.js` | CEO-001 |
| 3 | 友軍 | ~~新增商店貓需手動改 `buildCatsTpl`，容易漏~~ ✅ 已修（2026-09-27） | `world.js` | AL-001 |
| 4 | 專案 | `node_modules/`（約 4,000 檔）被 commit 進 git，雖然 `.gitignore` 有寫 | repo | CEO-002 |
| 5 | 美術 | ~~`public/pic/*.png`（16 張，約 12MB）與 `public/audio/廢棄.mp3`（4.9MB）未被使用，但會被部署~~ ✅ 已處理（AU-001 刪除、UI-004 啟用並壓縮） | `public/` | CEO-003 |
| 6 | UI | 圖鑑 `Codex.jsx` 的 `typeMap` 名稱對不上（寫「忍者貓」等，實際是「忍者喵」）；`UnitCard` 樣式與假數值已於 CEO-004 修正 | `Codex.jsx` | — |
| 7 | UI | ~~戰鬥 HUD 的「研究力」按鈕其實是戰鬥內收入升級，與大廳升級的「研究力」名稱衝突~~ ✅ 已修（2026-09-27） | `HudInfo.jsx` | UI-001 |
| 8 | 引擎 | `world.js`/`ai.js` 有未使用的舊生怪路徑（`firstDelay`、`spawnRate`、`pool`、`sequence`、`maxEnemies`、`difficulty` 皆未定義），`maxEnemies` 未定義 → 敵人數量無上限 | `ai.js`、`world.js` | — |
| 9 | 引擎 | 貓咪砲無視護盾/閃避/擊退免疫 | `Battle.jsx` `fireCannon` | — |
| 10 | 關卡 | ~~`spawns.js` 註解說 multiplier 是「數量倍率」，實際是能力值倍率~~ ✅ 已修（2026-09-27） | `spawns.js` | LV-001 |
| 11 | 敵人 | `metal` 金屬怪已定義但沒有任何關卡使用 | `enemies.js` | — |
| 12 | 測試 | ~~本機 node_modules 缺 vitest，`npm test` 失敗；測試覆蓋率極低~~ ✅ 執行 `npm install` 後 `npm test` 可通過（2026-09-27）；測試覆蓋率仍極低 | — | — |
| 13 | UI | ~~關卡選擇的 BOSS ⭐ 用 `n%10` 寫死，未讀取關卡 `boss` 設定（1-15、1-19 也有 BOSS 卻沒標）~~ ✅ 已修（2026-09-27） | `LevelSelect.jsx` | UI-002 |
| 14 | UI | ~~設定按鈕（App.jsx）與召喚欄（Battle.jsx）用 CSS 選擇器 / `!important` 硬蓋樣式，屬權宜作法~~ ✅ 已修（UI-003） | `styles.css` | UI-003 |
| 15 | UI | App 右上「設定」按鈕與關卡格（`.stage-btn`）是原生 `<button>`，沒有點擊音效 | `App.jsx`、`LevelSelect.jsx` | — |
| 16 | 音效 | ~~「清除存檔」會清掉 localStorage 的 `audioVolumes`，但記憶體中的音量保留，直到下次調整才重寫；主題 `theme` 也有同樣問題~~ ✅ 已修（AU-004：清除存檔保留音量與主題） | `App.jsx` `handleReset` | AU-004 |
