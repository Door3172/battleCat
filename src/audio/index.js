// src/audio/index.js
class AudioManager {
  constructor() {
    this.ctx = null;               // AudioContext（第一次用戶互動才建立）
    this.masterGain = null;
    // Music channel
    this.musicGain = null;
    this.musicSrcA = null;
    this.musicSrcB = null;
    this.musicUsingA = true;       // 交替用 A/B 來 crossfade
    // SFX channel
    this.sfxGain = null;

    this.buffers = new Map();      // key -> AudioBuffer
    this.preloads = new Map();     // key -> Promise (避免重複載入)
    this.cooldown = new Map();     // key -> timestamp (SFX 限流)

    this.musicVolume = 0.8;
    this.sfxVolume = 0.9;
  }

  // ---- 基礎 ----
  async resume() {
    if (this.ctx && this.ctx.state !== 'suspended') return;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      // nodes
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.setMusicVolume(this.musicVolume);
      this.setSfxVolume(this.sfxVolume);
    }
    await this.ctx.resume();
  }

  setMasterVolume(v) {
    this.masterGain && (this.masterGain.gain.value = v);
  }
  setMusicVolume(v) {
    this.musicVolume = v;
    this.musicGain && (this.musicGain.gain.value = v);
  }
  setSfxVolume(v) {
    this.sfxVolume = v;
    this.sfxGain && (this.sfxGain.gain.value = v);
  }

  // ---- 資源 ----
  async register(key, url) {
    // 可先呼叫一次 register，再需要時 lazy decode
    this.preloads.set(key, this._loadBuffer(url));
  }
  async _loadBuffer(url) {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const buf = await this.ctx.decodeAudioData(arr);
    return buf;
  }
  async _getBuffer(key) {
    if (!this.ctx) throw new Error('AudioContext not ready. Call audio.resume() after user gesture.');
    if (this.buffers.has(key)) return this.buffers.get(key);
    const p = this.preloads.get(key);
    if (!p) throw new Error(`Audio key not registered: ${key}`);
    const buf = await p;
    this.buffers.set(key, buf);
    return buf;
  }

  // ---- Music ----
  async playMusic(key, { loop = true } = {}) {
    await this.resume();
    const buf = await this._getBuffer(key);
    // 直接切歌（不淡入淡出）
    this._stopCurrentMusic();
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    src.connect(this.musicGain);
    src.start();
    this.musicSrcA = src;
    this.musicUsingA = true;
  }

  async crossfadeMusic(key, { loop = true, fade = 600 } = {}) {
    await this.resume();
    const buf = await this._getBuffer(key);

    const now = this.ctx.currentTime;
    const toGain = this.ctx.createGain();
    toGain.gain.setValueAtTime(0, now);
    toGain.connect(this.masterGain); // 直接到 master，避免與舊曲共享一個 gain

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    src.connect(toGain);
    src.start();

    // 舊曲音量拉下，新曲拉上
    const from = this.musicUsingA ? this.musicSrcA : this.musicSrcB;
    const fromGainNode = this.musicGain; // 舊版音樂都走 musicGain
    const toVol = this.musicVolume;
    toGain.gain.linearRampToValueAtTime(toVol, now + fade / 1000);

    if (from && fromGainNode) {
      const startVol = fromGainNode.gain.value;
      fromGainNode.gain.cancelScheduledValues(now);
      fromGainNode.gain.setValueAtTime(startVol, now);
      fromGainNode.gain.linearRampToValueAtTime(0, now + fade / 1000);
      setTimeout(() => {
        try { from.stop(); } catch {}
      }, fade + 50);
    }

    // 把新曲收編回主通道
    setTimeout(() => {
      // 轉接到 musicGain，並釋放 toGain
      try {
        src.disconnect();
        toGain.disconnect();
        src.connect(this.musicGain);
        this.musicGain.gain.value = toVol;
        if (this.musicUsingA) this.musicSrcB = src; else this.musicSrcA = src;
        this.musicUsingA = !this.musicUsingA;
      } catch {}
    }, fade + 60);
  }

  async fadeOutMusic(ms = 400) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (!this.musicGain) return;
    const start = this.musicGain.gain.value;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(start, now);
    this.musicGain.gain.linearRampToValueAtTime(0, now + ms / 1000);
    setTimeout(() => this._stopCurrentMusic(), ms + 40);
  }

  _stopCurrentMusic() {
    try { this.musicSrcA && this.musicSrcA.stop(); } catch {}
    try { this.musicSrcB && this.musicSrcB.stop(); } catch {}
    this.musicSrcA = null;
    this.musicSrcB = null;
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
  }

  // ---- SFX（可重疊/冷卻） ----
  async playSfx(key, { cooldown = 80, detune = 0 } = {}) {
    await this.resume();
    const nowMs = performance.now();
    const last = this.cooldown.get(key) || 0;
    if (nowMs - last < cooldown) return; // 限流，避免狂點爆音
    this.cooldown.set(key, nowMs);

    const buf = await this._getBuffer(key);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    if (src.detune && detune) src.detune.value = detune;
    src.connect(this.sfxGain);
    src.start();
  }
}

// ---- 單例 + 快捷介面 ----
export const audio = new AudioManager();

// 把音檔路徑加上 BASE_URL，支援 GitHub Pages 子路徑
function asset(p) {
  // 會組成 /battleCat/audio/xxx.mp3（dev 環境則是 /audio/xxx.mp3）
  return `${import.meta.env.BASE_URL}audio/${p}`;
}

export function registerDefaultAudios() {
  audio.register('bgm_lobby',  asset('bgm_lobby.mp3'));
  audio.register('bgm_battle', asset('bgm_battle.mp3'));
  audio.register('sfx_summon', asset('sfx_summon.mp3'));
  audio.register('sfx_win',    asset('sfx_win.mp3'));
  audio.register('sfx_lose',   asset('sfx_lose.mp3'));
}

