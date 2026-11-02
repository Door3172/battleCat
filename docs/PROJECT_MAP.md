# 專案地圖（PROJECT_MAP）

> 本檔是整個專案的邏輯總覽，讓任何角色的 AI 能快速上手。**改動系統行為後請同步更新對應章節。**
> 最後全面審閱：2026-09-27（CEO）；2026-11-02 整體網站優化（CEO-005）後更新 §0、§1、§2、§4.2、§8、§10、§11

---

## 0. 目錄結構

```
index.html                 入口 HTML：meta / favicon / manifest、粉圓字型 <link>、<body> 開頭的內嵌腳本（React 掛載前就套用存檔主題，UI-014）
vite.config.js             base '/battleCat/'、React 拆成獨立 chunk（EG-013）、vitest 用 jsdom
package.json               "type": "module"（設定檔都是 ESM，EG-013）
tailwind.config.js         顏色對應 CSS 變數（primary/secondary/ink/bg/ok/warn/danger）
.github/workflows/deploy-pages.yml   push main → build → GitHub Pages
public/
  audio/                   bgm_lobby_v2 / bgm_battle_v2 / sfx_summon / sfx_win / sfx_lose（AU-006 起都是真正的 MP3，合計約 4.35 MB）
  pic/                     17 張角色 WebP（256px，約 310KB；UI-004 起用於戰場與各畫面頭像；UI-013 加入 jay）
  manifest.webmanifest     PWA 資訊（路徑用相對路徑，配合 /battleCat/）
src/
  main.jsx                 React 掛載
  App.jsx                  場景切換 + 全部存檔狀態（localStorage）
  styles.css               CSS 變數、4 種主題、共用 class
  scenes/                  各畫面（Lobby / ChapterSelect / LevelSelect / Battle / Lineup / Shop / Gacha / Upgrade / Codex）
  ui/                      可重用元件（Button / Card / Dialog / HeroBanner / HudInfo / SlotTray / Toolbar / Pill / Badge / Progress / Icons / UnitCard / GachaMachine / SettingsDialog / Divider）
  game/                    戰鬥引擎：world.js（建世界）、ai.js（生怪/移動/攻擊/能力）、draw.js（Canvas 繪製）
  data/                    純資料：cats / enemies / spawns / spawns2 / stages / gachaPool / gachaRates / skin
  audio/                   AudioManager 單例 + useAudio hook
  utils/                   cn / gacha / math(clamp, rand) / number(fmt) / storage（localStorage 安全讀寫，EG-012）
tools/generate_ui.py       產生 tools/ui-redesign.html 的腳本（與遊戲無關；UI-014 起移出 public/，不會被部署）
```

---

## 1. 場景流程與存檔（App.jsx）

**沒有 router**，`App` 用 `scene` state 切換：

```
lobby ──開始遊戲──► chapter ──選章──► level ──選關──► battle ──勝/敗──► 結算視窗（EG-012）
  ├─ lineup（隊伍編成）                                              ├─ 勝利：下一關 → battle（下一關是首次遇到的環境 → level 並自動打開環境說明）
  ├─ shop（商店）                                                    │        再玩一次（同一場重開）/ 返回大廳
  ├─ gacha（轉蛋）                                                   └─ 戰敗：再試一次 / 去升級（upgrade）/ 返回大廳
  ├─ upgrade（升級）
  └─ codex（圖鑑）
```
（舊版是勝敗 300ms 後自動回大廳，EG-012 已改為停在結算視窗。）
- `Battle` 以 `key={章-關-battleRun}` 掛載：換關（下一關）或從關卡選擇重新進場都會重新掛載，戰鬥狀態從頭開始。
- 「下一關」由 `App.goNextStage()` 處理；需要先看環境說明時，設 `pendingStage` 並切到 `level`，`LevelSelect` 的 `autoStage` prop 會直接選那一關（跳出說明視窗）。

右上角「設定」按鈕在所有場景都存在 → `SettingsDialog`（音量、主題）。

### localStorage 存檔 key（全部由 App 管理，以 props 往下傳）

| key | 預設 | 說明 |
|---|---|---|
| `saveVersion` | `'1'` | 與 `SAVE_VERSION` 不符時清除存檔（`clearSaveData()`，**保留玩家設定**，見下） |
| （讀寫方式） | | EG-012 起所有 key 經 `App.jsx` 的 `usePersistentState` → `utils/storage.js` 的 `readSaved` / `writeSaved` 讀寫：JSON 損毀或型別不符時退回 `DEFAULTS`，不會白屏。格式與舊版相同（數字類用 `String`、物件陣列用 JSON、`theme` 原字串）。`highestUnlocked` 讀檔時與 `{1:1, 2:1}` 合併（舊存檔缺新章節 key 時不會變成全部解鎖）。 |
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
  - **美術風格：卡通手遊風**（UI-012）：粗描邊（`--outline`）＋硬陰影（`--pop`）＋可「按下去」的立體按鈕＋圓體字（Google Fonts「Huninn 粉圓」，UI-014 起改在 `index.html` 用 `<link>` 載入；標題、按鈕、數字用 `--font-display`）。**內文 `--font-sans` 是系統字型**（蘋方 / 微軟正黑體 / Noto Sans CJK，UI-014 移除 Inter 與 Noto Sans TC 網路字型，省約 1.25 MB）；Tailwind 的 `font-sans` / `font-display` 對應這兩個 CSS 變數。背景是貓掌／星點／網格紋理（`--bg-pattern`）。
  - **開頁主題**：`index.html` 的 `<body>` 開頭有內嵌腳本，在 React 掛載前就依 `localStorage.theme` 設好 `body` class（不會先閃別的主題）。主題清單在三處要一致：`index.html` 腳本、`App.jsx` 的 `THEME_KEYS`、`SettingsDialog.jsx` 的 `THEMES`。
  - 4 套主題（存檔值不變，只改外觀與顯示名稱）：`minimal`＝☀️ 晴空（藍天、白面板、黃按鈕）、`modern`＝🌌 星夜（深紫夜空、星點、亮黃按鈕）、`warm`＝🍯 蜜糖（蜜桃色、奶油面板、橘粉按鈕）、`neon`＝🕹️ 霓虹街機（深夜網格、青色描邊、洋紅立體陰影）。
  - **按鈕懸停只改亮度、不做位移**；按下（`:active`）才往下沉。戰鬥控制區（`Toolbar` 根元素 `.battle-toolbar`）關閉轉場，避免 HUD 更新時元件重建造成閃動（根因見 EG-011）。
  - Token 分組：品牌色（`--color-primary*`、`--color-secondary*`、`*-ink` 為其上文字色）、文字、狀態、背景/表面（`--color-card-*`、`--color-inset`、`--color-line(-strong)`）、按鈕（`--btn-*`）、Pill（`--pill-*`）、招牌（`--hero-*`、`--hero-stripes`、`--title-stroke`）、描邊與硬陰影（`--outline`、`--pop`）、背景紋理（`--bg-pattern`）、頭像底（`--avatar-bg`）、圓角（`--radius-card/panel`、`--btn-radius`）、戰場 Canvas（`--field-*`）。
  - **新增主題**：複製一個 `body.theme-*` 區塊把所有變數填上，再到 `SettingsDialog.jsx` 的 `THEMES` 陣列加選項。
- **DOM 元件一律用 CSS class / `var(--*)`**，不要在 JSX 用 `SKIN.color.*`（那是 JS 讀值，React 不會因主題切換重畫）。
- **`src/data/skin.js`**：`SKIN.color.*`、`SKIN.field.*`（戰場用）是讀 CSS 變數的 getter，**給 Canvas（draw.js）用**；有快取，body class 改變時自動清空。另有 `SKIN.size`、`SKIN.radius`、`SKIN.shadow`、`SKIN.grad`。
- **Tailwind** 顏色對應 CSS 變數（`text-ink`、`bg-ok` 等）。
- 共用 class：`.ui-btn`（`-primary/-accent/-ghost`）、`.ui-card`/`.ui-card-dark`、`.ui-pill`、`.ui-divider`、`.ui-dialog(-backdrop)`、`.ui-select`、`.hero-banner`/`.hero-title`/`.hero-sub`/`.hero-tag`/`.hero-chip`、`.coin-badge`、`.menu-tile`/`.menu-tile-icon`、`.lobby-start`、`.tip-list`、`.kbd`、`.battle-toolbar`、`.slot-card`、`.number-pop`、`.stage-btn`（`.locked` 顯示 🔒 / `.boss`）、`.slot-tray`、`.hud-stat`、`.unit-card`、`.gacha-*`、`.game-background`、`.text-sub`/`.text-mute`/`.text-highlight`。
- **元件重點**：
  - `Button`：`tone` = default/primary/ghost/accent，`size` = sm/md/lg；同時綁 `onPointerUp` 與 `onClick`，用 120ms 鎖防止重複觸發。可傳 `aria-label`。點擊時呼叫 `audio.playClick()`（disabled 不播）。
  - 不是 `Button` 元件、但也有點擊音效的原生按鈕：App 右上「設定」（`.ui-corner-btn`）、關卡格（`.stage-btn`，只有已解鎖才播）。之後新增原生 `<button>` 時記得自己呼叫 `audio.playClick()`。
  - `SettingsDialog`：六條分類音量滑桿（主音量 / 背景音樂 / 召喚 / 按鈕 / 勝敗 / 環境提示音，定義在 `VOLUME_ROWS`；直接呼叫 `audio.getVolumes()` / `audio.setVolume()`，除音樂外都有 ▶ 試聽）＋風格選單。只收 `show`、`onClose`、`audio`、`theme`、`setTheme`。
  - `Card`：`tone` light/dark。
  - `Dialog`：`fullscreen` 決定 fixed/absolute，Esc 或點背景呼叫 `onClose`。`fullscreen` 時用 portal 掛到 `document.body`（外框 `.game-background` 有 backdrop-filter，會讓 fixed 改成相對外框定位）。
  - `HeroBanner`：每個場景的頂部招牌（斜紋底＋描邊標題＋右上大貓掌裝飾）；副標 8 字以內（頁面名稱，如「商店」）顯示成傾斜的緞帶標籤 `.hero-tag`，較長的說明文字用 `.hero-sub`；`right` 內容包在膠囊 `.hero-chip` 裡。`compact`（戰鬥畫面用，UI-014）：≤640px 縮小招牌並隱藏說明文字，觸控裝置也隱藏（鍵盤說明用不到）。
  - 大廳（`Lobby.jsx`）：金幣徽章 `.coin-badge`、整列主按鈕「開始遊戲」、5 格圖示選單 `.menu-tile`（編成／商店／轉蛋／升級／圖鑑）、提示與操作說明（按鍵用 `.kbd`）。
  - 各場景的「← 返回」按鈕放在橫幅**上方**一列（ghost/sm），右上角留給 App 的「設定」按鈕。
  - `HudInfo`（不再自帶 Card）/ `SlotTray` / `Toolbar`（`lg` 以上左 1.6 : 右 1）：戰鬥畫面下方控制區。
  - **戰鬥畫面（UI-014）**：畫布顯示寬度 `max-width: 100%; height: auto`，比外框寬時等比例縮小（手機也看得到兩座主堡；戰鬥座標不變）。召喚欄固定 5 欄；魚不夠時格子加 `.is-poor`（頭像與價格變灰）；冷卻顯示「2.3s」。≤640px：隱藏貓名（按鈕有 `aria-label`）、頭像 40px；直向時顯示 `.battle-rotate-hint`「橫放手機，戰場會更大」；環境膠囊縮小。暫停對話框是單行（含「繼續」按鈕）。結算視窗是全螢幕 `Dialog`（`.battle-result-title`、`.battle-result-reward`）。
  - **轉蛋**（UI-014）：`GACHA_CHARACTERS` 為空時按鈕顯示「轉蛋準備中」並停用；金幣不足、抽蛋失敗都有提示。
  - **隊伍編成**（UI-014）：至少保留 1 隻、滿 5 隻時提示；存檔裡不存在的貓 key 顯示原 key、不會崩潰。
  - `CatAvatar`（`catKey`, `name`, `size`）：圓形貓咪頭像；沒有圖（目前只有 `jaycat`）或載入失敗時顯示名字首字的漸層徽章。用於隊伍編成、升級、商店、戰鬥召喚欄、圖鑑。深色主題（modern/neon）頭像底色用 `--avatar-bg` 亮色，避免黑線條看不清。
  - `catArt.js`：`CAT_ART_KEYS`（有圖的貓）、`catArtUrl(key)`（含 `import.meta.env.BASE_URL`）、`catKeyByName(中文名)`（圖鑑用，唯讀 `cats.js`）、`preloadCatArt()` / `getCatImage(key)`（Canvas 用）。**新增角色圖**：放 `public/pic/<key>.webp`（最長邊 256px）並把 key 加進 `CAT_ART_KEYS`。
  - `UnitCard`（`name`, `role`, `catKey`）：圖鑑用，頭像＋名稱＋定位標籤，左側色條依定位上色。
  - `catRoles.js`：圖鑑卡片定位，**以貓咪 key 對應**（`CAT_ROLES`）：`tank` 坦克（藍）、`warrior` 近戰（橘）、`archer` 遠程（綠）、`mage` 法術（紫紅）、`ninja` 速攻（紫）、`special` 特殊（黃）；`ROLE_INFO` 為各定位的標籤與圖示。`Codex.jsx` 用 `catKeyByName` 反查 key 後取定位。**新增貓咪時要在 `CAT_ROLES` 補一行**，`catRoles.test.js` 會檢查 `cats.js` 每一隻都有定位、名稱都能反查到 key。
  - **章節環境**（UI-007，設計文件 `docs/design/chapter-environment.md`）：
    - `envInfo.js`：各環境 / 階段的圖示與文字（`ENV_TYPES`、`ENV_PHASES`、`envWarningText()`），以及首次說明的已看紀錄 `hasSeenEnvTip()` / `markEnvTipSeen()`（localStorage `envTipsSeen`，陣列，玩家進度、不在 `PRESERVED_KEYS`）。
    - `EnvIndicator`：疊在戰場 Canvas 上方中央；顯示目前階段圖示＋剩餘秒數（依階段換底色），預告期間顯示閃爍橫幅（夜晚／漲潮紅色、退潮綠色，含方向箭頭）。自己每 100ms 讀 `world.env`，不經過戰鬥主迴圈；`Battle.jsx` 只在 JSX 放 `<EnvIndicator getEnv={() => worldRef.current?.env ?? null} />`。
    - 關卡選擇：關卡格只綁 `onClick`（滑鼠、觸控、鍵盤 Enter／空白鍵都只觸發一次），未解鎖的關卡點了沒反應也沒聲音（`aria-disabled`，仍可被 Tab 聚焦以便讀出「未解鎖」）；每格有 `aria-label`（例如「第 4 關（晝夜）（未解鎖）」）。有環境的關卡左下角顯示 🌗／🌊，下方說明列出本章環境；點到**首次遇到**的環境類型時，先跳說明視窗，按「知道了，開始戰鬥」才記錄並進入戰鬥（按返回則不記錄）。
    - 章節選擇：卡片下方顯示「戰場規則」說明（讀 `stages.js` 的 `CHAPTER_ENV`）。`Codex.jsx` 的 `typeMap` 名稱對不上的問題仍在。
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

**新增貓咪時**，除了 `cats.js`，還要請 UI 在 `src/ui/catRoles.js` 的 `CAT_ROLES` 補定位（否則 `catRoles.test.js` 會失敗）、在 `public/pic` 補角色圖（見 §2 `catArt.js`）。

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
- `world.env`：章節環境狀態，由 `createEnv(cfg.env)` 建立；無環境的關卡為 `null`（見 §4.6）。
- `units` 陣列中 `team: 1` 是貓，`team: -1` 是敵人。
- 單位由 `ai.js` 的 `makeUnit(team, x, y, tpl, key)` 建立，主要欄位：`id`、`key`、`team`、`x`/`y`、`hp`/`maxHp`、`speed`/`baseSpeed`、`atk`/`baseAtk`、`range`、`atkRate`/`atkCd`、`color`、`name`、`bounty`、`aoe*`/`maxTargets`、`abilities`、`effects`、`shieldHp`/`shieldCd`、`revived`、`atkSeq`。
- **`unit.atkSeq`**（EG-009，給 UI 攻擊動畫**唯讀**的介面合約）：出手次數，初始 0、只增不減。`stepUnits` 中單位每次真的出手（打到單位、打主堡、AOE 有命中）+1；冷卻中、AOE 範圍內沒打到任何東西（冷卻沒重設）時不變。UI 以「這一幀比上一幀大」判斷剛出手，不要再從 `atkCd` 的變化推算。
- **`unit.key`**（EG-002）：模板 key。貓 = cats key（`'white'`、`'ninja'`…，來自 `spawnCat(key)`）；敵人 = `ENEMIES` key；BOSS = `BOSSES` key。找不到 key 而退回預設時，`key` 也跟著是退回後的 `'dog'` / `'boarKing'`，與實際外觀數值一致。可供 `draw.js` 選角色圖。

### 4.2 主迴圈 — `Battle.jsx` `loop()`
每幀（dt 上限 0.05s × 倍速 1x/2x）：
1. 時間、魚收入、大砲 CD、各貓召喚 CD 遞減
2. `spawnBossIfNeeded`（依 `boss.time` 與 `boss.hp` 條件）
3. 依關卡 `schedule` 生怪（見 §5）：`ai.js` 的 `stepSchedule(world, spawn)`（EG-004 從 `Battle.jsx` 移出）。先用 `while` 依 `nextEnemyIdx` 處理單次 `time` 條目（遇到 `hp` 條件未達會停在這筆），再用 `for` 處理所有條目的時間 / 週期 / `hp` 條件；每筆以 `_spawned` / `_next` 記錄，**單次條目最多生成一次**（`while` 會跳過已被 `for` 生成的條目）。實際生成呼叫 `spawnEnemy(world, getCanvasHeight, onEnemySeen, key, statMultiplier)`：只乘 `multiplier%`，不套用難度成長。**所有關卡都必須有非空 `schedule`**（`ai.test.js` 檢查）；舊的固定頻率生怪路徑與 `firstDelay`/`spawnRate`/`pool`/`sequence`/`maxEnemies`/`difficulty` 已於 EG-008 移除，場上敵人數量沒有上限。
3.5 `stepEnv(w, dt)` 推進章節環境（含潮汐推力），再用 `pollEnvCues(w)` 取得本幀的音效提示，呼叫 `audio.playEnvCue?.(kind)`（見 §4.6）
4. `stepUnits`：能力處理 → 找最近敵人 → 攻擊 → 移動 → 清屍、計算擊殺賞金（加到**魚**）
5. 勝負判定：敵堡 HP≤0 勝 / 我堡 HP≤0 敗。勝利當下立即發金幣、解鎖下一關（`awardWin(w)`），之後停在結算視窗，不再自動回大廳（EG-012）
6. HUD 每 0.12s 同步到 React state，Canvas 每幀重畫

**操作**：1~5 召喚、Space 貓咪砲、X 切 1x/2x、P 暫停、R 重開。進場與重開後都是 `prestart`，300ms 後自動開始（`scheduleAutoStart`，EG-012；開始前按召喚會直接開打）。切到背景分頁（`visibilitychange`）時自動暫停。
**狀態流程**：`prestart` →（自動 / 召喚 / 任意鍵）`running` ⇄ `paused` → `win` / `lose`（結算視窗）。`ready` 目前流程不會用到（`createWorld` 的預設值，保留）。
**props**：`Battle` 收 `setCoins`、`setHighestUnlocked`、`onNextStage`、`setScene` 等；`ensureWorld()` 只動 ref，不在 render 期間 setState。
**我方上限**：場上貓 > 70 隻不能再召喚。

### 4.3 戰鬥規則（`ai.js` `stepUnits`）
- 目標 = X 距離最近的存活敵方單位。
- 目標在射程內（且 ≥ `aoeMinRadius`）或敵堡在射程內就攻擊。
- 非 AOE：打目標，否則打主堡。AOE：對半徑內所有敵人（最多 `maxTargets`），名額有剩且主堡在範圍內也打主堡。
- 移動：與目標距離 ≤ `range*0.98` 停下；貼太近（< BODY_W*0.9）停下；抵達敵堡前 18px 停下。
- **貓咪砲**（`Battle.jsx` `fireCannon` → `ai.js` `applyCannon(world, dmg, knock)`）：對所有存活敵人造成 `60 + (cannonLv-1)*10` 傷害並往右推 60px，CD 20 秒。套用能力系統（EG-006）：
  - **閃避**：擲中 `dodge.chance` → 這發完全無效（不扣血、不推）。
  - **護盾**：`shieldHp` 先吸收，吸不完的才扣 HP。**被護盾完全擋下（實際扣血 0）→ 不推開**；有扣到 HP 才推（EG-007，與一般攻擊 `knockback` 同為 `dealt > 0` 才觸發）。
  - **擊退免疫**：照常受傷，不被推。
  - 推開限制在主堡邊界 `[68, 50+towerDistance-18]`（`pushWithinBounds`，與一般移動、潮汐相同）；原本就在邊界外的不會被拉回。
  - 死亡、復活、擊殺賞金照舊由下一幀 `stepUnits` 的清屍流程處理。
- **傷害共用規則**（`ai.js` 匯出）：`rollDodge(target)`（閃避判定）、`absorbDamage(target, dmg)`（護盾吸收 → 扣 HP，回傳實際扣血量）。`stepUnits` 的一般攻擊與貓咪砲共用；**改傷害規則時改這兩個函式即可**。一般攻擊的擊退（`knockback` 能力）目前仍是直接 `x +=`，沒有邊界限制（維持原行為）。
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
- `drawUnit(ctx, u, t)`：貓畫角色圖（無圖退回色塊 + 耳朵）、敵人畫色塊；血條；貓顯示名字，敵人一律顯示「敵」。`t` = `world.time`。
- **章節環境畫面**（UI-007，只讀 `world.env`）：`envState` 用 `WeakMap`（key = world）存平滑過場值，以 `world.time` 推進（暫停停、2x 加速）。晝夜：白天右上太陽；夜晚整體罩深藍、星星閃爍、月牙，預告期間天色先微暗，切換約 1 秒漸變。潮汐：地面上一層水（平靜淺、潮水期間升高約 26px），浪花線與「‹‹ / ››」箭頭順著流向移動；預告期間水位微升並朝下一波方向流動。太陽畫在主堡/單位之前，夜色、星月、潮水畫在單位之後。
- **我方貓咪動畫**（UI-006）：`draw.js` 用 `WeakMap` 另存每隻貓的動畫狀態，**只讀** unit，不改戰鬥資料。每幀比對上一幀推算：`x` 往前增加 → 走路（依移動距離推進步伐：彈跳、搖擺、落地壓扁）；`atkSeq` 變大（引擎每次出手 +1，EG-009）→ 剛出手（0.3 秒：蓄力後縮→前撲放大＋揮擊弧線）；`hp` 變少 → 受擊（閃紅＋後震）；都沒有 → 待機呼吸。時間用 `world.time`，暫停會停、2x 會加速。名字與血條不跟著動。敵人沒有動畫。
- 畫布寬度 = max(towerDistance+100, 高×1.9)，支援 DPR（上限 2）。

### 4.6 章節環境引擎 — `src/game/environment.js`（EG-003）
設計與介面合約見 [design/chapter-environment.md](design/chapter-environment.md)。參數一律讀 `world.cfg.env`（`stageConfig().env`，由關卡角色提供）；`world.env` 只放狀態，結構照設計文件 §4.2，給 UI / 音效**唯讀**。
- `createEnv(envCfg)`：`null` / `false` / 未知 `type` → `null`。晝夜從 `startPhase`（預設 `day`）開始，潮汐從 `calm` 開始。
- `stepEnv(world, dt)`：`dt ≤ 0`（暫停）不做事。依 `dt` 推進 `phaseLeft`，歸零就切換階段、`events += 1`；一幀跨越多個階段會逐段計算。每幀重算 `phaseProgress` 與 `warning`。
  - 晝夜：`day`(dayLength) ⇄ `night`(nightLength)；夜晚前 `warnTime` 秒 `warning = { next: 'night', in }`，天亮前不預告。
  - 潮汐：`calm`(calmLength) → `flood`(surgeLength) → `calm` → `ebb` → …；下一波方向由 `events` 推算（平靜時已發生的潮水數為偶數 → `flood`）。潮水前 `warnTime` 秒預告。
  - 潮汐推力：只算本幀落在潮水期間的時間，`flood` 往左、`ebb` 往右，速度 `pushSpeed` px/秒；套用在所有存活且非 `knockbackImmune` 的單位（凍結中也會被推）。邊界同一般移動：`[50+18, 50+towerDistance-18]`，只阻止「被推過」邊界，原本就在邊界外（例如被大砲擊退）的單位不會被拉回。
- `getEnvModifiers(world)` → `{ enemyAtkMul, enemySpeedMul, bountyMul }`；只有晝夜的 `night` 階段有值，其餘全為 1。`stepUnits` 在計算完 slow（速度）與 berserk（攻擊）之後，對**敵人**再乘上倍率；擊殺賞金 `Math.round(killBounty × bountyMul)`。我方不受影響。
- `pollEnvCues(world)`（設計文件以外的輔助函式）：回傳本幀新出現的音效提示 `kind` 陣列（`nightWarn` / `dayStart` / `floodWarn` / `ebbWarn`），每次預告、每次天亮各一次；進度記在 `world.envCueSeen`（不放進 `world.env`）。
- 不影響 `atkCd` 的寫法（§11 #17）；`world.env === null` 時所有倍率為 1，行為與加入環境前完全相同。
- 測試：`src/game/environment.test.js`（vitest）。

---

> 🌗🌊 **章節環境機制（已實作，完成首輪平衡）**（第一章晝夜、第二章潮汐），設計見 [design/chapter-environment.md](design/chapter-environment.md)，任務 LV-002、EG-003、UI-007、AU-005、EC-001。

## 5. 關卡 — `spawns.js` / `spawns2.js` / `stages.js`

- **章節**：1 = 世界篇（`SPAWNS`，20 關）、2 = 未來篇（`SPAWNS2`，20 關，海洋主題敵人）。對應表在 `stages.js` 的 `SPAWNS_MAP`。
- `getMaxStage(chapter)` = 該章最大關卡編號。
- `stageConfig(stage, chapter)` 回傳：`enemyBaseHp`(預設1000)、`towerDistance`(預設750)、`schedule`（深拷貝、依 time 排序）、`isBoss/bossKey/bossAt/bossHp/bossMultiplier`、`rewardCoins`、`env`（章節環境，見下方）。

### 關卡資料格式
```js
5: {
  enemyBaseHp: 1000,        // 敵堡 HP
  towerDistance: 800,       // 兩堡距離(px)
  reward: 250,              // 勝利金幣
  env: { nightLength: 35 }, // 可選；章節環境（省略=章節預設、false=不啟用、物件=部分覆寫）
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
- 可選 `count`：週期出怪的總次數上限（有 `interval` 時預設無限，否則為 1；實作在 `ai.js` 的 `stepSchedule`（EG-004））。
- 檢查方式：用 Node 匯入 `SPAWNS`/`SPAWNS2`/`ENEMIES`/`BOSSES`，確認每個 `schedule[].type` 與 `boss.key` 都存在於 `ENEMIES` 或 `BOSSES`（2026-09-27 檢查 246 筆，全部合法）。
- 排程出的敵人**不套用**難度成長；BOSS（`boss` 欄位）**會套用** `computeScale`：每關 +8%、每秒 +0.4%（上限 180 秒）。「每已出怪 +1.5%（上限 +45%）」**已停用**、以註解保留在 `computeScale`（EG-010；排程出怪從不累加 `world.totalSpawns`，這一項從未生效，註解內有啟用方法）。
- 關卡解鎖：勝利後 `highestUnlocked[章] = min(最大關, max(原值, 本關+1))`。已通關的關卡可重複刷獎勵。
- 關卡選擇畫面依 `stageConfig(n, chapter).isBoss` 標 ⭐（UI-002）；`App` 會傳 `chapter` 給 `LevelSelect`。

### 章節環境機制（LV-002，設計見 `docs/design/chapter-environment.md`）
- `stages.js` 匯出 `CHAPTER_ENV`：第 1 章 `dayNight`（晝夜）、第 2 章 `tide`（潮汐）的預設參數。
- `stageConfig().env` = `{ ...CHAPTER_ENV[章], ...關卡 env }`（每次回傳新物件，改它不會影響預設）；關卡 `env: false` 或該章沒有預設時為 `null`。
- 目前逐關設定：

| 關卡 | env |
|---|---|
| 1-1 ~ 1-3 | `false`（新手教學） |
| 1-4 | `dayLength: 70`（LV-003：第一次夜晚延後，避開開場最重的一波） |
| 1-5 ~ 1-14、1-16 ~ 1-18 | 章節預設（白天 45 / 夜晚 25；夜晚敵人攻擊 ×1.15、速度 ×1.1、賞金 ×1.75） |
| 1-15（星眼巨像） | `nightLength: 30` |
| 1-19（野豬王） | `nightLength: 35` |
| 1-20（機甲巨像，章末） | `dayLength: 40, nightLength: 35` |
| 2-1 | `false`（新手教學） |
| 2-2 ~ 2-14、2-16、2-18、2-19 | 章節預設（平靜 24 / 潮水 6 / 推力 32） |
| 2-15、2-17（兩堡距離 350） | `pushSpeed: 20` |
| 2-20（幽靈鯊，章末） | `calmLength: 20` |

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

- `AudioManager` 單例（Web Audio API）。節點：`musicFade`（淡入淡出用）→ `music` 分類 gain → `master`；`summon` / `ui` / `result` / `env` 分類 gain → `master`。淡入淡出只動 `musicFade`，不會改到使用者設定的音量。
- **音量分類**（AU-002）：`master` 總音量、`music` 背景音樂、`summon` 召喚音效、`ui` 按鈕音效、`result` 勝敗音效、`env` 環境提示音（AU-005）。
  - 由音訊模組自己存到 localStorage `audioVolumes`（`{ master, music, summon, ui, result, env }`，0~1；預設 master 1、其他 0.8；舊存檔缺少的分類自動補預設值）。沒有 `audioVolumes` 時會把舊 key `volume` 轉成 `master`（舊 key 不刪）。
  - 對外 API：`audio.getVolumes()`、`audio.setVolume(category, value)`（立即生效並存檔；AudioContext 尚未建立也可呼叫，建立時套用）、`audio.playClick()`（按鈕音效，60ms 冷卻）。舊的 `setMasterVolume` / `setMusicVolume` / `setSfxVolume` 保留為相容用（轉呼叫 `setVolume`）。
  - 音效 → 分類：`sfx_summon`→summon、`sfx_click`→ui、`sfx_win`/`sfx_lose`→result、`env_*`→env；其他 key 預設 summon，可用 `audio.register(key, url, { category })` 指定。
- 註冊的 key：`bgm_lobby`、`bgm_battle`、`sfx_summon`、`sfx_win`、`sfx_lose`（路徑經 `import.meta.env.BASE_URL` 處理），在 `useAudio.js` 模組載入時註冊。
- **音檔格式**（AU-006）：五個檔都是真正的 MP3（原本是 DASH 分段 MP4 與 Ogg Opus，副檔名不符、舊 iOS 無法解碼 Opus）。背景音樂 96 kbps、音效 128 kbps；大廳音樂 3.1 MB、戰鬥音樂 1.1 MB。背景音樂整首 `decodeAudioData` 解碼後放在記憶體（大廳約 90 MB、戰鬥約 33 MB），見 §11 #24。`sfx_click` 不是音檔，是振盪器即時合成（三角波 1100→650Hz、約 70ms）。
- **預載**：`resume()` 第一次建立 AudioContext 後，依註冊順序在背景下載＋解碼所有音檔（載入失敗會還原成 URL，下次可重試）。
- `playMusic`（硬切；**同一首正在播就不重播**，只取消進行中的淡出；`{ restart: true }` 可強制重播）、`crossfadeMusic`（淡入淡出）、`fadeOutMusic`（淡出後停止；之後若有新的播放請求，停止動作會被取消）、`playSfx`（預設 80ms 冷卻）。播放 / 淡出都走 token 機制，「最後一次請求」生效，避免競態。所有公開方法失敗只 `console.warn`，不支援 Web Audio 的環境（測試）不會報錯。
- 瀏覽器需使用者互動才能播放：App 在第一次 pointerdown/keydown/touchstart 時 `audio.resume()`；在那之前的播放請求會等到解鎖後才開始。
- **章節環境提示音**（AU-005，設計文件 `docs/design/chapter-environment.md` §4.4）：`audio.playEnvCue(kind)`，`kind` ∈ `ENV_CUES`＝`nightWarn` / `dayStart` / `floodWarn` / `ebbWarn`（其他值直接忽略）。全部即時合成、走 `env` 分類、同一種 1.5 秒冷卻（內部 key 為 `env_<kind>`，經 `playSfx`）。
  - `nightWarn`：低沉鐘聲（G2 基音＋不和諧泛音），敲兩下，約 2.7 秒。
  - `dayStart`：三角波上行琶音 C5-E5-G5-C6，約 0.5 秒。
  - `floodWarn`：帶通雜訊浪聲，濾波頻率由高往低、聲像由右往左（潮水往我方推），加低沉下滑音，約 1.5 秒。
  - `ebbWarn`：同上但頻率由低往高、聲像由左往右，加輕的上滑音。
  - 由戰鬥引擎在 `Battle.jsx` 以 `audio.playEnvCue?.(kind)` 呼叫。
- 開發模式（`npm run dev`）下單例會掛在 `window.audio`，可在瀏覽器 console 試聽，例如 `audio.playEnvCue('nightWarn')`（需先點過頁面解鎖音訊）。正式建置不會掛。
- 播放時機：Lobby / ChapterSelect / LevelSelect → bgm_lobby（同一首不重播）；Battle 進場 → bgm_battle、離場 → bgm_lobby；召喚 → sfx_summon；勝/敗 → 淡出 + sfx。

---

## 9. 圖鑑 — `scenes/Codex.jsx`
- 我方：`codexCats`（購買、轉蛋、編成時加入）；敵方：`codexEnemies`（戰鬥中遇到時加入）。存的是中文名。
- `typeMap` 用名稱對應卡片類型，但裡面寫的是「忍者貓/法師貓」等，與實際名稱「忍者喵/法師喵」不符。

---

## 10. 建置、測試、部署
- `npm run build` 可正常建置、沒有警告（2026-11-02 確認）。產出：遊戲程式 `index-*.js`（約 30 KB gzip）＋ `react-*.js`（約 45 KB gzip，獨立 chunk，遊戲更新時檔名不變、可沿用快取，EG-013）。
- `npm test`（vitest）：6 個測試檔、47 項（2026-11-02）：`ai.test.js`、`environment.test.js`、`catRoles.test.js`、`App.test.jsx`、`scenes/Battle.test.jsx`（戰鬥流程：自動開始、重開、背景暫停、結算視窗；假 Canvas＋假計時器）、`utils/storage.test.js`。
- 部署：`.github/workflows/deploy-pages.yml`，push `main` → `npm ci` → **`npm test`（失敗就不部署）** → `npm run build` → GitHub Pages（EG-013）。另有 `npm run deploy:local`（gh-pages 分支方式，備用）。
- 首次載入（大廳 → 進一場戰鬥，含音檔）：改版前 8.27 MB／71 個請求 → 2026-11-02 約 5.56 MB／50 個請求（其中音檔 4.35 MB）。

---

## 11. 已知問題 / 技術債（由 CEO 維護；其他角色發現問題請用跨角色請求回報 CEO）

| # | 領域 | 問題 | 位置 | 任務 |
|---|---|---|---|---|
| 1 | 關卡 | ~~第二章第 9 關 `type: '小丑魚'` 用了中文名，找不到 key → 變成 **小狗 ×1000%**~~ ✅ 已修（2026-09-27） | `spawns2.js` 第 9 關 | LV-001 |
| 2 | 經濟 | 轉蛋池 `GACHA_CHARACTERS` 為空，轉蛋功能實際無作用（UI-014 起畫面顯示「轉蛋準備中」並停用按鈕） | `gachaPool.js` | CEO-001 |
| 3 | 友軍 | ~~新增商店貓需手動改 `buildCatsTpl`，容易漏~~ ✅ 已修（2026-09-27） | `world.js` | AL-001 |
| 4 | 專案 | `node_modules/`（約 4,000 檔）被 commit 進 git，雖然 `.gitignore` 有寫 | repo | CEO-002 |
| 5 | 美術 | ~~`public/pic/*.png`（16 張，約 12MB）與 `public/audio/廢棄.mp3`（4.9MB）未被使用，但會被部署~~ ✅ 已處理（AU-001 刪除、UI-004 啟用並壓縮） | `public/` | CEO-003 |
| 6 | UI | ~~圖鑑 `Codex.jsx` 的 `typeMap` 名稱對不上（寫「忍者貓」等，實際是「忍者喵」）；`UnitCard` 樣式與假數值已於 CEO-004 修正~~ ✅ 已修（2026-09-28） | `Codex.jsx` | UI-011 |
| 7 | UI | ~~戰鬥 HUD 的「研究力」按鈕其實是戰鬥內收入升級，與大廳升級的「研究力」名稱衝突~~ ✅ 已修（2026-09-27） | `HudInfo.jsx` | UI-001 |
| 8 | 引擎 | ~~`world.js`/`ai.js` 有未使用的舊生怪路徑（`firstDelay`、`spawnRate`、`pool`、`sequence`、`maxEnemies`、`difficulty` 皆未定義），`maxEnemies` 未定義 → 敵人數量無上限~~ ✅ 已修（2026-09-28） | `ai.js`、`world.js` | EG-008 |
| 9 | 引擎 | ~~貓咪砲無視護盾/閃避/擊退免疫~~ ✅ 已修（2026-09-28） | `Battle.jsx` `fireCannon` | EG-006 |
| 10 | 關卡 | ~~`spawns.js` 註解說 multiplier 是「數量倍率」，實際是能力值倍率~~ ✅ 已修（2026-09-27） | `spawns.js` | LV-001 |
| 11 | 敵人 | `metal` 金屬怪已定義但沒有任何關卡使用 | `enemies.js` | — |
| 12 | 測試 | ~~本機 node_modules 缺 vitest，`npm test` 失敗；測試覆蓋率極低~~ ✅ `npm ci` 後 `npm test` 可通過；2026-11-02 起 47 項、部署前會先跑測試（EG-013）；UI 畫面仍幾乎沒有測試 | — | — |
| 13 | UI | ~~關卡選擇的 BOSS ⭐ 用 `n%10` 寫死，未讀取關卡 `boss` 設定（1-15、1-19 也有 BOSS 卻沒標）~~ ✅ 已修（2026-09-27） | `LevelSelect.jsx` | UI-002 |
| 14 | UI | ~~設定按鈕（App.jsx）與召喚欄（Battle.jsx）用 CSS 選擇器 / `!important` 硬蓋樣式，屬權宜作法~~ ✅ 已修（UI-003） | `styles.css` | UI-003 |
| 15 | UI | ~~App 右上「設定」按鈕與關卡格（`.stage-btn`）是原生 `<button>`，沒有點擊音效~~ ✅ 已修（2026-09-28） | `App.jsx`、`LevelSelect.jsx` | UI-009 |
| 16 | 音效 | ~~「清除存檔」會清掉 localStorage 的 `audioVolumes`，但記憶體中的音量保留，直到下次調整才重寫；主題 `theme` 也有同樣問題~~ ✅ 已修（AU-004：清除存檔保留音量與主題） | `App.jsx` `handleReset` | AU-004 |
| 17 | 引擎/UI | ~~貓咪攻擊動畫靠「`atkCd` 被重設變大」推算出手時機（UI-006）；引擎若修改攻擊冷卻的寫法，動畫會失效，改動前須通知 UI~~ ✅ 已修（2026-09-28，動畫改讀引擎的 `atkSeq`） | `ai.js`、`draw.js` | EG-009、UI-010 |
| 19 | UI | ~~手機上戰場畫布比外框寬，被裁掉右側，看不到敵堡與來襲的敵人~~ ✅ 已修（2026-11-02，等比例縮小） | `Battle.jsx` `forceResize` | UI-014 |
| 20 | 引擎 | ~~按「重開」後狀態停在 `ready`、召喚鈕停用、不會自動開始，觸控裝置無法開打~~ ✅ 已修（2026-11-02） | `Battle.jsx` | EG-012 |
| 21 | 引擎 | ~~開發模式（StrictMode）打贏拿不到金幣、卡在勝利畫面（`abortedRef` 沒復原）~~ ✅ 已修（2026-11-02） | `Battle.jsx` | EG-012 |
| 22 | 引擎 | ~~`localStorage` 資料損毀時 `JSON.parse` 讓畫面白屏；舊存檔缺第 2 章 key 時第 2 章全部解鎖~~ ✅ 已修（2026-11-02） | `App.jsx` | EG-012 |
| 23 | 音效 | ~~音檔副檔名是 .mp3 但實際是 MP4 / Ogg Opus（舊 iOS 無法播放勝敗音效）~~ ✅ 已修（2026-11-02） | `public/audio` | AU-006 |
| 24 | 音效 | 背景音樂整首解碼放記憶體（大廳約 90 MB），且要整首下載完才開始播；可改 `<audio>` 串流接 GainNode，但需真機（iPhone）測試 | `src/audio/index.js` | — |
| 18 | 經濟/關卡 | ~~第一章難度在 1-7 出現斷層：勝率 ≥50% 所需預算從 1-6 的約 1800 跳到約 4000（首通累積預算的 ×3），玩家約需重刷 1-6 九次（EC-002 模擬）~~ ➖ 不處理：使用者 2026-09-28 實際試玩後認為難度可接受 | `spawns.js` 1-7、各關 `reward` | — |
