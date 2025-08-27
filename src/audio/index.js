class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.musicSrcA = null;
    this.musicSrcB = null;
    this.musicUsingA = true;
    this._tempMusic = null;     // ← crossfade 的臨時來源

    this.buffers = new Map();
    this.preloads = new Map();
    this.cooldown = new Map();

    this.musicVolume = 0.8;
    this.sfxVolume = 0.9;

    // ★ 競態控制：每次播放遞增 token，只有最後一次請求會生效
    this._reqCounter = 0;
    this._activeReq = 0;
    this._currentKey = null;
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
  register(key, url) {
    // 儲存 URL，待需要時再載入
    this.preloads.set(key, url);
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

    let entry = this.preloads.get(key);
    if (!entry) throw new Error(`Audio key not registered: ${key}`);

    // 若儲存的是 URL，建立載入 Promise 並快取
    if (typeof entry === 'string') {
      entry = this._loadBuffer(entry);
      this.preloads.set(key, entry);
    }

    const buf = await entry;
    this.buffers.set(key, buf);
    return buf;
  }
  _stopAllMusic() {
    try { this.musicSrcA && this.musicSrcA.stop(); } catch {}
    try { this.musicSrcB && this.musicSrcB.stop(); } catch {}
    try { this._tempMusic && this._tempMusic.stop(); } catch {}
    this.musicSrcA = null;
    this.musicSrcB = null;
    this._tempMusic = null;
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
  }

  // ---------- 工具：產生新的請求 token ----------
  _nextToken() {
    this._activeReq = ++this._reqCounter;
    return this._activeReq;
  }
  _isLatest(token) { return token === this._activeReq; }

  // ---------- 硬切播放（最後呼叫者贏） ----------
  async playMusic(key, { loop = true } = {}) {
    await this.resume();
    const token = this._nextToken();       // 這次請求的身份
    const buf = await this._getBuffer(key);
    if (!this._isLatest(token)) return;    // 若途中被更新，直接放棄

    this._stopAllMusic();                  // 關掉任何舊來源（含臨時）

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    src.connect(this.musicGain);
    src.start();

    this.musicSrcA = src;
    this.musicUsingA = true;
    this._currentKey = key;
  }

  // ---------- 淡入淡出播放（最後呼叫者贏） ----------
  async crossfadeMusic(key, { loop = true, fade = 600 } = {}) {
    await this.resume();
    const token = this._nextToken();
    const buf = await this._getBuffer(key);
    if (!this._isLatest(token)) return;

    const now = this.ctx.currentTime;

    // 新曲先接臨時 gain 做淡入
    const toGain = this.ctx.createGain();
    toGain.gain.setValueAtTime(0, now);
    toGain.connect(this.masterGain);

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    src.connect(toGain);
    src.start();

    // 記住臨時來源：若中途又被要求切歌，可被 _stopAllMusic 關掉
    this._tempMusic = src;

    // 舊曲淡出
    const toVol = this.musicVolume;
    toGain.gain.linearRampToValueAtTime(toVol, now + fade / 1000);

    const fromGain = this.musicGain;
    if (fromGain) {
      const startVol = fromGain.gain.value;
      fromGain.gain.cancelScheduledValues(now);
      fromGain.gain.setValueAtTime(startVol, now);
      fromGain.gain.linearRampToValueAtTime(0, now + fade / 1000);

      // 淡出完停掉舊來源
      setTimeout(() => {
        if (!this._isLatest(token)) return;
        try { this.musicSrcA && this.musicSrcA.stop(); } catch {}
        try { this.musicSrcB && this.musicSrcB.stop(); } catch {}
        this.musicSrcA = null;
        this.musicSrcB = null;
      }, fade + 40);
    }

    // 淡入完把臨時來源接回正式通道
    setTimeout(() => {
      if (!this._isLatest(token)) { try { src.stop(); } catch {} return; }
      try {
        src.disconnect(); toGain.disconnect();
        src.connect(this.musicGain);
        this.musicGain.gain.value = toVol;
        this.musicSrcA = src;
        this._tempMusic = null;
        this._currentKey = key;
      } catch {}
    }, fade + 60);
  }

  async fadeOutMusic(ms = 300) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const start = this.musicGain.gain.value;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(start, now);
    this.musicGain.gain.linearRampToValueAtTime(0, now + ms / 1000);
    setTimeout(() => this._stopAllMusic(), ms + 30);
  }

  // ---------- SFX 保持不變 ----------
  async playSfx(key, { cooldown = 80, detune = 0 } = {}) {
    await this.resume();
    const nowMs = performance.now();
    const last = this.cooldown.get(key) || 0;
    if (nowMs - last < cooldown) return;
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
  audio.register('bgm_lobby',  asset('bgm_lobby_v2.mp3'));
  audio.register('bgm_battle', asset('bgm_battle_v2.mp3'));
  audio.register('sfx_summon', asset('sfx_summon.mp3'));
  audio.register('sfx_win',    asset('sfx_win.mp3'));
  audio.register('sfx_lose',   asset('sfx_lose.mp3'));
}

