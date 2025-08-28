import React from 'react';
import Dialog from './Dialog.jsx';
import Button from './Button.jsx';

export default function SettingsDialog({ show, onClose, audio, volume, setVolume }) {
  return (
    <Dialog show={show}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">音量</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1"
          />
          <Button size="sm" onClick={() => audio.playSfx('sfx_summon')}>
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
