// src/audio/useAudio.js
import { useEffect, useMemo } from 'react';
import { audio, registerDefaultAudios } from './index.js';

export function useAudio() {
  // 首次使用時註冊音檔
  useEffect(() => {
    registerDefaultAudios();
  }, []);

  // 回傳同一個單例
  return useMemo(() => audio, []);
}
