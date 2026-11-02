import { describe, it, expect, beforeEach } from 'vitest';
import { readSaved, writeSaved, parseNumber, parseObject, parseArray, parseString } from './storage.js';

describe('readSaved', () => {
  beforeEach(() => localStorage.clear());

  it('沒有存檔時回傳預設值', () => {
    expect(readSaved('coins', 300, parseNumber)).toBe(300);
  });

  it('正常讀取各種格式', () => {
    localStorage.setItem('coins', '1250');
    localStorage.setItem('lineup', '["white","tank"]');
    localStorage.setItem('unlocks', '{"ninja":true}');
    localStorage.setItem('theme', 'warm');
    expect(readSaved('coins', 300, parseNumber)).toBe(1250);
    expect(readSaved('lineup', [], parseArray)).toEqual(['white', 'tank']);
    expect(readSaved('unlocks', {}, parseObject)).toEqual({ ninja: true });
    expect(readSaved('theme', 'minimal', parseString)).toBe('warm');
  });

  it('資料損毀或型別不對時退回預設值（不丟例外）', () => {
    localStorage.setItem('coins', 'abc');
    localStorage.setItem('lineup', '{壞掉的 JSON');
    localStorage.setItem('unlocks', '[1,2]');
    localStorage.setItem('codex', '"字串"');
    localStorage.setItem('empty', '');
    expect(readSaved('coins', 300, parseNumber)).toBe(300);
    expect(readSaved('lineup', ['white'], parseArray)).toEqual(['white']);
    expect(readSaved('unlocks', { a: 1 }, parseObject)).toEqual({ a: 1 });
    expect(readSaved('codex', [], parseArray)).toEqual([]);
    expect(readSaved('empty', 1, parseNumber)).toBe(1);
  });

  it('writeSaved 寫入後可讀回', () => {
    writeSaved('catLevels', { white: 3 });
    expect(readSaved('catLevels', {}, parseObject)).toEqual({ white: 3 });
    writeSaved('researchLv', 4, String);
    expect(localStorage.getItem('researchLv')).toBe('4');
  });
});
