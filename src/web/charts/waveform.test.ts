import { describe, expect, it, vi } from 'vitest';
import { createWaveform, waveformKey, waveformPath, waveformPeaks, waveformTime, waveformTimeAt, waveformValueText } from './index.ts';

describe('waveform geometry', () => {
  it('computes peaks per bucket', () => {
    expect(waveformPeaks([0.1, -0.5, 0.2, 0.25], 2)).toEqual([1, 0.5]);
    expect(waveformPeaks([0.1, -0.5, 0.2, 0.25], 2, false)).toEqual([0.5, 0.25]);
    expect(waveformPeaks([], 3)).toEqual([0, 0, 0]);
  });

  it('draws five styles in a 100 x 100 box', () => {
    const peaks = [1, 0.5];
    expect(waveformPath(peaks, 'bars')).toBe('M25 4V96M75 27V73');
    expect(waveformPath(peaks, 'half')).toBe('M25 100V0M75 100V50');
    expect(waveformPath(peaks, 'envelope')).toBe('M0 50L0 2L100 26L100 50L100 74L0 98Z');
    expect(waveformPath(peaks, 'line')).toBe('M0 2L100 74');
    expect(waveformPath([0, 0.4], 'dots')).toBe('M25 50h0M75 50h0M75 40.4h0M75 59.6h0');
    expect(waveformPath([], 'bars')).toBe('');
  });

  it('formats times and maps keys and pointers', () => {
    expect(waveformTime(65)).toBe('1:05');
    expect(waveformTime(3723)).toBe('1:02:03');
    expect(waveformValueText({ duration: 200, position: 65, selection: { start: 30, end: 45 } })).toBe('1:05 of 3:20, selected 0:30 to 0:45');
    const o = { duration: 100, position: 50 };
    expect(waveformKey('ArrowRight', false, o)).toEqual({ position: 55 });
    expect(waveformKey('PageDown', false, o)).toEqual({ position: 20 });
    expect(waveformKey('End', false, o)).toEqual({ position: 100 });
    expect(waveformKey('Enter', false, o)).toBeNull();
    const onSelect = (): void => {};
    expect(waveformKey('ArrowRight', true, { ...o, onSelect })).toEqual({ position: 55, selection: { start: 50, end: 55 } });
    expect(waveformKey('ArrowLeft', true, { ...o, position: 55, selection: { start: 50, end: 55 }, onSelect })).toEqual({ position: 50, selection: null });
    expect(waveformKey('Escape', false, { ...o, selection: { start: 1, end: 2 }, onSelect })).toEqual({ selection: null });
    expect(waveformTimeAt(150, { left: 100, width: 200 }, 60)).toBe(15);
    expect(waveformTimeAt(0, { left: 100, width: 200 }, 60)).toBe(0);
  });
});

describe('waveform', () => {
  it('renders a static waveform as an image', () => {
    const w = createWaveform({ peaks: [0.2, 0.8, 0.5], label: 'Doorbell chime', style: 'envelope', color: 5 });
    expect(w.el.className).toBe('mh-waveform mh-waveform--envelope mh-waveform--series-5');
    expect(w.el.getAttribute('role')).toBe('img');
    expect(w.el.getAttribute('aria-label')).toBe('Doorbell chime');
    expect(w.el.getAttribute('style')).toBe('--_n: 3; --_pos: 100%');
    expect(w.el.querySelectorAll('.mh-waveform__wave')).toHaveLength(2);
    expect(w.el.querySelector('.mh-waveform__playhead')).toBeNull();
  });

  it('is a slider that seeks and selects from the keyboard', () => {
    const onSeek = vi.fn();
    const onSelect = vi.fn();
    const w = createWaveform({ peaks: [0.5, 1], label: 'Voice message', duration: 80, position: 20, onSeek, onSelect });
    expect(w.el.className).toBe('mh-waveform mh-waveform--bars mh-waveform--accent mh-waveform--interactive');
    expect(w.el.getAttribute('role')).toBe('slider');
    expect(w.el.getAttribute('tabindex')).toBe('0');
    expect(w.el.getAttribute('aria-valuetext')).toBe('0:20 of 1:20');
    expect(w.el.querySelector<HTMLElement>('.mh-waveform__playhead')!.getAttribute('style')).toBe('left: 25%');
    w.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(onSeek).toHaveBeenLastCalledWith(25);
    expect(w.el.getAttribute('aria-valuenow')).toBe('25');
    w.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }));
    expect(onSelect).toHaveBeenLastCalledWith({ start: 25, end: 30 });
    expect(w.el.querySelector('.mh-waveform__selection')!.getAttribute('style')).toBe('left: 31.25%; width: 6.25%');
    expect(w.el.getAttribute('aria-valuetext')).toBe('0:30 of 1:20, selected 0:25 to 0:30');
    w.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onSelect).toHaveBeenLastCalledWith(null);
    expect(w.el.querySelector('.mh-waveform__selection')).toBeNull();
    w.destroy();
    w.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(onSeek).toHaveBeenCalledTimes(2);
  });
});
