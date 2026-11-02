import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// 測試用關卡：兩堡距離很短、敵堡 1 HP、不出怪 → 白喵走到敵堡打一下就贏（約 2 秒）
vi.mock('../data/stages.js', async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    stageConfig: (stage, chapter) => ({
      ...real.stageConfig(stage, chapter),
      enemyBaseHp: 1,
      towerDistance: 100,
      schedule: [],
      isBoss: false,
      env: null,
    }),
  };
});

const { default: Battle } = await import('./Battle.jsx');

// jsdom 沒有 Canvas：回傳一個什麼都不做的 2D context
function fakeCtx() {
  const noop = () => {};
  const gradient = { addColorStop: noop };
  return new Proxy({}, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => gradient;
      if (prop === 'measureText') return () => ({ width: 0 });
      return noop;
    },
    set(target, prop, value) { target[prop] = value; return true; },
  });
}

function renderBattle(overrides = {}) {
  const props = {
    currentStage: 1,
    currentChapter: 1,
    lineup: ['white'],
    unlocks: {},
    catLevels: {},
    researchLv: 1,
    cannonLv: 1,
    castleLv: 1,
    setCoins: vi.fn(),
    setScene: vi.fn(),
    setHighestUnlocked: vi.fn(),
    addEnemyName: vi.fn(),
    onNextStage: vi.fn(),
    ...overrides,
  };
  render(<Battle {...props} />);
  return props;
}

const advance = (ms) => act(() => { vi.advanceTimersByTime(ms); });
const pauseButton = () => screen.getByRole('button', { name: /^(⏸️ 暫停|▶️ 繼續)$/ }); // 戰鬥控制列的暫停鈕
const summonButton = () => screen.getByRole('button', { name: '召喚 白喵' });
const click = (el) => { fireEvent.click(el); advance(150); }; // Button 有 120ms 防連點鎖

describe('Battle 戰鬥流程（EG-012）', () => {
  let getContextSpy;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] });
    // requestAnimationFrame 用假計時器模擬 60fps
    vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(() => cb(performance.now()), 16));
    vi.stubGlobal('cancelAnimationFrame', (id) => clearTimeout(id));
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => fakeCtx());
  });

  afterEach(() => {
    cleanup();
    getContextSpy.mockRestore();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('進場後自動開始', () => {
    renderBattle();
    expect(pauseButton()).toBeDisabled();
    advance(400);
    expect(pauseButton()).toHaveTextContent('暫停');
    expect(pauseButton()).not.toBeDisabled();
  });

  it('按「重開」後會自動開始（觸控裝置不用鍵盤也能開打）', () => {
    renderBattle();
    advance(400);
    click(screen.getByRole('button', { name: /重開/ }));
    advance(400);
    expect(pauseButton()).not.toBeDisabled();
    expect(pauseButton()).toHaveTextContent('暫停');
    expect(summonButton()).not.toBeDisabled();
  });

  it('開始前按召喚會直接開打', () => {
    renderBattle();
    expect(summonButton()).not.toBeDisabled();
    click(summonButton());
    expect(pauseButton()).not.toBeDisabled();
    expect(summonButton()).toHaveTextContent(/s$/); // 已召喚 → 進入冷卻
  });

  it('切到背景分頁時自動暫停', () => {
    renderBattle();
    advance(400);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    delete document.hidden;
    expect(pauseButton()).toHaveTextContent('繼續');
  });

  it('勝利後停在結算視窗：金幣只發一次、可按下一關 / 再玩一次', () => {
    const props = renderBattle();
    advance(400);
    click(summonButton());
    advance(4000);
    expect(screen.getByText('🎉 勝利！')).toBeInTheDocument();
    expect(props.setCoins).toHaveBeenCalledTimes(1);
    expect(props.setCoins.mock.calls[0][0](100)).toBeGreaterThan(100);
    expect(props.setHighestUnlocked).toHaveBeenCalledTimes(1);
    expect(props.setHighestUnlocked.mock.calls[0][0]({ 1: 1, 2: 1 })).toEqual({ 1: 2, 2: 1 });
    // 不會自動回大廳
    advance(2000);
    expect(props.setScene).not.toHaveBeenCalled();

    click(screen.getByRole('button', { name: /下一關/ }));
    expect(props.onNextStage).toHaveBeenCalledTimes(1);

    click(screen.getByRole('button', { name: /再玩一次/ }));
    advance(400);
    expect(screen.queryByText('🎉 勝利！')).not.toBeInTheDocument();
    expect(pauseButton()).toHaveTextContent('暫停');
  });

  it('最後一關勝利時不顯示「下一關」', () => {
    renderBattle({ currentStage: 20 });
    advance(400);
    click(summonButton());
    advance(4000);
    expect(screen.getByText('🎉 勝利！')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /下一關/ })).not.toBeInTheDocument();
  });
});
