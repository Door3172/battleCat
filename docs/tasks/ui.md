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

