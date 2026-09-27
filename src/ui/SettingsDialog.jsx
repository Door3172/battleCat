import React, { useEffect, useState } from 'react';
import Dialog from './Dialog.jsx';
import Button from './Button.jsx';

// 分類音量（對應 AudioManager.setVolume 的 category）
const VOLUME_ROWS = [
  { key: 'master', label: '主音量', icon: '🔊', preview: (audio) => audio.playSfx('sfx_summon') },
  { key: 'music', label: '背景音樂', icon: '🎵' },
  { key: 'summon', label: '召喚音效', icon: '🐱', preview: (audio) => audio.playSfx('sfx_summon') },
  { key: 'ui', label: '按鈕音效', icon: '👆', preview: (audio) => audio.playClick() },
  { key: 'result', label: '勝敗音效', icon: '🏆', preview: (audio) => audio.playSfx('sfx_win') },
  { key: 'env', label: '環境提示音', icon: '🌗', preview: (audio) => audio.playEnvCue?.('nightWarn') },
];

const THEMES = [
  { value: 'minimal', label: 'Minimal・極簡' },
  { value: 'modern', label: 'Modern・深色玻璃' },
  { value: 'warm', label: 'Warm・暖橘' },
  { value: 'neon', label: 'Neon・霓虹' },
];

export default function SettingsDialog({ show, onClose, audio, theme, setTheme }) {
  const [volumes, setVolumes] = useState(() => audio.getVolumes());

  // 每次打開時以音訊模組的值為準（音量由音訊模組保存）
  useEffect(() => {
    if (show) setVolumes(audio.getVolumes());
  }, [show, audio]);

  const change = (key, value) => {
    audio.setVolume(key, value);
    setVolumes((v) => ({ ...v, [key]: value }));
  };

  return (
    <Dialog show={show} onClose={onClose}>
      <div className="w-[min(92vw,460px)] space-y-5 text-left">
        <div>
          <div className="text-lg font-semibold">設定</div>
          <div className="mt-1 text-sm text-sub">調整各類音量和整體介面風格。</div>
        </div>

        <div className="space-y-2" role="group" aria-label="音量">
          {VOLUME_ROWS.map((row) => {
            const value = volumes[row.key] ?? 1;
            const pct = `${Math.round(value * 100)}%`;
            const id = `volume-${row.key}`;
            return (
              <div key={row.key} className="volume-row">
                <label htmlFor={id} className="volume-label">
                  <span aria-hidden="true">{row.icon}</span>
                  <span>{row.label}</span>
                </label>
                <input
                  id={id}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value}
                  onChange={(e) => change(row.key, Number(e.target.value))}
                  className="w-full"
                  aria-valuetext={pct}
                />
                <span className="volume-pct tabular-nums">{pct}</span>
                {row.preview ? (
                  <Button size="sm" tone="ghost" sizeMap={{ sm: { f: 13, px: 0, py: 0 } }} className="volume-test" title={`試聽${row.label}`} aria-label={`試聽${row.label}`} onClick={() => row.preview(audio)}>
                    ▶
                  </Button>
                ) : (
                  <span className="volume-test" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="theme-select" className="min-w-16 text-sm font-medium">
            風格：
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="ui-select w-full flex-1 text-sm"
          >
            {THEMES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" block tone="primary" onClick={onClose}>
          關閉
        </Button>
      </div>
    </Dialog>
  );
}
