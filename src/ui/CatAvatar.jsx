import React, { useState } from 'react';
import { catArtUrl } from './catArt.js';
import { cn } from '../utils/cn.js';

// 貓咪頭像：有圖顯示圖，沒圖（或載入失敗）顯示名字首字的圓形徽章
export default function CatAvatar({ catKey, name = '', size = 40, className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = catArtUrl(catKey);
  const style = { width: size, height: size };

  if (!url || failed) {
    return (
      <span
        className={cn('cat-avatar cat-avatar-fallback', className)}
        style={{ ...style, fontSize: Math.round(size * 0.42) }}
        aria-hidden="true"
      >
        {name ? name[0] : '?'}
      </span>
    );
  }

  return (
    <span className={cn('cat-avatar', className)} style={style} aria-hidden="true">
      <img src={url} alt="" draggable="false" onError={() => setFailed(true)} />
    </span>
  );
}
