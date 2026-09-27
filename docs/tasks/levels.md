# 關卡 — 任務檔

> 格式與規則見 [README.md](README.md)。

## 任務列表

## [LV-001] 修正第二章第 9 關錯誤的敵人 key，並全面檢查出怪設定
- 狀態：已完成
- 優先度：高
- 來自：CEO（2026-09-27）
- 依賴：無

**需求**
1. `src/data/spawns2.js` 第 9 關（約第 103 行）的 `{ time: 2, type: '小丑魚', multiplier: 1000 }`：`type` 用了中文名，程式找不到 key，會改成「小狗 ×1000%」。改成 `type: 'clownfish'`。
2. 檢查 `spawns.js`、`spawns2.js` 所有 `type` 與 `boss.key`，確認都對得到 `src/data/enemies.js` 中 `ENEMIES` / `BOSSES` 的 key。
3. `spawns.js` 開頭註解說 `multiplier` 是「數量倍率」，這是錯的，實際上是 **HP 與攻擊的百分比倍率**。請更正註解，並補上程式有支援但註解沒寫的 `count` 欄位（週期出怪的總次數上限）。

**完成條件**
- 所有 `type` / `boss.key` 都是合法 key（在回報中列出檢查方式）。
- `npm run build` 成功。
- 更新 `docs/PROJECT_MAP.md` 第 5 章（若有需要）。

### 回報（負責角色填寫）
- 修改檔案：`src/data/spawns2.js`、`src/data/spawns.js`（僅註解）、`docs/PROJECT_MAP.md` §5、`docs/CHANGELOG.md`
- 做了什麼：
  1. `spawns2.js` 第 9 關 `type: '小丑魚'` → `type: 'clownfish'`（multiplier 1000 維持不變）。
  2. 全面檢查兩章所有 `schedule[].type` 與 `boss.key`：共 246 筆，全部對得到 `ENEMIES` / `BOSSES` 的 key，除上述一筆外無其他錯誤。
  3. `spawns.js` 開頭註解：`multiplier` 改寫為「HP 與攻擊的百分比倍率（不是數量）」；補上 `count` 欄位說明（有 interval 時預設無限、否則為 1，對應 `Battle.jsx` 第 240 行 `e.count ?? (interval ? Infinity : 1)`）；另註明 type 填錯會被當成 dog。
- 如何驗證：
  - 用 Node 腳本 import `SPAWNS`、`SPAWNS2`、`ENEMIES`、`BOSSES`，逐一檢查每關 `schedule[].type` 與 `boss.key` 是否 `in ENEMIES || in BOSSES` → `checked 246, bad 0`。
  - `npm run build` 成功。
- 新增給其他角色的請求：無
- 備註：2-9 開場 2 秒就出一隻 ×1000% 小丑魚（HP 1350、攻擊 150），修正後難度會與原本的「小狗 ×1000%」（HP 900、攻擊 90）不同，偏難一些。這是原設計意圖所以先保留，若 CEO 認為要調整倍率請再派工。

### 審核（CEO 填寫）
- 2026-09-27 通過。diff 只動到 spawns.js 註解與 spawns2.js 一行，範圍正確；build 成功。2-9 改為小丑魚 ×1000% 後偏難，接受（符合原設計意圖），暫不調整。

