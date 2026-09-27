# 變更紀錄

格式：`日期｜角色｜摘要`，新的寫在最上面。

- 2026-09-27｜CEO｜審核 LV-001、UI-001、UI-002、AL-001 全數通過；更新 PROJECT_MAP §5、§11。CEO-002：從 git 移除 node_modules，`.gitignore` 加入 `.claude/`。規則新增第 10 條：所有要交代的事都必須寫進任務檔回報，不能只在對話裡說；任務範本加入「給 CEO 的注意事項」。
- 2026-09-27｜友軍｜AL-001：`buildCatsTpl` 改為自動遍歷 `SHOP_UNLOCKS` 納入已購買的商店貓（輸出與舊版完全相同，含順序）；新增商店貓只需改 `cats.js`。
- 2026-09-27｜關卡｜LV-001：2-9 `小丑魚` 改為 `clownfish`；全關卡敵人 key 檢查通過；修正 `spawns.js` 註解（multiplier 為能力值倍率、補 `count`）。
- 2026-09-27｜UI｜UI-001 戰鬥 HUD 按鈕改名「收入升級 +x/秒」；UI-002 關卡選擇 BOSS ⭐ 改讀 `stageConfig().isBoss`（App 傳入 `chapter`）。
- 2026-09-27｜CEO｜建立任務系統 `docs/tasks/`（每角色一個任務檔）、CEO 審核流程；首批任務 LV-001、AL-001、UI-001、UI-002、CEO-001~003。
- 2026-09-27｜CEO｜協作規則加入：嚴禁改他人檔案、需協助時以「跨角色請求」提示字交由使用者轉交；CEO 不寫遊戲程式碼。
- 2026-09-27｜CEO｜建立 `CLAUDE.md`（角色分工與協作規則）、`docs/PROJECT_MAP.md`（系統總覽與已知問題）、本檔。
