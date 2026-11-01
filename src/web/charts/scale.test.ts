import { describe, expect, it } from 'vitest';
import { niceScale, niceStep, plainNumber, stepDecimals, tickText } from './index.ts';
import { node, patch, toDom } from './tree.ts';

describe('nice scales', () => {
  it('picks round steps', () => {
    expect(niceStep(10, 4)).toBe(2.5);
    expect(niceStep(7, 4)).toBe(2);
    expect(niceStep(0.9, 4)).toBeCloseTo(0.25);
    expect(niceStep(430, 4)).toBe(200);
    expect(stepDecimals(2.5)).toBe(1);
    expect(stepDecimals(0.25)).toBe(2);
    expect(stepDecimals(50)).toBe(0);
  });

  it('covers the data with round ticks', () => {
    expect(niceScale(0, 6.1)).toEqual({ min: 0, max: 8, step: 2, ticks: [0, 2, 4, 6, 8] });
    expect(niceScale(-3, 7).ticks).toEqual([-5, -2.5, 0, 2.5, 5, 7.5]);
    expect(niceScale(0, 0)).toEqual({ min: 0, max: 1, step: 0.25, ticks: [0, 0.25, 0.5, 0.75, 1] });
    expect(niceScale(5, 5).min).toBe(0);
    expect(tickText(0.5, 0.25)).toBe('0.50');
    expect(plainNumber(4.2)).toBe('4.2');
    expect(plainNumber(1 / 3)).toBe('0.33');
  });
});

describe('chart trees', () => {
  it('builds SVG in its namespace and patches in place', () => {
    const el = toDom(node('div', { class: 'a', hidden: false }, node('svg', { viewBox: '0 0 1 1' }, node('path', { d: 'M0 0' })), 'text'));
    expect(el.outerHTML).toBe('<div class="a"><svg viewBox="0 0 1 1"><path d="M0 0"></path></svg>text</div>');
    expect(el.querySelector('path')!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    const path = el.querySelector('path');
    patch(el, node('div', { class: 'b', role: 'img' }, node('svg', { viewBox: '0 0 1 1' }, node('path', { d: 'M1 1' })), 'new'));
    expect(el.className).toBe('b');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.querySelector('path')).toBe(path);
    expect(path!.getAttribute('d')).toBe('M1 1');
    expect(el.textContent).toBe('new');
    patch(el, node('div', {}, node('span', {}, 'x')));
    expect(el.outerHTML).toBe('<div><span>x</span></div>');
  });
});
