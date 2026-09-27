// 音量分類：每個分類一個 GainNode，都接到 master
export const VOLUME_CATEGORIES = ['master', 'music', 'summon', 'ui', 'result'];
const DEFAULT_VOLUMES = { master: 1, music: 0.8, summon: 0.8, ui: 0.8, result: 0.8 };
const VOLUME_KEY = 'audioVolumes';
const LEGACY_VOLUME_KEY = 'volume';

// 音效 key → 音量分類（未列出的預設走 summon；register 時也可指定）
const SFX_CATEGORY = {
  sfx_summon: 'summon',
  sfx_click: 'ui',
  sfx_win: 'result',
  sfx_lose: 'result',
};

const clamp01 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(1, Math.max(0, n));
};

// 讀取音量設定；沒有新 key 時，把舊的單一 `volume` 轉成 master
function loadVolumes() {
  const vols = { ...DEFAULT_VOLUMES };
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    if (raw) {
      const saved = JSON.parse(raw) || {};
      for (const c of VOLUME_CATEGORIES) {
        const v = clamp01(saved[c]);
        if (v !== null) vols[c] = v;
      }
      return vols;
    }
    const legacy = localStorage.getItem(LEGACY_VOLUME_KEY);
    if (legacy !== null) {
      const v = clamp01(legacy);
      if (v !== null) vols.master = v;
    }
    localStorage.setItem(VOLUME_KEY, JSON.stringify(vols));
  } catch {}
  return vols;
}

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.gains = {};            // 分類 gain：music / summon / ui / result
    this.musicFade = null;      // 音樂淡入淡出用（接在 music 分類 gain 前面，不影響使用者音量）

    this.musicSrcA = null;
    this.musicSrcB = null;
    this.musicUsingA = true;
    this._tempMusic = null;     // ← crossfade 的臨時來源

    this.buffers = new Map();
    this.preloads = new Map();
    this.sfxCategory = new Map(Object.entries(SFX_CATEGORY));
    this.synths = new Map([['sfx_click', (dest) => this._synthClick(dest)]]);
    this.cooldown = new Map();

    this.volumes = loadVolumes();

    // ★ 競態控制：每次播放 / 淡出遞增 token，只有最後一次請求會生效
    this._reqCounter = 0;
    this._activeReq = 0;
    this._currentKey = null;
  }

  // ---- 基礎 ----
  async resume() {
    if (!this.ctx) {
      const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return false;    // 不支援 Web Audio（例如測試環境）
      this.ctx = new AC();
      // nodes
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      for (const c of VOLUME_CATEGORIES) {
        if (c === 'master') continue;
        const g = this.ctx.createGain();
        g.connect(this.masterGain);
        this.gains[c] = g;
      }
      this.musicFade = this.ctx.createGain();
      this.musicFade.connect(this.gains.music);
      this._applyVolumes();
      this._preloadAll();
    }
    if (this.ctx.state !== 'running') await this.ctx.resume();
    return true;
  }

  // ---- 音量 ----
  getVolumes() {
    return { ...this.volumes };
  }
  setVolume(category, value) {
    if (!VOLUME_CATEGORIES.includes(category)) return;
    const v = clamp01(value);
    if (v === null) return;
    this.volumes[category] = v;
    this._applyVolume(category);
    try { localStorage.setItem(VOLUME_KEY, JSON.stringify(this.volumes)); } catch {}
  }
  _applyVolume(category) {
    const node = category === 'master' ? this.masterGain : this.gains[category];
    if (!node) return;          // AudioContext 尚未建立：值已存，建立時再套用
    this._setGain(node, this.volumes[category]);
  }
  _applyVolumes() {
    for (const c of VOLUME_CATEGORIES) this._applyVolume(c);
  }
  _setGain(node, v) {
    const now = this.ctx.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(v, now);
  }

  // 舊介面（相容用）
  setMasterVolume(v) { this.setVolume('master', v); }
  setMusicVolume(v) { this.setVolume('music', v); }
  setSfxVolume(v) { this.setVolume('summon', v); this.setVolume('result', v); }

  // ---- 資源 ----
  register(key, url, { category } = {}) {
    // 儲存 URL，待需要時再載入（已載入 / 載入中的不重設）
    if (!this.preloads.has(key)) this.preloads.set(key, url);
    if (category) this.sfxCategory.set(key, category);
  }
  async _loadBuffer(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Audio fetch failed: ${url} (${res.status})`);
    const arr = await res.arrayBuffer();
    const buf = await this.ctx.decodeAudioData(arr);
    return buf;
  }
  async _getBuffer(key) {
    if (!this.ctx) throw new Error('AudioContext not ready. Call audio.resume() after user gesture.');
    if (this.buffers.has(key)) return this.buffers.get(key);

    let entry = this.preloads.get(key);
    if (!entry) throw new Error(`Audio key not registered: ${key}`);

    // 若儲存的是 URL，建立載入 Promise 並快取（失敗時還原成 URL，下次可重試）
    if (typeof entry === 'string') {
      const url = entry;
      entry = this._loadBuffer(url);
      this.preloads.set(key, entry);
      entry.catch(() => { if (this.preloads.get(key) === entry) this.preloads.set(key, url); });
    }

    const buf = await entry;
    this.buffers.set(key, buf);
    return buf;
  }
  // AudioContext 建立後，於背景依序預先下載＋解碼所有已註冊的音檔
  async _preloadAll() {
    for (const key of [...this.preloads.keys()]) {
      try { await this._getBuffer(key); } catch {}
    }
  }

  _stopAllMusic() {
    try { this.musicSrcA && this.musicSrcA.stop(); } catch {}
    try { this.musicSrcB && this.musicSrcB.stop(); } catch {}
    try { this._tempMusic && this._tempMusic.stop(); } catch {}
    this.musicSrcA = null;
    this.musicSrcB = null;
    this._tempMusic = null;
    this._currentKey = null;
  }

  // ---------- 工具：產生新的請求 token ----------
  _nextToken() {
    this._activeReq = ++this._reqCounter;
    return this._activeReq;
  }
  _isLatest(token) { return token === this._activeReq; }

  // ---------- 硬切播放（最後呼叫者贏） ----------
  // 同一首已在播時不重播（避免在大廳各畫面間切換時音樂一直從頭開始），只取消進行中的淡出
  async playMusic(key, { loop = true, restart = false } = {}) {
    const token = this._nextToken();       // 這次請求的身份（先取號：會取消先前的淡出 / 切歌）
    try {
      if (!(await this.resume())) return;
      if (!this._isLatest(token)) return;
      if (!restart && this._currentKey === key && this.musicSrcA) {
        this._setGain(this.musicFade, 1);
        return;
      }
      const buf = await this._getBuffer(key);
      if (!this._isLatest(token)) return;  // 若途中被更新，直接放棄

      this._stopAllMusic();                // 關掉任何舊來源（含臨時）
      this._setGain(this.musicFade, 1);    // 恢復被淡出拉到 0 的音量

      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = loop;
      src.connect(this.musicFade);
      src.start();

      this.musicSrcA = src;
      this.musicUsingA = true;
      this._currentKey = key;
    } catch (e) {
      console.warn('[audio] playMusic failed:', e);
    }
  }

  // ---------- 淡入淡出播放（最後呼叫者贏） ----------
  async crossfadeMusic(key, { loop = true, fade = 600 } = {}) {
    const token = this._nextToken();
    try {
      if (!(await this.resume())) return;
      const buf = await this._getBuffer(key);
      if (!this._isLatest(token)) return;

      const now = this.ctx.currentTime;

      // 新曲先接臨時 gain 做淡入（接在 music 分類 gain，仍受音樂音量控制）
      const toGain = this.ctx.createGain();
      toGain.gain.setValueAtTime(0, now);
      toGain.gain.linearRampToValueAtTime(1, now + fade / 1000);
      toGain.connect(this.gains.music);

      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = loop;
      src.connect(toGain);
      src.start();

      // 記住臨時來源：若中途又被要求切歌，可被 _stopAllMusic 關掉
      try { this._tempMusic && this._tempMusic.stop(); } catch {}
      this._tempMusic = src;

      // 舊曲淡出
      const fromGain = this.musicFade;
      const startVol = fromGain.gain.value;
      fromGain.gain.cancelScheduledValues(now);
      fromGain.gain.setValueAtTime(startVol, now);
      fromGain.gain.linearRampToValueAtTime(0, now + fade / 1000);

      // 淡入完：停掉舊來源，把臨時來源接回正式通道
      setTimeout(() => {
        if (!this._isLatest(token)) { try { src.stop(); } catch {} return; }
        try {
          try { this.musicSrcA && this.musicSrcA.stop(); } catch {}
          try { this.musicSrcB && this.musicSrcB.stop(); } catch {}
          this.musicSrcB = null;
          src.disconnect(); toGain.disconnect();
          src.connect(this.musicFade);
          this._setGain(this.musicFade, 1);
          this.musicSrcA = src;
          this._tempMusic = null;
          this._currentKey = key;
        } catch {}
      }, fade + 60);
    } catch (e) {
      console.warn('[audio] crossfadeMusic failed:', e);
    }
  }

  // 淡出並停止音樂；之後若有新的播放請求（token 變了），停止動作會被取消
  async fadeOutMusic(ms = 300) {
    if (!this.ctx || !this.musicFade) return;
    const token = this._nextToken();
    const now = this.ctx.currentTime;
    const g = this.musicFade.gain;
    const start = g.value;
    g.cancelScheduledValues(now);
    g.setValueAtTime(start, now);
    g.linearRampToValueAtTime(0, now + ms / 1000);
    setTimeout(() => {
      if (!this._isLatest(token)) return;
      this._stopAllMusic();
      this._setGain(this.musicFade, 1);
    }, ms + 30);
  }

  // ---------- SFX ----------
  async playSfx(key, { cooldown = 80, detune = 0 } = {}) {
    try {
      const nowMs = performance.now();
      const last = this.cooldown.get(key) || 0;
      if (nowMs - last < cooldown) return;
      this.cooldown.set(key, nowMs);

      if (!(await this.resume())) return;
      const dest = this.gains[this.sfxCategory.get(key) || 'summon'];

      const synth = this.synths.get(key);
      if (synth) { synth(dest); return; }

      const buf = await this._getBuffer(key);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      if (src.detune && detune) src.detune.value = detune;
      src.connect(dest);
      src.start();
    } catch (e) {
      console.warn('[audio] playSfx failed:', e);
    }
  }

  // 按鈕點擊音效（有冷卻，避免連點爆音）
  playClick() {
    return this.playSfx('sfx_click', { cooldown: 60 });
  }

  // 即時合成的短促「啵」聲：三角波 1100Hz→650Hz，約 70ms
  _synthClick(dest) {
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.06);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.35, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(env);
    env.connect(dest);
    osc.start(t);
    osc.stop(t + 0.08);
    osc.onended = () => { try { env.disconnect(); } catch {} };
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
  // 註冊順序 = 背景預載順序（大廳音樂最先需要）
  audio.register('bgm_lobby',  asset('bgm_lobby_v2.mp3'));
  audio.register('bgm_battle', asset('bgm_battle_v2.mp3'));
  audio.register('sfx_summon', asset('sfx_summon.mp3'));
  audio.register('sfx_win',    asset('sfx_win.mp3'));
  audio.register('sfx_lose',   asset('sfx_lose.mp3'));
}
