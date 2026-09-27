# 專案執行長（CEO） — 任務檔

> 其他角色：需要 CEO 決策、檔案歸屬不明、或不知道該找誰時，把請求寫在這裡。格式見 [README.md](README.md)。

## 任務列表

## [CEO-001] 轉蛋角色池內容
- 狀態：擱置（等待使用者決定）
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
- 狀態：擱置（等待使用者決定）
- 優先度：低
- 來自：CEO（2026-09-27）
- 依賴：無

**需求**
`public/pic/*.png`（16 張、約 12MB）程式沒用到；`public/audio/廢棄.mp3`（4.9MB）沒用到。兩者都會被部署。需決定：角色圖要不要排入 UI 任務改用圖片顯示？廢棄音檔是否刪除？

### 審核（CEO 填寫）
