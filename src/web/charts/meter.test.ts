import { describe, expect, it } from 'vitest';
import { createLevelMeter, createMeter, holdPeak, levelFraction, levelText, meterLit, meterTone } from './index.ts';

const classes = (el: Element): string[] => [...el.querySelectorAll('.mh-meter__seg')].map((s) => s.className.replace('mh-meter__seg', '').trim());

describe('meter', () => {
  it('lights segments and picks zones', () => {
    expect(meterLit(0, 0, 100, 10)).toBe(0);
    expect(meterLit(1, 0, 100, 10)).toBe(1);
    expect(meterLit(64, 0, 100, 10)).toBe(6);
    expect(meterLit(200, 0, 100, 10)).toBe(10);
    expect(meterTone(85, { warning: 70, danger: 90 })).toBe('warning');
    expect(meterTone(95, { warning: 70, danger: 90 })).toBe('danger');
    expect(meterTone(15, { warning: 30, danger: 10 })).toBe('warning');
    expect(meterTone(5, { warning: 30, danger: 10 })).toBe('danger');
    expect(meterTone(50, undefined)).toBe('ok');
  });

  it('renders a level meter with zones by segment', () => {
    const m = createMeter({ value: 95, label: 'Noise', segments: 10, zones: { warning: 70, danger: 90 }, valueText: '95 dB' });
    expect(m.el.className).toBe('mh-meter mh-meter--level mh-meter--accent mh-meter--zones');
    expect(m.el.getAttribute('role')).toBe('meter');
    expect(m.el.getAttribute('aria-valuenow')).toBe('95');
    expect(m.el.getAttribute('aria-valuetext')).toBe('95 dB');
    expect(classes(m.el)).toEqual([...Array<string>(7).fill('is-on is-ok'), 'is-on is-warning', 'is-on is-warning', 'is-on is-danger']);
    m.setValue(30);
    expect(m.el.getAttribute('aria-valuetext')).toBe('30');
    expect(classes(m.el).filter((c) => c.includes('is-on'))).toHaveLength(3);
  });

  it('colours a battery by its value and draws signal bars', () => {
    const b = createMeter({ value: 8, label: 'Battery', segments: 5, zones: { warning: 30, danger: 10 }, colorBy: 'value', vertical: true });
    expect(b.el.className).toBe('mh-meter mh-meter--level mh-meter--vertical mh-meter--accent mh-meter--zones');
    expect(classes(b.el)).toEqual(['is-on is-danger', 'is-danger', 'is-danger', 'is-danger', 'is-danger']);
    const s = createMeter({ value: 3, min: 0, max: 4, label: 'Signal', mode: 'bars', valueText: '3 of 4 bars', color: 4, size: 'small' });
    expect(s.el.className).toBe('mh-meter mh-meter--bars mh-meter--series-4 mh-meter--sm');
    expect([...s.el.querySelectorAll('.mh-meter__seg')].map((e) => e.getAttribute('style'))).toEqual(['--_h: 25%', '--_h: 50%', '--_h: 75%', '--_h: 100%']);
    expect(classes(s.el)).toEqual(['is-on', 'is-on', 'is-on', '']);
  });
});

describe('level meter', () => {
  it('holds and releases peaks', () => {
    let p = holdPeak(undefined, -10, 0);
    expect(p.shown).toBe(-10);
    p = holdPeak(p.state, -30, 1000);
    expect(p.shown).toBe(-10);
    p = holdPeak(p.state, -30, 2000);
    expect(p.shown).toBe(-20);
    p = holdPeak(p.state, -30, 3000);
    expect(p.shown).toBe(-30);
    expect(p.state).toEqual({ value: -30, at: 3000 });
  });

  it('maps dB to the bar', () => {
    expect(levelFraction(-30)).toBe(0.5);
    expect(levelFraction(-Infinity)).toBe(0);
    expect(levelFraction(6)).toBe(1);
    expect(levelText(-12.4)).toBe('-12 dB');
    expect(levelText(-Infinity)).toBe('below -60 dB');
    expect(levelText(0)).toBe('clipping');
  });

  it('renders channels with peaks and a scale, updating in place', () => {
    const m = createLevelMeter({ levels: [-12, -30], channels: ['L', 'R'], label: 'Output', scale: true });
    expect(m.el.className).toBe('mh-level-meter');
    expect(m.el.getAttribute('role')).toBe('group');
    expect(m.el.getAttribute('style')).toBe('--_warn: 80%; --_danger: 95%');
    const tracks = m.el.querySelectorAll('.mh-level-meter__track');
    expect(tracks[0]!.getAttribute('aria-label')).toBe('Output, L');
    expect(tracks[0]!.getAttribute('aria-valuetext')).toBe('-12 dB');
    expect(tracks[0]!.getAttribute('style')).toBe('--_level: 0.8; --_peak: 0.8');
    expect([...m.el.querySelectorAll('.mh-level-meter__tick')].map((t) => t.textContent)).toEqual(['-60', '-40', '-20', '0']);
    m.setLevels([-40, -30], 1e9);
    m.setLevels([-50, -30], 1e9 + 500);
    expect(m.el.querySelectorAll('.mh-level-meter__track')[0]).toBe(tracks[0]);
    expect(tracks[0]!.getAttribute('style')).toBe('--_level: 0.17; --_peak: 0.33');
    m.update({ levels: [0], label: 'Mic', orientation: 'vertical', segmented: true, peaks: [0] });
    expect(m.el.className).toBe('mh-level-meter mh-level-meter--vertical mh-level-meter--segmented');
    expect(m.el.querySelector('.mh-level-meter__track')!.getAttribute('aria-label')).toBe('Mic');
    expect(m.el.querySelector('.mh-level-meter__peak')!.className).toBe('mh-level-meter__peak is-clip');
  });
});
