import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from './App.jsx';

expect.extend(matchers);

describe('App', () => {
  it('顯示開啟設定按鈕', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: '開啟設定' })).toBeInTheDocument();
  });
});
