import React from 'react';
import Dialog from './Dialog.jsx';
import Button from './Button.jsx';

export default function SettingsDialog({ show, onClose, audio, volume, setVolume }) {
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
        <Button size="sm" block onClick={onClose}>
          關閉
        </Button>
      </div>
    </Dialog>
  );
}
