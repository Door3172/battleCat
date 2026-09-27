// src/audio/useAudio.js
import { useMemo } from 'react';
import { audio, registerDefaultAudios } from './index.js';

// 模組載入時就註冊音檔（重複註冊不會覆蓋已載入的資源）
registerDefaultAudios();

export function useAudio() {
  // 回傳同一個單例
  return useMemo(() => audio, []);
}
