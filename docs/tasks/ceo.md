# 專案執行長（CEO） — 任務檔

> 其他角色：需要 CEO 決策、檔案歸屬不明、或不知道該找誰時，把請求寫在這裡。格式見 [README.md](README.md)。

## 任務列表

## [CEO-001] 轉蛋角色池內容
- 狀態：擱置（使用者 2026-09-27 指示：先不處理）
- 優先度：中
- 來自：CEO（2026-09-27）
- 依賴：無

**需求**
`src/data/gachaPool.js` 的 `GACHA_CHARACTERS` 是空陣列，轉蛋按了沒反應。需要使用者決定：放哪些貓（新設計 or 從商店移過去）、各幾星。決定後派工給友軍（`GACHA_UNLOCKS` 貓資料）與經濟（抽池、機率）。

### 審核（CEO 填寫）

## [CEO-002] 從 git 移除 node_modules
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-27）
- 依賴：無

**需求**
`node_modules/`（約 4,000 檔）被 commit 進 repo，雖然 `.gitignore` 已列出。於第一次審核 push 時一併執行 `git rm -r --cached node_modules`（不刪本機檔案）。

### 審核（CEO 填寫）
- 2026-09-27 已執行 `git rm -r --cached node_modules`，並將 `.claude/` 加入 `.gitignore`。


## [CEO-003] 未使用的素材
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-27）
- 依賴：無

**需求**
`public/pic/*.png`（16 張、約 12MB）程式沒用到；`public/audio/廢棄.mp3`（4.9MB）沒用到。兩者都會被部署。需決定：角色圖要不要排入 UI 任務改用圖片顯示？廢棄音檔是否刪除？

### 審核（CEO 填寫）
- 2026-09-27 使用者決定：`廢棄.mp3` 刪除 → AU-001；角色圖交給 UI 使用 → UI-004（戰場部分依賴 EG-002）。


## [CEO-004] 審核：UI 四種主題全面美化（使用者直接指派給 UI）
- 狀態：已完成
- 優先度：中
- 來自：UI（2026-09-27，使用者在對話中直接指派：「每個 UI 設定檔（Modern 那些）都改美觀一點」）
- 依賴：無

**需求**
使用者直接要求 UI 角色重新設計 4 種主題（minimal / modern / warm / neon）。因 UI 不能在自己任務檔新增任務，依規則寫在此供 CEO 審核。

**完成條件**
- 4 種主題外觀各有特色、文字對比正常，切換主題即時生效。
- `npm run build` 成功。

### 回報（UI 填寫）
- 修改檔案（全部在 UI 範圍內）：
  - `src/styles.css`（重寫：完整設計 token＋4 主題＋元件 class）
  - `src/data/skin.js`（新增 `SKIN.field.*`、getter 快取，`SKIN.grad.hero` 去掉寫死的黃色）
  - `src/game/draw.js`（戰場天空/地面/描邊/文字改讀 `SKIN.field.*`；只改顏色，繪製邏輯不動）
  - `src/ui/`：Button、Card、Dialog、Divider、GachaMachine、HeroBanner、HudInfo、Icons、Pill、Progress、SettingsDialog、SlotTray、Toolbar、UnitCard
  - `src/scenes/`：ChapterSelect、Codex、Gacha、LevelSelect、Lineup、Lobby、Shop、Upgrade（僅畫面排版與按鈕樣式，未動任何數值/邏輯）
- 做了什麼：
  1. **修正根本問題**：元件原本在 JSX 用 `SKIN.color.*` 讀 CSS 變數，只在渲染當下讀一次，加上 `index.html` 預設 `theme-neon` → 淺色主題卡片變黑、深色主題 Pill/按鈕白底白字、切主題不更新。改為全部用 CSS class＋`var(--*)`。
  2. **4 主題重新設計**：Minimal＝白底靛藍深色橫幅；Modern＝深色玻璃、藍紫漸層；Warm＝奶油紙感、橘粉漸層、圓潤；Neon＝深夜底、青＋洋紅螢光。每個主題都有完整的按鈕/卡片/Pill/橫幅/圓角/陰影/戰場配色。
  3. **戰場 Canvas 跟主題配色**（原本地面寫死灰藍）。
  4. **修正既有 bug**：`.game-background > *` 把 Dialog 的 `position: fixed` 蓋成 `relative`，導致**線上版「設定」視窗點了不會出現**。已排除 Dialog 背景層。
  5. 返回按鈕原本 absolute 疊在橫幅右上（會被新橫幅蓋住、也和設定鈕擠在一起），改放橫幅上方一列。
  6. 大廳：資源卡加寬、「開始遊戲」改為整列主按鈕；章節選擇改成大卡片（含簡介）；轉蛋機重畫並置中；商店可購買按鈕改 primary；關卡鎖定格顯示 🔒；HUD 數值改成小格；設定下拉選單顯示中文風格名。
  7. `UnitCard` 移除寫死的假數值（攻擊 50 / 血量 100 原本就沒顯示，也沒有樣式），新增 `.unit-card` 樣式。
- 如何驗證：`npm run build` 成功；在 dev server 實際切換 4 主題檢查大廳、章節、關卡、戰鬥（含 Canvas）、設定視窗、商店、升級、轉蛋、隊伍編成畫面。`npm test` 仍因既有問題（PROJECT_MAP §11 #12）無法執行，與本次無關。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - commit 範圍＝上列檔案（`git status` 中目前所有 `src/` 的修改都是本任務）。`.claude/launch.json` 是我為預覽加的，已被 `.gitignore` 排除。
  - **沒有改 `App.jsx` 與 `Battle.jsx`**。但有兩處用 CSS 覆寫它們的樣式，屬權宜作法：(a) App 的「設定」按鈕用 `button[aria-label="開啟設定"]` 選擇器覆寫 `bg-white/80`；(b) Battle 召喚欄單格的 `bg-white` 用 `.slot-tray [role=listitem]` + `!important` 覆寫。建議之後授權 UI 把這兩處的 className 改乾淨。
  - `docs/PROJECT_MAP.md` §2 已由 UI 更新；§11 #6 可改為「UnitCard 已有樣式，僅剩 typeMap 名稱不符」。
  - 存檔結構未變動，不需提升 `SAVE_VERSION`。

### 審核（CEO 填寫）
- 2026-09-27 通過。改動全部在 UI 範圍內；scenes 只動排版、未動數值與邏輯；Button 防連點邏輯保留；build 成功。CEO 另以瀏覽器檢查：四種主題的文字/按鈕/卡片顏色隨主題切換正確，設定視窗可正常開啟並以 Esc 關閉。
- 回報提到的兩處 CSS 權宜覆寫（App 設定按鈕、Battle 召喚欄白底），已派工為 UI-003 並授權修改。
- 流程備註：使用者直接指派的工作，之後請記在**自己的任務檔**（來自：使用者），不必寫進 ceo.md。規則已更新（CLAUDE.md 第 9 條）。


## [CEO-005] 整體網站優化（使用者指派，單一對話依序扮演各角色）
- 狀態：已完成
- 優先度：高
- 來自：使用者（2026-11-02）
- 依賴：無

**需求**
使用者：「額度剩太多，把整體網站優化」，並選擇「這個對話直接全部做完」：依序扮演各角色，在各自任務檔記錄任務並實作、填回報，最後由 CEO 審核、build/test，commit 並 push 到分支 `claude/cool-cerf-nez47p`（**不推 main、不會直接上線**）。

**CEO 全面檢查結果（2026-11-02，build 成功、test 37 項通過；Playwright 桌面 1280×800 與手機 390×844 實測）**
1. 首次載入約 **8.3 MB**：音檔 5.8 MB（大廳音樂 4.2 MB）、Google 字型約 2.2 MB（Noto Sans TC 約 1.2 MB、粉圓約 0.9 MB、Inter 48 KB）。程式碼本身只有 74 KB（gzip）。
2. `public/audio/*.mp3` 實際不是 MP3：音樂與召喚音是 DASH 分段 MP4（AAC），勝敗音效是 Ogg Opus（舊版 iOS Safari 無法解碼）。
3. **手機上戰場被裁切**：畫布寬 750px，外框只有 455px，看不到敵方主堡與來襲的敵人。
4. **按「重開」後觸控裝置無法開始戰鬥**：重開後狀態為 `ready`，召喚按鈕被停用、也不會自動開始，只能按鍵盤 1~5。
5. 勝敗後 300ms 就自動回大廳，看不清結果；想打下一關要再點三次（開始遊戲 → 章節 → 關卡）。
6. 開發模式（StrictMode）下 `abortedRef` 會被模擬卸載設成 true，打贏拿不到金幣。
7. 每次載入先顯示霓虹主題再跳回存檔主題（`index.html` 寫死 `theme-neon`）。
8. `localStorage` 存檔損毀時 `JSON.parse` 會讓整個畫面白屏。
9. 轉蛋池是空的（CEO-001 擱置中），按「抽一次」完全沒反應。
10. 部署流程有一段舊的「Ensure vite present」補丁（node_modules 還在 git 時的產物），而且沒跑測試就部署。
11. `public/ui-redesign.html`（與遊戲無關的草稿）會被部署公開。

**派工（CEO 決定歸屬）**
- `docs/tasks/engine.md` **EG-012**：戰鬥流程修正與結算畫面邏輯、`App.jsx` 存檔讀取防呆（第 3~6、8 點；`App.jsx` 由 CEO 授權引擎修改）。
- `docs/tasks/engine.md` **EG-013**：建置與部署設定（第 10 點；建置設定沒有角色負責，CEO 授權引擎修改）。
- `docs/tasks/ui.md` **UI-014**：載入速度（字型）、主題閃爍、戰場縮放、手機戰鬥版面、結算視窗畫面、轉蛋空池提示、`index.html` / manifest（第 1、3、7、9、11 點）。
- `docs/tasks/audio.md` **AU-006**：音檔轉成真正的 MP3 並降低音樂位元率（第 1、2 點）。

### 審核（CEO 填寫）
- 2026-11-02 完成。四個子任務（EG-012、EG-013、UI-014、AU-006）皆審核通過，`npm test` 47 項、`npm run build`（無警告）通過。
- **成果**：首次載入（大廳 → 進一場戰鬥）8.27 MB／71 個請求 → 5.56 MB／50 個請求（−33%）；手機看得到完整戰場；重開卡住、dev 模式拿不到金幣、存檔損毀白屏、舊存檔第 2 章全解鎖等 bug 修正；勝敗後有結算視窗與「下一關」；部署前會先跑測試。
- **注意**：本次由同一個對話依序扮演各角色並自行審核（使用者選擇的做法），沒有獨立的第二雙眼睛；已用自動測試、舊版對照重現與 Playwright 實測補強。commit 只 push 到分支 `claude/cool-cerf-nez47p`，**沒有推 `main`、尚未上線**。
- **需要使用者確認**：(1) 內文字型改用系統字型；(2) 背景音樂 96 kbps 的音質；(3) 勝敗後不再自動回大廳的新流程；(4) 合併到 `main` 後 GitHub Actions（新部署流程）是否成功。
- 未處理、留作之後的任務：背景音樂整首解碼的記憶體用量（§11 #24）；`viewport` 的 `initial-scale=0.8`；轉蛋池內容（CEO-001 仍擱置）。
