# 友軍（貓咪） — 任務檔

> 格式與規則見 [README.md](README.md)。

## 任務列表

## [AL-001] buildCatsTpl 改為自動納入已購買的商店貓
- 狀態：已完成
- 優先度：低（預防性重構，現有 11 隻都正常）
- 來自：CEO（2026-09-27）
- 依賴：無

**需求**
`src/game/world.js` 的 `buildCatsTpl` 決定「隊伍編成」與「升級」畫面列出哪些貓，目前每隻商店貓都是逐行寫死（`...(unlocks.ninja ? {...} : {})`）。以後新增商店貓若漏改這裡，玩家買了之後在隊伍編成看不到牠，也就無法帶上戰場。
請改成自動遍歷 `SHOP_UNLOCKS`，將 `unlocks[key]` 為 true 的貓納入，模板用 `SHOP_UNLOCKS[key].tpl`。

**限制**
- 只能改 `buildCatsTpl` 這個函式；`world.js` 其餘部分屬於戰鬥引擎。
- 等級計算、`BASE_CATS`、`GACHA_UNLOCKS` 的行為不變；Battle、Lineup、Upgrade 顯示結果要與現在相同（貓的順序也保持一致）。

**完成條件**
- `npm run build` 成功。
- 實際開 `npm run dev` 確認：購買後的商店貓出現在隊伍編成與升級畫面。
- 更新 `docs/PROJECT_MAP.md` 第 3 章相關說明。

### 回報（負責角色填寫）
- 修改檔案：`src/game/world.js`（僅 `buildCatsTpl` 函式）、`docs/PROJECT_MAP.md`（§3 等級計算段落）、`docs/CHANGELOG.md`
- 做了什麼：刪掉 11 行寫死的 `...(unlocks.xxx ? {...} : {})`，改成 `Object.entries(SHOP_UNLOCKS).filter(([k]) => unlocks[k]).map(([k, v]) => [k, v.tpl])`，再依原本順序合併 `BASE_CATS` → gacha → shop。等級計算、`BASE_CATS`、`GACHA_UNLOCKS` 的處理都沒動。
- 如何驗證：
  1. 寫了暫時性的比對腳本（跑完就刪了，沒有留在 repo），把舊版邏輯和新版逐一比對：測試多組 unlocks 組合＋不同等級，`JSON.stringify` 結果完全相同（連 key 的順序都一樣）；全部解鎖時的順序是 white…lizard, ninja, knight, mage, samurai, sumo, viking, cow, jaycat, jay, void, azurePhantom。
  2. `npm run build` 成功。
  3. 開 dev server，在內建瀏覽器實際到商店購買忍者喵、虛空秘典喵 → 隊伍編成與升級畫面都有正確列出，而且排在基本貓後面；測試用的 localStorage 已清空。
- 補充：§11 已知問題表第 3 項（「新增商店貓需手動改 buildCatsTpl」）由 CEO 維護，我沒有動，審核通過後請 CEO 移除或標註已解決。
- 補充：工作目錄中還有其他角色未提交的改動（`src/App.jsx`、`src/data/spawns.js`、`src/data/spawns2.js`、`src/scenes/LevelSelect.jsx`、`src/ui/HudInfo.jsx`），都不是 AL-001 的內容。commit 時請只 `git add` 本任務的檔案：`src/game/world.js`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/allies.md`。注意 `PROJECT_MAP.md` 和 `CHANGELOG.md` 也有其他角色的改動。
- 新增給其他角色的請求：無

### 審核（CEO 填寫）
- 2026-09-27 通過。只改 buildCatsTpl，順序與輸出和舊版一致；build 成功。§11 #3 已由 CEO 標為已修。回報中的 commit 範圍提醒有收到，但本批四個任務全數通過，將一起 commit。

