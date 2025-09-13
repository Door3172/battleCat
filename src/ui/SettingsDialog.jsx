import React from 'react';
import Dialog from './Dialog.jsx';
import Button from './Button.jsx';

export default function SettingsDialog({ show, onClose, audio, volume, setVolume, theme, setTheme }) {
  const volumeText = `${Math.round(volume * 100)}%`;
  return (
    <Dialog show={show} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="volume-slider" className="text-sm">
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
            測試
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="theme-select" className="text-sm">
            風格：
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="flex-1 w-full rounded border border-[var(--color-line)] bg-[var(--color-card-top)] p-2 text-sm"
          >
            <option value="neon">Neon</option>
            <option value="modern">Modern</option>
            <option value="warm">Warm</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <Button size="sm" block onClick={onClose}>
          關閉
        </Button>
      </div>
    </Dialog>
  );
}
