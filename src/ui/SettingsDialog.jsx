import React from 'react';
import Dialog from './Dialog.jsx';
import Button from './Button.jsx';

export default function SettingsDialog({ show, onClose, audio, volume, setVolume, theme, setTheme }) {
  const volumeText = `${Math.round(volume * 100)}%`;
  const themes = [
    { value: 'minimal', label: 'Minimal' },
    { value: 'modern', label: 'Modern' },
    { value: 'warm', label: 'Warm' },
    { value: 'neon', label: 'Neon' },
  ];

  return (
    <Dialog show={show} onClose={onClose}>
      <div className="w-[min(92vw,420px)] space-y-5 text-left">
        <div>
          <div className="text-lg font-semibold">設定</div>
          <div className="mt-1 text-sm text-sub">調整音量和整體介面風格。</div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="volume-slider" className="min-w-16 text-sm font-medium">
            音量：{volumeText}
          </label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 w-full"
            aria-valuetext={volumeText}
          />
          <Button
            size="sm"
            block
            className="sm:w-auto"
            onClick={() => audio.playSfx('sfx_summon')}
          >
            播放測試音效
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="theme-select" className="min-w-16 text-sm font-medium">
            風格：
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-card-top)] px-3 py-2 text-sm text-[var(--color-ink)]"
          >
            {themes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" block onClick={onClose}>
          關閉
        </Button>
      </div>
    </Dialog>
  );
}
