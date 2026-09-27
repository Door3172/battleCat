import React, { useEffect, useRef, useState } from 'react';
import { ENV_PHASES, ENV_TYPES, envWarningText } from './envInfo.js';
import { cn } from '../utils/cn.js';

// 戰場上方的環境指示：目前階段＋剩餘秒數，預告期間顯示警示橫幅。
// 只讀 world.env（由 getEnv 取得），自己每 100ms 更新一次畫面，不影響戰鬥主迴圈。
export default function EnvIndicator({ getEnv }) {
  const [env, setEnv] = useState(() => snapshot(getEnv()));
  const getRef = useRef(getEnv);
  getRef.current = getEnv;   // 父層每次重畫都可能傳新函式，用 ref 避免計時器一直重設

  useEffect(() => {
    const id = setInterval(() => setEnv(snapshot(getRef.current())), 100);
    return () => clearInterval(id);
  }, []);

  if (!env) return null;
  const phase = ENV_PHASES[env.phase] || { icon: ENV_TYPES[env.type]?.icon ?? '❔', name: env.phase };
  const warnText = envWarningText(env.warning);
  const danger = env.warning?.next === 'night' || env.warning?.next === 'flood';

  return (
    <div className="env-hud" aria-live="polite">
      <div className={cn('env-chip', `env-phase-${env.phase}`)} title={ENV_TYPES[env.type]?.summary}>
        <span className="env-chip-icon" aria-hidden="true">{phase.icon}</span>
        <span>{phase.name}{phase.arrow ? ` ${phase.arrow}` : ''}</span>
        <span className="env-chip-time tabular-nums">{Math.max(0, Math.ceil(env.phaseLeft ?? 0))}s</span>
      </div>
      {warnText && (
        <div className={cn('env-warning', danger ? 'is-danger' : 'is-good')} role="alert">
          {warnText}
        </div>
      )}
    </div>
  );
}

function snapshot(env) {
  if (!env) return null;
  return {
    type: env.type,
    phase: env.phase,
    phaseLeft: env.phaseLeft,
    warning: env.warning ? { next: env.warning.next, in: env.warning.in } : null,
  };
}
