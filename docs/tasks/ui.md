# UI / 美術 — 任務檔

> 格式與規則見 [README.md](README.md)。

## 任務列表

## [UI-001] 戰鬥 HUD「研究力」按鈕改名
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-27）
- 依賴：無

**需求**
`src/ui/HudInfo.jsx` 的按鈕文字「研究力 +x（y 魚）」其實是**戰鬥內的收入升級**，與大廳「升級」畫面的「研究力」（永久等級）名稱衝突，玩家會混淆。請改成「收入升級 +x/秒（y 魚）」或同等清楚的文字。只改顯示文字，不改邏輯。

**完成條件**
- `npm run build` 成功，戰鬥畫面文字正確。

### 回報（負責角色填寫）
- 修改檔案：`src/ui/HudInfo.jsx`
- 做了什麼：按鈕文字由「研究力 +x（y 魚）」改為「收入升級 +x/秒（y 魚）」，僅改顯示文字，邏輯未動。
- 如何驗證：`npm run build` 成功。
- 新增給其他角色的請求：無

### 審核（CEO 填寫）
- 2026-09-27 通過。只改顯示文字，build 成功。


## [UI-002] 關卡選擇的 BOSS ⭐ 改為讀取關卡設定
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-27）
- 依賴：建議在 LV-001 之後

**需求**
`src/scenes/LevelSelect.jsx` 用 `n % 10 === 0` 寫死 BOSS 標記，但實際有 BOSS 的關卡是由關卡資料的 `boss` 欄位決定（例如 1-15、1-19 也有 BOSS 卻沒標）。請改用 `stageConfig(n, chapter).isBoss` 判斷（`src/data/stages.js` 已匯出，唯讀使用，不要修改該檔）。

**授權的跨檔修改**：`LevelSelect` 需要知道目前章節，CEO 授權你在 `src/App.jsx` 的 `level:` 場景中，**只**新增傳給 `<LevelSelect>` 的 `chapter={currentChapter}` prop，App.jsx 其他地方不得更動。

**完成條件**
- 第一章 10、15、19、20 關與第二章 10、20 關顯示 ⭐，其他關不顯示。
- 下方說明文字「每 10 關為 BOSS 關」改成正確描述。
- `npm run build` 成功。

### 回報（負責角色填寫）
- 修改檔案：`src/scenes/LevelSelect.jsx`、`src/App.jsx`（僅在 `level:` 場景的 `<LevelSelect>` 新增 `chapter={currentChapter}` 一行，依授權）
- 做了什麼：LevelSelect 新增 `chapter` prop（預設 1），以 `stageConfig(n, chapter).isBoss` 決定 `.boss` class 與 ⭐；說明文字改為「⭐ 標記的關卡會出現 BOSS」。`stages.js` 唯讀使用，未修改。
- 如何驗證：`npm run build` 成功；以 node 直接呼叫 `stageConfig` 列出 BOSS 關：第一章 10,15,19,20、第二章 10,20，符合完成條件。
- 新增給其他角色的請求：無。（提醒 CEO：`PROJECT_MAP.md` §5「每 10 關標 ⭐（寫死）」與 §11 #13 可更新為已修正。）

### 審核（CEO 填寫）
- 2026-09-27 通過。App.jsx 只多一行 `chapter={currentChapter}`，符合授權；CEO 另行以 stageConfig 驗證 BOSS 關為 1: 10,15,19,20／2: 10,20；build 成功。PROJECT_MAP §5、§11 #13 已由 CEO 更新。

## [UI-003] 移除「設定」按鈕與戰鬥召喚欄的 CSS 權宜覆寫
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-27，源自 CEO-004 回報）
- 依賴：無

**需求**
CEO-004 為了不動 `App.jsx`、`Battle.jsx`，在 `src/styles.css` 用選擇器硬蓋了兩處樣式：
(a) `.game-background > button[aria-label="開啟設定"]` 覆寫 App 設定按鈕的 `bg-white/80` 等 class；
(b) `.slot-tray [role="listitem"]` + `!important` 覆寫 Battle 召喚欄單格的 `bg-white`。
請改成正規作法：把兩處的 className 換成 UI 的共用 class，再刪掉 `styles.css` 中對應的覆寫規則。

**授權的跨檔修改**（僅限以下範圍，其他地方不得更動）：
- `src/App.jsx`：只改「開啟設定」那個 `<button>` 的 `className`（`aria-label`、`onClick` 不能動）。
- `src/scenes/Battle.jsx`：只改 `BattleControls` 內召喚欄單格 `<div role="listitem">` 的 `className` 與 `style`；召喚、冷卻、按鈕等邏輯一律不動。

**完成條件**
- 四種主題下，設定按鈕與召喚欄外觀與目前一致（或更好）。
- `styles.css` 不再有上述兩組覆寫、召喚欄不再需要 `!important`。
- `npm run build` 成功。

### 回報（負責角色填寫）
- 修改檔案：`src/styles.css`、`src/App.jsx`（僅「開啟設定」按鈕的 `className`）、`src/scenes/Battle.jsx`（僅召喚欄單格 `<div role="listitem">` 的 `className` 與 `style`）
- 做了什麼：
  - (a) 設定按鈕：`className` 改為 `ui-btn ui-corner-btn absolute right-4 top-4 z-20`（`aria-label`、`onClick`、子元素未動）。`styles.css` 新增共用 class `.ui-corner-btn`（角落浮動小按鈕，含 ⚙ 圖示與 `position: absolute`，因 `.ui-btn` 預設是 relative），刪除三條 `button[aria-label="開啟設定"]` 覆寫規則；`.game-background > …` 的 relative 規則改為同時排除 `.ui-corner-btn`。
  - (b) 召喚欄：單格 `className` 改為 `slot-card`，移除 `style`（原本的 `borderColor: SKIN.color.line`、`minHeight: 92` 移到 CSS）。`styles.css` 新增 `.slot-card`（主題背景、邊框、圓角、min-height 92px、hover 放大），刪除 `.slot-tray [role="listitem"]` 與其 `!important`。
- 如何驗證：`npm run build` 成功；dev server 進戰鬥畫面，依序切換 4 種主題並等轉場結束後讀取計算後樣式：設定按鈕與召喚欄的背景、文字、邊框都跟著主題變化，設定按鈕為 `position: absolute`、位置在右上角；點設定按鈕能正常開啟視窗（`position: fixed`），Esc 可關閉。`styles.css` 已無 `開啟設定` 選擇器，剩下的 `!important` 只在 `prefers-reduced-motion` 區塊。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - commit 範圍：`src/styles.css`、`src/App.jsx`、`src/scenes/Battle.jsx`、`docs/tasks/ui.md`、`docs/CHANGELOG.md`。
  - `Battle.jsx` 第 9 行 `import { SKIN } from '../data/skin.js';` 現在沒有被使用了。授權範圍只有該 div 的 className/style，所以我沒有刪；會不會報錯要看 lint 設定（build 不受影響）。要清掉的話請授權 UI 或交給引擎角色。
  - 外觀與 CEO-004 版本相同，只是改成正規 class，沒有視覺變更，也不需要更新 PROJECT_MAP。

### 審核（CEO 填寫）
- 2026-09-27 通過。App.jsx 只改設定按鈕 className、Battle.jsx 只改召喚欄單格 className/style，完全在授權範圍內；兩組覆寫與 `!important` 已移除；build 成功。
- 回報提到的 `Battle.jsx` 未使用 `SKIN` import：已派工給戰鬥引擎（EG-001）。

## [UI-004] 使用 public/pic 角色圖顯示貓咪
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-27，使用者決定：角色圖交給 UI）
- 依賴：戰場 Canvas 部分依賴 EG-002（unit.key）；其他畫面可先做

**需求**
`public/pic/` 有 16 張貓咪 PNG（透明背景、約 900×900、每張 0.3~1.1MB，共約 12MB），檔名就是貓的 key：white, tank, archer, giant, bird, fish, lizard, ninja, knight, mage, samurai, sumo, viking, cow, void, azurePhantom。`jaycat`、`jay` **沒有圖**。

1. **先壓縮**：縮成適合遊戲的尺寸（建議最長邊 256px），格式 WebP 或 PNG 皆可，目標總量 < 1.5MB。原始大圖不要留在 `public/`（會被部署）；如果想保留原檔，放到 repo 外或寫進回報讓 CEO 決定。
2. **顯示位置**：
   - 戰場 Canvas（`draw.js`）：貓咪用圖片取代色塊，保留血條與名字；圖片預先載入，未載入完成或沒有圖時退回原本的色塊畫法。需要 `unit.key`（EG-002）。
   - 隊伍編成、升級、商店、戰鬥召喚欄：卡片 / 按鈕上加頭像。
   - 圖鑑：我方單位卡加頭像（圖鑑存的是中文名，可唯讀使用 `cats.js` 由名稱反查 key）。
3. 圖片路徑要加 `import.meta.env.BASE_URL`（線上是 `/battleCat/` 子路徑）。
4. 沒有圖的貓（jaycat、jay）要有得體的替代顯示，不能出現破圖。

**限制**：`cats.js` / `world.js` 等資料只可唯讀使用。不需要改 `App.jsx`、`Battle.jsx` 的邏輯；若召喚欄加頭像需要改 `Battle.jsx` 的 JSX，只限 `BattleControls` 內召喚欄單格的內容（授權），召喚邏輯不動。

**完成條件**
- 上述畫面都顯示頭像，四種主題下都好看；戰場貓咪顯示為圖片。
- `public/pic` 總大小符合目標；`npm run build` 成功。
- 更新 `docs/PROJECT_MAP.md` §2；驗證完關閉 dev server 與瀏覽器。

### 回報（負責角色填寫）
- 修改檔案：
  - 新增：`public/pic/*.webp`（16 張）、`src/ui/catArt.js`、`src/ui/CatAvatar.jsx`
  - 修改：`src/game/draw.js`、`src/styles.css`、`src/ui/UnitCard.jsx`、`src/scenes/Lineup.jsx`、`src/scenes/Upgrade.jsx`、`src/scenes/Shop.jsx`、`src/scenes/Codex.jsx`、`src/scenes/Battle.jsx`（授權範圍：召喚欄單格內容＋新增一行 `import CatAvatar`）、`docs/PROJECT_MAP.md` §2、`docs/CHANGELOG.md`
- 做了什麼：
  1. **壓縮**：16 張 PNG 用 Pillow 縮成最長邊 256px、WebP（quality 86），總量約 **270KB**（原 12MB）。原始 PNG 已**備份到 repo 外** `C:\Users\User\Desktop\BattleCats_pic_originals\`（16 張），git 歷史中也有。
  2. **戰場 Canvas**（`draw.js`）：模組載入時 `preloadCatArt()` 預載；`drawUnit` 對貓咪用 `getCatImage(u.key)` 畫圖（高 38px、腳底對齊原色塊底部），名字移到圖上方，血條不變；沒 key、沒圖、或未載入完成 → 原本色塊畫法。敵人不變。使用 EG-002 的 `unit.key`。
  3. **頭像**：新元件 `CatAvatar`，套用於隊伍編成（按鈕內頭像＋已選順序 #1~#5）、升級、商店、戰鬥召喚欄（改為直式：頭像＋快捷鍵編號、名稱、🐟 成本、「召喚 / 冷卻 Ns」按鈕）、圖鑑（`catKeyByName` 以中文名反查 key）。
  4. **jaycat / jay 沒有圖**：顯示名字首字「禁」的主題色漸層圓形徽章；圖片載入失敗（`onError`）也會退回這個樣式，不會破圖。
  5. 路徑一律 `import.meta.env.BASE_URL + 'pic/<key>.webp'`。
  6. 深色主題（modern/neon）頭像底改為亮色（`--avatar-bg`），因為角色圖是黑色線條。
- 如何驗證：`npm run build` 成功。dev server 上解鎖全部商店貓後檢查：隊伍編成、商店、圖鑑、戰鬥召喚欄都顯示頭像，jaycat/jay 顯示「禁」徽章；戰場召喚白喵後畫成角色圖。4 種主題逐一切換，以計算後樣式確認頭像底色與徽章配色正確，且所有 `<img>` 的 `naturalWidth > 0`（16 張都載入成功）。驗證完已關閉自己開的 dev server 與瀏覽器分頁。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - **原始 PNG 已刪除**：第一次刪除被權限擋下，之後**使用者在對話中明確同意**，已從工作目錄刪除 `public/pic/*.png`（16 張）。刪除前確認 repo 外備份 `C:\Users\User\Desktop\BattleCats_pic_originals\` 有 16 張。只刪了檔案、**沒有 `git rm` / 沒有動 index**，commit 時請一併 `git add -A public/pic`（會記錄 16 個 PNG 刪除＋16 個 WebP 新增）。目前 `public/pic` 約 300KB（磁碟佔用），符合 < 1.5MB。程式已不再引用任何 `.png`。
  - `Battle.jsx` 目前同時有 EG-002（引擎，`spawnCat` 那一行）與本任務（召喚欄單格、import）的改動，commit 時請留意。
  - 為了在召喚欄用 `CatAvatar`，`Battle.jsx` 開頭多了一行 `import CatAvatar`，這在「單格內容」授權之外但無法避免，請確認。
  - 召喚欄按鈕文字由「貓名（冷卻 Ns）」改為「召喚」/「冷卻 Ns」（貓名已顯示在上方）。
  - 驗證時為了看全部頭像，我在預覽瀏覽器（localhost:5173）的 localStorage 寫入測試存檔（全部商店貓解鎖、lineup 含 jay/void、圖鑑 5 隻）。只影響本機預覽用的瀏覽器，其他角色測試時看到的存檔可能是這份。
  - 驗證途中另一個對話的 dev server 被關掉，導致部分圖片暫時連線失敗；改開自己的伺服器重測後全部正常，非程式問題。
  - 工作目錄中 `src/scenes/Lobby.jsx`、`src/audio/*` 的改動是音效角色的，不屬於本任務。

### 審核（CEO 填寫）
- 2026-09-27 通過。Battle.jsx 多一行 `import CatAvatar` 雖在字面授權外，但為召喚欄頭像所必需，予以追認。public/pic 由 12MB 降到約 300KB；原始 PNG 備份於 repo 外 `C:\Users\User\Desktop\BattleCats_pic_originals\`（16 張，git 歷史也有）。


## [UI-005] 設定畫面：分類音量滑桿 + 按鈕音效
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-27，使用者需求）
- 依賴：**AU-002 完成後再做**（使用它提供的 API）

**需求**
1. `SettingsDialog.jsx`：把單一音量滑桿改成五條：主音量、背景音樂、召喚音效、按鈕音效、勝敗音效，對應 `audio.getVolumes()` / `audio.setVolume(category, value)`（category：`master` / `music` / `summon` / `ui` / `result`）。每條旁邊有試聽（音樂那條可省略）。
2. `Button.jsx`：點擊時呼叫 `audio.playClick()`（disabled 時不播）。
3. **授權的跨檔修改**：`src/App.jsx` 只可移除舊的單一音量邏輯——`volume` state、存 `volume` 的 useEffect、`setMasterVolume` 的 useEffect，以及傳給 `SettingsDialog` 的 `volume` / `setVolume` props。其他（包含主題、存檔、場景切換）一律不動。音量的保存改由音訊模組負責（AU-002）。

**完成條件**
- 五條滑桿都即時生效、重新整理後保留；按鈕有點擊音效。
- `npm run build` 成功；`npm test`（若可跑）中「開啟設定」測試仍通過。
- 更新 `docs/PROJECT_MAP.md` §1（localStorage 表的 `volume` → `audioVolumes`）與 §2；驗證完關閉 dev server 與瀏覽器。

### 回報（負責角色填寫）
- 修改檔案：`src/ui/SettingsDialog.jsx`、`src/ui/Button.jsx`、`src/ui/Dialog.jsx`、`src/styles.css`、`src/App.jsx`（授權範圍）、`docs/PROJECT_MAP.md` §1 §2、`docs/CHANGELOG.md`
- 做了什麼：
  1. `SettingsDialog.jsx`：單一音量改成五條滑桿（主音量 / 背景音樂 / 召喚音效 / 按鈕音效 / 勝敗音效），用 `audio.getVolumes()` 初始化、每次打開重新讀取，拖動時 `audio.setVolume(category, value)` 即時生效並由音訊模組存檔。每條顯示百分比；除背景音樂外都有 ▶ 試聽（主音量、召喚 → `sfx_summon`；按鈕 → `playClick()`；勝敗 → `sfx_win`）。props 只剩 `show`、`onClose`、`audio`、`theme`、`setTheme`。
  2. `Button.jsx`：點擊（通過 disabled 檢查與 120ms 鎖之後）呼叫 `audio.playClick()`；disabled 不播。
  3. `App.jsx`（僅授權範圍）：移除 `volume` state、存 `volume` 的 useEffect、`setMasterVolume` 的 useEffect、傳給 `SettingsDialog` 的 `volume` / `setVolume`。其他未動。
  4. `styles.css`：新增 `.volume-row` 等樣式（窄螢幕時標籤換行）。
  5. **順手修的問題（UI 範圍內）**：`Dialog` 在 `fullscreen` 時改用 `createPortal` 掛到 `document.body`。原因：CEO-004 給外框 `.game-background` 加了 `backdrop-filter`，會讓裡面的 `position: fixed` 改成相對外框定位，**在商店等長頁面打開設定時，視窗會跑到畫面外**。戰鬥中的非全螢幕 Dialog 不受影響。
- 如何驗證：
  - `npm run build` 成功；`npm test` 通過（1/1，「開啟設定」按鈕）。本機原本缺 `jsdom`，依 CLAUDE.md 跑了 `npm install`。
  - 瀏覽器：用 JS 把五條滑桿設成 90/35/60/25/70% → `localStorage.audioVolumes` 立即寫入對應值；重新整理後打開設定，五條值都保留。
  - 攔截 `AudioContext.createOscillator` 計數：點一般按鈕（關閉、商店）各產生一次按鈕音效；對 disabled 按鈕送出點擊，計數不增加；按鈕音效的試聽會響。
  - 在商店頁捲動後打開設定，視窗正確置中（portal 修正後）；neon / warm 主題下外觀正常。
  - 「實際用耳朵聽」各分類音量的效果沒有做（驗證環境無法確認聲音輸出），只確認了數值與呼叫。
  - 驗證完已關閉自己開的 dev server 與瀏覽器分頁。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - commit 範圍：上列檔案＋`docs/tasks/ui.md`。
  - `npm install` 會把 `package-lock.json` 的專案名稱從 `battlecats-v4.8` 自動改成 `battlecats-v5.9`（因 `package.json` 名稱已變）。這不是我的範圍，我已用 `git checkout` 還原；之後任何人跑 `npm install` 都會再出現這個 1 行差異，建議 CEO 決定是否直接 commit。
  - App 右上角「設定」按鈕是 App 裡的原生 `<button>`，不是 `Button` 元件，所以**沒有**點擊音效；關卡格（`.stage-btn`）也是原生按鈕，同樣沒有。如需要，要另外授權修改 `App.jsx` / `LevelSelect.jsx`（後者是 UI 範圍，可再開任務）。
  - AU-002 回報提到「清除存檔（`localStorage.clear()`）會清掉 `audioVolumes`，但記憶體中的音量保留」，UI-005 沒有改變這個行為。
  - 驗證時瀏覽器 localStorage 的 `audioVolumes` 被我設成測試值（90/35/60/25/70%）。

### 審核（CEO 填寫）
- 2026-09-27 通過。App.jsx 只移除授權的音量邏輯；Dialog 改用 portal 修正長頁面設定視窗跑出畫面，屬 UI 範圍，接受。`package-lock.json` 名稱差異由 CEO 直接修正並 commit。設定按鈕與關卡格沒有點擊音效，列入 PROJECT_MAP §11 #15。


## [UI-006] 戰場貓咪走路 / 攻擊動畫
- 狀態：已完成
- 優先度：中
- 來自：使用者（2026-09-27，對話中直接指派：「希望角色走路以及攻擊時有動畫」；敵人目前不用）
- 依賴：無（用 `draw.js` 自行推算移動 / 攻擊狀態，不改引擎）

**需求**
戰場 Canvas 上的**我方貓咪**加上程式動畫（角色圖只有單張，無逐格素材）：
- 走路：彈跳、搖擺、壓扁拉伸；停下時待機呼吸。
- 攻擊：出手時往前衝、放大，並有揮擊特效。
- 受擊：閃白。
- 動畫跟隨遊戲時間（暫停會停、2x 會加速）；不改任何戰鬥數值與邏輯；敵人不變。

**完成條件**
- 戰鬥中貓咪走路、攻擊、受擊都有動畫，4 種主題下正常；無圖的貓（色塊）也有動畫。
- `npm run build` 成功；更新 `docs/PROJECT_MAP.md` §2 / §4.5；驗證完關閉 dev server 與瀏覽器。

### 回報（負責角色填寫）
- 修改檔案：`src/game/draw.js`、`docs/PROJECT_MAP.md`（§4.5）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：
  - `draw.js` 新增程式動畫（角色圖只有單張，沒有逐格素材，所以用變形做動畫）：
    - **走路**：依實際往前移動的距離推進步伐 → 上下彈跳、左右搖擺、落地時壓扁拉伸；走越快步伐越快，停下就不跳。
    - **攻擊**：偵測 `atkCd` 被重設（變大）= 剛出手，播 0.3 秒動作：先後縮蓄力，再往前撲並放大，同時在前方畫一道揮擊弧線（`--color-warn` 色）。
    - **受擊**：偵測 `hp` 減少，0.16 秒閃紅＋往後一震（原本想閃白，但多數貓是白色看不出來，改閃紅）。
    - **待機**：沒走也沒打時緩慢呼吸。
    - 被擊退（一幀內大幅後退）不當成走路。
  - 動畫狀態存在 `WeakMap`（單位移除後自動回收），**只讀** unit 的 `x`、`atkCd`、`hp`，不寫入任何戰鬥資料；時間用 `world.time`，所以暫停時停、2x 時加速。
  - 名字和血條固定不動，保持好讀。色塊畫法的貓（沒圖的 jaycat / jay）也套用同樣動畫。敵人不變（使用者指示「敵人目前不用」）。
  - `drawUnit` 多一個參數 `t`（預設 0），`drawAll` 傳入 `world.time`；沒有其他呼叫端。
- 如何驗證：
  - `npm run build` 成功；實際戰鬥中召喚多隻貓跑一段，console 無錯誤。
  - 因為預覽視窗寬度一直變動、戰場截圖不好比對，另外在頁面中直接載入 `draw.js`，用假單位把「走路 / 攻擊 / 受擊」各畫成 8 格連續畫面檢查：走路格有傾斜與高低起伏；攻擊格可見後縮→前撲放大與揮擊弧線；受擊格由紅漸回原色。
  - 驗證完已關閉自己開的 dev server 與瀏覽器分頁。
- 新增給其他角色的請求：無。目前用「比對上一幀」推算狀態就能運作。
- 給 CEO 的注意事項：
  - commit 範圍：`src/game/draw.js`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/ui.md`。`draw.js` 同時含 UI-004（角色圖）的改動，若 UI-004 尚未 commit 請一起處理。
  - 限制：若之後引擎改了「攻擊時重設 `atkCd`」的寫法（例如攻擊前就先重設、或冷卻不變大），攻擊動畫偵測會失效。更穩的做法是請引擎在 unit 上記錄 `lastAttackAt`（遊戲時間）與 `moving`，UI 改讀這兩個欄位。目前不需要，要不要開 EG 任務由 CEO 決定。
  - 受擊閃紅用 Canvas `ctx.filter`；Safari 舊版不支援時只會少了變色，後震動作仍有，不會出錯。

### 審核（CEO 填寫）
- 2026-09-27 通過。只改 `draw.js`，以 WeakMap 另存動畫狀態、只讀 unit，未動引擎與數值；build、test 通過。使用者直接指派的任務記在自己的任務檔，流程正確。
- 關於「請引擎記錄 `lastAttackAt` / `moving`」的建議：目前的推算方式可運作，暫不開 EG 任務；日後引擎若改動攻擊冷卻的寫法，須同步通知 UI（已記入 PROJECT_MAP §11 #17）。

## [UI-007] 章節環境機制：畫面與提示
- 狀態：已完成
- 優先度：高
- 來自：CEO（2026-09-27，使用者選定新特色「章節環境機制」）
- 依賴：接上真實資料需要 EG-003（`world.env`）與 LV-002（`stageConfig().env`）；在它們完成前可以先用假資料做畫面

**設計文件**：`docs/design/chapter-environment.md`（**先完整讀過**；§4 介面是合約，不可自行更改，有問題寫進 `docs/tasks/ceo.md`）

**需求**（詳見設計文件 §4.3）
1. 戰場 Canvas：晝夜（變暗偏藍、星星月亮 / 太陽，漸變過場）、潮汐（水面、漲退潮水位與流向）。
2. HUD：目前階段圖示＋剩餘秒數；預告期間明顯警示（含方向）。
3. 關卡選擇：有環境的關卡顯示 🌗 / 🌊 小圖示；章節選擇卡片說明環境規則。
4. 首次遇到某種環境時，戰鬥開始前跳一次說明視窗，已看過的記在 localStorage `envTipsSeen`。

**授權的跨檔修改**：`src/scenes/Battle.jsx` 只可修改 JSX 中與顯示有關的部分（HUD 環境指示、首次說明視窗）；主迴圈、召喚、勝負等邏輯一律不動。若需要戰鬥邏輯配合（例如說明視窗顯示時要暫停），寫進 `docs/tasks/engine.md` 請引擎處理。

**完成條件**
- 四種主題下晝夜、潮汐都清楚好看；預告容易注意到。
- `npm run build`、`npm test` 通過；更新 `docs/PROJECT_MAP.md` §2、§4.5；驗證完關閉 dev server 與瀏覽器。

### 回報（負責角色填寫）
- 修改檔案：
  - 新增：`src/ui/envInfo.js`、`src/ui/EnvIndicator.jsx`
  - 修改：`src/game/draw.js`、`src/styles.css`、`src/scenes/LevelSelect.jsx`、`src/scenes/ChapterSelect.jsx`、`src/scenes/Battle.jsx`（授權範圍：只加 `import EnvIndicator` 與畫布下方一行 `<EnvIndicator … />`）、`docs/PROJECT_MAP.md`（§2、§4.5）、`docs/CHANGELOG.md`
- 做了什麼（依設計文件 §4.3，全部只讀 `world.env` / `stageConfig().env`，沒有改任何合約）：
  1. **戰場 Canvas**（`draw.js`）：
     - 晝夜：白天右上角太陽；夜晚整體罩深藍、星星（固定位置、會閃）、月牙。預告夜晚時天色先微暗；切換約 1 秒漸變，不會瞬間跳色。
     - 潮汐：地面有一層水；漲／退潮時水位升高、浪花線和「‹‹／››」箭頭順著流向移動；預告期間水位微升並開始朝下一波方向流動。
     - 過場數值存在 `WeakMap`（以 world 為 key），用 `world.time` 推進（暫停會停、2x 加速、重開自動重置）。
  2. **HUD**（`EnvIndicator`，疊在戰場上方中央）：目前階段圖示＋名稱（潮汐含 ←／→）＋剩餘秒數，底色依階段變化；預告期間顯示閃爍橫幅，例如「🌙 夜晚將在 5 秒後降臨」「🌊 漲潮將在 4 秒後來襲 ←」（危險＝紅、機會＝綠）。元件自己每 100ms 讀 `worldRef.current.env`，**不動主迴圈**。
  3. **關卡選擇**：有環境的關卡左下角顯示 🌗／🌊（hover 顯示說明），下方列出本章環境規則。**章節選擇**：卡片加「戰場規則」說明（讀 `CHAPTER_ENV`，尚未提供時退回設計文件的章節對應）。
  4. **首次說明視窗**：在**關卡選擇**點到首次遇到的環境類型時先跳說明（規則三點＋「返回」／「知道了，開始戰鬥」），按開始才寫入 `localStorage.envTipsSeen`（陣列，例如 `["dayNight"]`）並進入戰鬥。放在進戰鬥之前，所以**不需要引擎配合暫停**，沒有開 EG 任務。`envTipsSeen` 沒有加入 `PRESERVED_KEYS`（照設計文件）。
- 如何驗證：
  - `npm run build` 成功；`npm test` 通過（2 個測試檔、14 個測試，含引擎的 `environment.test.js`）。
  - 在工作目錄中 LV-002、EG-003 的實際程式上測試：章節卡片規則說明正常；第一章第 1~3 關無圖示、第 4 關起顯示 🌗；清除 `envTipsSeen` 後點第 4 關出現說明視窗，按開始後 `envTipsSeen` = `["dayNight"]` 並進入戰鬥；戰鬥中環境標籤顯示「☀️ 白天 43s」，之後實際切換到夜晚並顯示「🌙 夜晚 18s」。
  - 因為預覽窗格後來停止繪製（`requestAnimationFrame` 每秒 0 次，窗格被遮住），實戰中等不到預告，改用兩種方式補驗：(a) 在頁面中直接載入 `draw.js`，用假 world 畫出白天／夜晚／夜晚預告／漲潮／退潮／平靜／漲潮預告，四種主題都各看過；(b) 用相同 class 渲染預告橫幅與各階段標籤檢查文字與配色。
  - 驗證完已關閉自己開的 dev server 與瀏覽器分頁。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - commit 範圍：上列檔案＋`docs/tasks/ui.md`。`Battle.jsx`、`draw.js` 目前也含其他角色（EG-003）未審核的改動，commit 時請留意分開。
  - 我的畫面依賴 LV-002（`stageConfig().env`、`CHAPTER_ENV`）與 EG-003（`world.env`）。在它們 commit 前，UI-007 單獨上線也不會出錯：沒有 env 時圖示、HUD、效果都不顯示，章節卡片仍顯示規則說明（用設計文件預設）。
  - **潮汐的實戰畫面**（第二章）沒有在實際戰鬥中看到，只用假資料驗證過繪製效果；建議 EC-001 試玩時順便確認。
  - 驗證時我改了預覽瀏覽器（localhost:5173）的 localStorage：`highestUnlocked` 設為兩章全開（`{1:20,2:20}`）、`envTipsSeen` 被清除後又寫成 `["dayNight"]`、主題設為 minimal。只影響本機預覽用的瀏覽器。
  - 預告秒數用無條件進位顯示（剩 4.2 秒顯示「5 秒」），剛開始預告時會顯示設計文件的整數秒數。

### 審核（CEO 填寫）
- 2026-09-27 通過。Battle.jsx 只加 import 與一行 `<EnvIndicator>`，符合授權；首次說明改在關卡選擇時跳出，免去暫停需求，判斷正確。第二章潮汐的實戰畫面交由 EC-001 試玩時確認。


## [UI-008] 設定畫面新增「環境提示音」音量滑桿
- 狀態：已完成
- 優先度：中
- 來自：音效（2026-09-27，AU-005）
- 依賴：AU-005（`env` 分類已實作，可直接開工）

**需求**
AU-005 新增了音量分類 `env`（章節環境提示音：晝夜、潮汐的預告音）。請在 `src/ui/SettingsDialog.jsx` 的 `VOLUME_ROWS` 加一條：
- `key: 'env'`，標籤建議「環境提示音」，圖示建議 🌗
- 試聽：`preview: (audio) => audio.playEnvCue('nightWarn')`

`audio.getVolumes()` 已包含 `env`（預設 0.8，舊存檔會自動補），`audio.setVolume('env', v)` 立即生效並存檔，和其他分類用法完全相同。

**完成條件**
- 設定畫面出現第六條滑桿，調整即時生效、重新整理後保留；試聽按鈕有聲音。
- `npm run build`、`npm test` 通過；更新 `docs/PROJECT_MAP.md` §2（若有列出滑桿）；驗證完關閉 dev server 與瀏覽器。

### 回報（負責角色填寫）
- 修改檔案：`src/ui/SettingsDialog.jsx`、`docs/PROJECT_MAP.md`（§2）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：
  - `VOLUME_ROWS` 最後加一條 `{ key: 'env', label: '環境提示音', icon: '🌗', preview: (audio) => audio.playEnvCue?.('nightWarn') }`。滑桿、百分比、試聽按鈕沿用既有的列樣式，不需要新 CSS。試聽用 `?.` 呼叫，萬一音訊模組沒有 `playEnvCue` 也不會出錯。
  - `PROJECT_MAP.md` §2：`SettingsDialog` 說明改為六條滑桿；順手修正同節「新增主題要改 `themes` 陣列」為實際名稱 `THEMES`（UI-005 改名時漏改）。
- 如何驗證：
  - `npm run build` 成功；`npm test` 通過（2 個測試檔、14 個測試）。
  - 瀏覽器：設定畫面有 6 條滑桿，「環境提示音」初始 80%；用 JS 設成 42% → `localStorage.audioVolumes.env` 立即變成 0.42；重新整理後打開設定仍是 42%（其他五條也保留）。
  - 攔截 `AudioContext.createOscillator` 計數：按「試聽環境提示音」後建立了振盪器（有合成提示音）。沒有實際用耳朵聽。
  - 驗證完已關閉自己開的 dev server 與瀏覽器分頁。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - commit 範圍：`src/ui/SettingsDialog.jsx`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/ui.md`。
  - 驗證時預覽瀏覽器（localhost:5173）的 `audioVolumes.env` 被我改成 0.42，只影響本機預覽。

### 審核（CEO 填寫）
- 2026-09-27 通過。只加一列設定，試聽用 `?.` 防呆；build、test 通過。


## [UI-009] 「設定」按鈕與關卡格補上點擊音效
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-28，PROJECT_MAP §11 #15）
- 依賴：無

**需求**
其他按鈕都透過 `src/ui/Button.jsx` 播 `audio.playClick()`（歸在 `ui` 音量分類），但下面兩個是原生 `<button>`，按了沒聲音：
1. `src/App.jsx` 約第 300 行：右上角「設定」按鈕。**CEO 授權本任務修改 `App.jsx` 這一個按鈕**（只限這個按鈕，其他部分不要動）。
2. `src/scenes/LevelSelect.jsx` 約第 56 行：關卡格 `.stage-btn`。**未解鎖的關卡不要播音效**（跟 `Button` disabled 時不播一致）。
- 做法自由：可以改用 `Button` 元件，或直接在 handler 裡呼叫 `audio.playClick()`。外觀不能改變（`.ui-corner-btn`、`.stage-btn` 樣式維持）。
- 順便處理：關卡格目前只綁 `onPointerUp`，用鍵盤（Tab + Enter/空白鍵）按不下去。請改成鍵盤也能選關，且同一次點擊不會觸發兩次選關或兩次音效。

**完成條件**
- 按「設定」、按已解鎖的關卡都會播點擊音效，且受設定畫面「按鈕音效」音量控制；按未解鎖的關卡沒有聲音、也不會進關。
- 鍵盤可以選關；滑鼠、觸控各只觸發一次。
- `npm run build`、`npm test` 通過；更新 PROJECT_MAP 自己領域的章節與 CHANGELOG。

### 回報（負責角色填寫）
- 修改檔案：`src/App.jsx`（授權範圍：只改「開啟設定」按鈕的 `onClick`）、`src/scenes/LevelSelect.jsx`、`docs/PROJECT_MAP.md`（§2）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：
  1. `App.jsx`「設定」按鈕：`onClick` 改為 `() => { audio.playClick(); setShowSettings(true); }`（`audio` 是 App 原本就有的 `useAudio()`）。`aria-label`、`className`、內容都沒動，外觀不變。
  2. `LevelSelect.jsx` 關卡格：
     - 拿掉 `onPointerUp`，改只用 `onClick`：滑鼠、觸控、鍵盤（Enter／空白鍵）每次操作都只會觸發一次，不會重複選關或重複播音效。
     - 已解鎖：先 `audio.playClick()` 再選關；未解鎖：直接 return，不播音效、不進關。
     - 未解鎖改標 `aria-disabled`（沒有用 `disabled`，才不會改到外觀、也仍可被 Tab 聚焦並讀出「未解鎖」）；補 `type="button"` 與 `aria-label`（例如「第 4 關（晝夜）（未解鎖）」「第 10 關（BOSS）（晝夜）」）。
     - `.stage-btn` 的 class 與樣式都沒改。
  3. 音效走 `audio.playClick()`，所以跟其他按鈕一樣歸在 `ui` 分類，受設定畫面「按鈕音效」音量控制。
- 如何驗證：
  - `npm run build` 成功；`npm test` 通過（3 個測試檔、27 個測試）。
  - 瀏覽器中攔截 `window.audio.playClick` 計算呼叫次數（測試前暫時把 `highestUnlocked` 設為第一章只開到第 3 關）：
    - 真實滑鼠點「設定」→ 1 次，設定視窗打開。
    - 真實滑鼠點未解鎖的第 4 關 → 0 次，仍停在關卡選擇。
    - 真實滑鼠點已解鎖的第 3 關 → 1 次，進入戰鬥。
    - 鍵盤：聚焦第 2 關按空白鍵 → 1 次，進入戰鬥；聚焦第 1 關按 Enter 也成功進入戰鬥。
    - 手機模式（375×812、觸控模擬）點第 1 關 → 1 次，進入戰鬥。註：瀏覽器工具的點擊仍以滑鼠事件送出，沒有真正的觸控手勢；但現在只綁 `onClick`，觸控也只會產生一次 click。
  - 測完已把 `highestUnlocked` 還原為 `{"1":20,"2":20}`、`envTipsSeen` 為 `["dayNight","tide"]`（測試前的值），視窗大小也還原為 desktop。
- 新增給其他角色的請求：無
- 收尾：已 `preview_stop` 自己開的 dev server（fa8bbd10…），並停掉之前連線別人伺服器時留下的「Browser」預覽項目（browser-preview-1790512883924-2）；關閉分頁。最後 `preview_list` 回傳 `[]`、`tabs_context` 回傳 `browserOpen: false, tabs: []`，都已清空。
- 給 CEO 的注意事項：
  - commit 範圍：`src/App.jsx`、`src/scenes/LevelSelect.jsx`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/ui.md`。
  - PROJECT_MAP §11 #15 可標為已處理（§11 由 CEO 維護，我沒改）。
  - 空白鍵選關後會直接進戰鬥，而戰鬥中空白鍵是「貓咪砲」。實測進場時戰鬥是「即將開始」狀態，沒有誤發大砲；如果之後戰鬥改成一進場就開始，可能需要引擎留意這個按鍵的 keyup / keydown 時序。

### 審核（CEO 填寫）
- 2026-09-28 通過。`App.jsx` 只改設定按鈕的 `onClick`，在授權範圍內；關卡格改 `onClick` 並補 `aria-disabled` / `aria-label`，外觀不變；build、test 通過，收尾確認為空。

## [UI-010] 攻擊動畫改讀引擎的 `atkSeq`
- 狀態：擱置（等待 EG-009 完成）
- 優先度：低
- 來自：CEO（2026-09-28，PROJECT_MAP §11 #17）
- 依賴：**EG-009**（引擎新增 `atkSeq`）。EG-009 還沒 `已完成` 前先不要動工。

**需求**
`src/game/draw.js` 約第 58 行用 `u.atkCd > a.atkCd + 0.01` 推算出手時機（UI-006）。EG-009 完成後，單位會有 `atkSeq`（每次出手 +1、只增不減）。請改成 `u.atkSeq > a.atkSeq` 判斷剛出手，並移除對 `atkCd` 的依賴。
- 動畫外觀、時長不變。

**完成條件**
- 瀏覽器實際看貓咪攻擊動畫與原本一樣；2x、暫停下也正常。
- `npm run build`、`npm test` 通過；更新 PROJECT_MAP 自己領域的章節與 CHANGELOG。

### 回報（負責角色填寫）
- 修改檔案：無（尚未動工）
- 做了什麼：2026-09-28 檢查時 EG-009 狀態為「待審核」（工作目錄中 `ai.js` 已有 `atkSeq`，但尚未通過審核），依本任務說明「EG-009 還沒 `已完成` 前先不要動工」，所以暫不修改 `draw.js`，狀態改為擱置。EG-009 通過後通知我即可開工。
- 如何驗證：—
- 新增給其他角色的請求：無
- 收尾：本任務未使用瀏覽器。
- 給 CEO 的注意事項：EG-009 審核通過後，請把本任務改回「待處理」或直接通知 UI 角色。

### 審核（CEO 填寫）

## [UI-011] 圖鑑卡片樣式對應所有貓咪
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-28，PROJECT_MAP §11 #6）
- 依賴：無

**需求**
`src/scenes/Codex.jsx` 的 `typeMap` 用中文名稱對應卡片樣式（`warrior/tank/archer/ninja/mage`），但名稱寫錯（「忍者貓」「法師貓」等，實際是「忍者喵」「法師喵」），而且大部分貓咪（巨人喵、鳥喵、騎士喵、轉蛋貓……）都沒列到，全部掉到預設的 `ninja`。
- 請讓 `cats.js` 裡**每一隻**貓咪都對應到合理的卡片樣式；需要的話可以在 `styles.css` 新增樣式。
- 建議改用貓咪的 key（`catKeyByName` 已經有）來對應，不要再依賴中文名稱；對應表放在 UI 自己的檔案。
- 不要改 `cats.js`（友軍角色的檔案）；若你認為應該在貓咪資料加欄位，寫進 `docs/tasks/ceo.md` 提出。

**完成條件**
- 圖鑑裡每隻貓都顯示正確的樣式，沒有掉到預設值的；四種主題下都看得清楚。
- `npm run build`、`npm test` 通過；更新 PROJECT_MAP 自己領域的章節與 CHANGELOG。

### 回報（負責角色填寫）
- 修改檔案：
  - 新增：`src/ui/catRoles.js`、`src/ui/catRoles.test.js`
  - 修改：`src/scenes/Codex.jsx`、`src/ui/UnitCard.jsx`、`src/styles.css`、`docs/PROJECT_MAP.md`（§2）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：
  1. 刪除 `Codex.jsx` 以中文名對應的 `typeMap`，改成 `catKeyByName(名稱)` 取得 key，再用 UI 自己的新檔 `catRoles.js`（`CAT_ROLES`）對應定位。`cats.js` 沒有動。
  2. 定位依單位特性分 6 種（顏色＋圖示＋文字標籤）：
     - 🛡️ 坦克（藍）：坦喵、魚喵、相撲喵
     - ⚔️ 近戰（橘）：白喵、巨人喵、騎士喵、武士喵、維京喵
     - 🏹 遠程（綠）：射喵、鳥喵、蜥蜴喵
     - 🔮 法術（紫紅）：法師喵、虛空秘典喵、蒼藍幻影喵
     - 💨 速攻（紫）：忍者喵、牛喵、禁節喵
     - ✨ 特殊（黃，新增樣式）：禁節貓娘（HP 1、攻擊 1 的特殊單位）
  3. `UnitCard` 改收 `role`，卡片除了左側色條，名稱下方多一個定位標籤（定位色淡底＋主題文字色，深淺主題都看得清楚）。若遇到沒對應的貓會顯示灰色色條且不顯示標籤（`unknown`），不會再默默掉到「忍者」。
  4. 新增測試 `catRoles.test.js`：檢查 `cats.js`（BASE / GACHA / SHOP）每一隻貓都有定位且定位存在；每隻貓的中文名都能用 `catKeyByName` 反查回正確 key。之後新增貓咪忘了補定位，`npm test` 會失敗。
- 如何驗證：
  - `npm run build` 成功；`npm test` 通過（4 個測試檔、35 個測試，含新增的 2 個）。
  - 瀏覽器：暫時把 `codexCats` 設成全部 18 隻貓的名稱，打開圖鑑 → 18 張卡片、`unknown` 為 0，定位與上表一致；Minimal／Modern／Neon／Warm 四種主題都截圖確認色條與標籤清楚。
  - 測完已把 `codexCats` 還原為 `["白喵","坦喵","射喵"]`、`theme` 為 `minimal`（測試前的值）。
- 新增給其他角色的請求：無
- 收尾：已 `preview_stop` 自己開的 dev server（7e893aad…）並關閉分頁；`preview_list` 回傳 `[]`、`tabs_context` 回傳 `browserOpen: false, tabs: []`，已清空。
- 給 CEO 的注意事項：
  - commit 範圍：`src/ui/catRoles.js`、`src/ui/catRoles.test.js`、`src/scenes/Codex.jsx`、`src/ui/UnitCard.jsx`、`src/styles.css`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/ui.md`。工作目錄中的 `ai.js`、`world.js`、`Battle.jsx` 等是引擎角色的改動，不屬於本任務。
  - 定位是 UI 依數值判斷的顯示分類，不影響戰鬥。若希望由友軍角色在貓咪資料加正式的「定位」欄位，需要另外決定（目前我認為不需要，所以沒有在 ceo.md 提出）。
  - PROJECT_MAP §11 #6 可標為已處理（§11 由 CEO 維護，我沒改）。
  - 新增貓咪的流程多了一步：在 `src/ui/catRoles.js` 的 `CAT_ROLES` 補一行（沒補測試會失敗）。建議在友軍的新增貓咪流程說明中提一下。

### 審核（CEO 填寫）
- 2026-09-28 通過。改用 key 對應定位，新增測試保證每隻貓都有定位；`cats.js` 未動，範圍正確；build、test 通過，收尾確認為空。新增貓咪要補 `CAT_ROLES` 一事，CEO 已寫進 PROJECT_MAP §3。