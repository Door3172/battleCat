# 設計文件：章節環境機制

- 狀態：**v1 已實作並完成首輪平衡（2026-09-27，EC-001 → LV-003）**
- 負責：CEO（2026-09-27）
- 相關任務：LV-002、EG-003、UI-007、AU-005、EC-001

> 本文件是各角色實作的共同依據。**介面（§4）是角色之間的合約**，要修改請先在 `docs/tasks/ceo.md` 提出，不可自行更改。數值（§3）是初版，EC-001 可以提出調整。

---

## 1. 目標

讓遊戲和《貓咪大戰爭》有明顯差異：**每個章節都有自己的戰場規則**，會週期性地改變戰況。玩家要**看準時機**召喚、放大砲、存魚，而不是只比誰的單位強。

設計原則：
1. **有預告**：事件發生前一定會提示，讓玩家有時間反應，不能突然被打。
2. **看得懂**：畫面和 HUD 要清楚顯示目前狀態和倒數。
3. **雙方都受影響**，但玩家可以利用它。
4. **能逐關設定**：每關可以開關、調整參數，方便關卡設計和新手教學。
5. **與現有能力系統連動**，讓舊能力有新價值（例如「擊退免疫」可以抵抗潮汐）。

---

## 2. 兩種環境

### 2.1 第一章・世界篇：🌗 晝夜（`dayNight`）

白天、黑夜輪流交替。**夜晚敵人更危險，但擊殺賞金更多**：這是風險換報酬的抉擇。

| 階段 | 效果 |
|---|---|
| ☀️ 白天 `day` | 無修正 |
| 🌙 夜晚 `night` | 敵人攻擊 ×1.15、移動速度 ×1.1；擊殺賞金（魚）×1.75（LV-003 調整後） |

- 夜晚開始前 **5 秒**預告。
- 玩家策略：白天推進、夜晚守線；或存魚在夜晚大量召喚、趁機賺賞金。

### 2.2 第二章・未來篇：🌊 潮汐（`tide`）

大部分時間風平浪靜，每隔一段時間來一波潮水，把戰場上的單位**往同一個方向推**。方向交替：

| 階段 | 效果 |
|---|---|
| 平靜 `calm` | 無修正 |
| 🌊 漲潮 `flood` | 所有單位往**我方主堡**（左）推：敵人被送過來、我方被往後推 → 危險 |
| 🏖️ 退潮 `ebb` | 所有單位往**敵方主堡**（右）推：我方被送上前線、敵人被推回去 → 機會 |

- 事件順序：平靜 → 漲潮 → 平靜 → 退潮 → 平靜 → …（第一次是漲潮）
- 潮水來之前 **4 秒**預告，並顯示方向。
- 有 `knockbackImmune`（擊退免疫）的單位**不受潮汐推動**（例如抹香鯨、幽靈鯊）。
- 被推動時單位**照常攻擊與行動**，推力是額外加上去的位移。
- 推動不會讓單位越過雙方主堡的邊界（跟一般移動的邊界相同）。
- 玩家策略：退潮前召喚近戰貓，讓潮水把牠們送上前線；漲潮時用大砲或遠程守住。

---

## 3. 初版數值（EC-001 可提出調整）

> 2026-09-27 EC-001 試玩後，CEO 核准第一章調整：`enemyAtkMul` 1.15、`enemySpeedMul` 1.1、`bountyMul` 1.75，1-4 `dayLength` 70；潮汐維持。由 LV-003 實作，下表為初版原值。

| 參數 | 晝夜 `dayNight` | 潮汐 `tide` |
|---|---|---|
| 週期 | 白天 `dayLength` 45 秒、夜晚 `nightLength` 25 秒 | 平靜 `calmLength` 24 秒、潮水 `surgeLength` 6 秒 |
| 預告 | `warnTime` 5 秒 | `warnTime` 4 秒 |
| 修正 | `enemyAtkMul` 1.2、`enemySpeedMul` 1.15、`bountyMul` 1.5 | `pushSpeed` 32 px/秒 |
| 起始 | `startPhase: 'day'` | 從 `calm` 開始，第一次是 `flood` |

**逐關啟用（LV-002 決定細節，以下為建議）**
- 第一章：第 1~3 關**不啟用**（新手教學），第 4 關起啟用。BOSS 關可以把夜晚拉長。
- 第二章：第 1 關**不啟用**，第 2 關起啟用。

---

## 4. 介面合約（各角色必須遵守）

### 4.1 關卡資料（關卡角色，`src/data/stages.js`、`spawns*.js`）

`stages.js` 新增章節預設值：
```js
export const CHAPTER_ENV = {
  1: { type: 'dayNight', dayLength: 45, nightLength: 25, warnTime: 5,
       enemyAtkMul: 1.15, enemySpeedMul: 1.1, bountyMul: 1.75, startPhase: 'day' }, // LV-003 調整後
  2: { type: 'tide', calmLength: 24, surgeLength: 6, warnTime: 4, pushSpeed: 32 },
};
```
每關可在 `SPAWNS` / `SPAWNS2` 的關卡物件加上 `env`：
- 省略 → 使用章節預設
- `env: false` → 此關不啟用
- `env: { nightLength: 35 }` → 只覆寫部分參數（與章節預設合併）

`stageConfig()` 回傳值新增 **`env`**：合併後的完整設定物件，或 `null`（不啟用）。

### 4.2 環境引擎（戰鬥引擎角色，新檔 `src/game/environment.js`）

```js
export function createEnv(envCfg)            // envCfg 為 null 時回傳 null
export function stepEnv(world, dt)           // 每幀呼叫：推進時間、切換階段、更新預告、套用潮汐推力
export function getEnvModifiers(world)       // → { enemyAtkMul, enemySpeedMul, bountyMul }，無環境時全為 1
```

`world.env`（`createWorld` 時建立，給 UI 與音效**唯讀**使用）：
```js
world.env = {
  type: 'dayNight' | 'tide',
  phase: 'day' | 'night' | 'calm' | 'flood' | 'ebb',
  phaseLeft: 12.3,                 // 目前階段剩餘秒數
  phaseProgress: 0.4,              // 目前階段進度 0~1（畫面過場用）
  warning: null | { next: 'night' | 'flood' | 'ebb', in: 3.2 },  // 預告中才有值
  events: 0,                       // 已發生的階段切換次數（UI/音效可用來偵測「剛切換」）
}
// 無環境的關卡：world.env === null
```

引擎掛接點：
- `Battle.jsx` 主迴圈在 `stepUnits` **之前**呼叫 `stepEnv(w, dt)`。
- `ai.js` 的 `stepUnits`：敵人每幀的 `u.atk`、`u.speed` 乘上 `getEnvModifiers` 的倍率（與 berserk、slow 疊乘）；擊殺賞金乘上 `bountyMul`。
- 潮汐推力：`stepEnv` 對所有存活且非 `knockbackImmune` 的單位加上 `±pushSpeed × dt` 位移，並限制在主堡邊界內。
- 所有環境時間都用遊戲時間（`dt`），暫停會停、2x 會加速。

### 4.3 畫面（UI 角色）

- **戰場 Canvas**（`draw.js`）：
  - 夜晚：畫面整體變暗偏藍、出現星星與月亮；白天有太陽。切換時要漸變，不能瞬間跳色。
  - 潮汐：地面出現水面；潮水期間水位上升，畫出流動方向的波紋和箭頭。
  - 四種主題下都要看得清楚。
- **HUD**：顯示目前階段圖示與剩餘秒數；預告期間要有明顯的警示（閃爍、顏色或橫幅），例如「🌙 夜晚將在 5 秒後降臨」「🌊 漲潮將在 4 秒後來襲 ←」。
- **關卡選擇**：有環境的關卡顯示小圖示（🌗／🌊）。
- **章節選擇**：卡片說明該章的環境規則。
- **首次遇到**某種環境時，戰鬥開始前跳一次說明視窗（記錄已看過，存在 localStorage key `envTipsSeen`；這是玩家進度，**不**加入 `PRESERVED_KEYS`）。

### 4.4 音效（音效角色）

- 預告開始時播放提示音（夜晚：低沉的鐘聲感；潮汐：水聲感），用振盪器合成即可，不新增大型音檔。
- 歸類在新分類或 `result` 分類由音效角色決定；若新增分類，要同步告知 UI（設定畫面要多一條滑桿）。
- **呼叫方式（合約）**：音訊模組新增 `audio.playEnvCue(kind)`，`kind` 為：
  - `'nightWarn'`（夜晚預告開始）、`'dayStart'`（天亮）
  - `'floodWarn'`（漲潮預告開始）、`'ebbWarn'`（退潮預告開始）
- 由戰鬥引擎在 `Battle.jsx` 主迴圈偵測到上述時機時呼叫 **`audio.playEnvCue?.(kind)`**（用 `?.`，所以 AU-005 完成前呼叫也不會出錯）。音效角色只需實作 `playEnvCue`，不必改 `Battle.jsx`。
- 實作補充（EG-003）：引擎另匯出 `pollEnvCues(world)`，回傳本幀新出現的 kind 陣列；已送出的提示記在 `world.envCueSeen`（不在 `world.env` 內）。`Battle.jsx` 以 `for (const kind of pollEnvCues(w)) audio.playEnvCue?.(kind)` 呼叫。
- 音量分類（AU-005）：新增 `env` 分類，設定畫面滑桿見 UI-008。

---

## 5. 開發順序

```
LV-002（關卡資料）──┐
                    ├─► EG-003（環境引擎）──► UI-007（畫面）──┐
                    │                      └─► AU-005（音效）──┼─► EC-001（平衡試玩）
```
- 介面已經先定好，所以 **LV-002、EG-003 可以同時開工**；UI-007 可以先用假資料做畫面，等 EG-003 完成再接上。
- EC-001 等其他四個都完成後，實際試玩並提出數值調整。

---

## 6. 之後可以延伸（不在這次範圍）

- 更多環境：沙塵暴（遠程射程下降）、雷雨（隨機落雷）、低重力。
- 能力連動：新增「夜行性」能力（夜晚變強）、「水棲」能力（順著潮汐加速）。
- 讓特定貓咪或敵人只在特定環境出現。
