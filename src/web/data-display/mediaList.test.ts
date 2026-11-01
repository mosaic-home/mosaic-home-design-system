import { describe, expect, it, vi } from 'vitest';
import { createMediaList, mediaListItemLabel, mediaListSecondary } from './index.ts';

describe('media list', () => {
  it('joins subtitle and meta, and names pressable rows', () => {
    expect(mediaListSecondary({ subtitle: 'Artist', meta: '3:42' })).toBe('Artist · 3:42');
    expect(mediaListSecondary({ subtitle: null, meta: '3:42' })).toBe('3:42');
    expect(mediaListSecondary({})).toBe('');
    expect(mediaListItemLabel({ title: 'Song', subtitle: 'Artist', meta: '3:42' }, 'Play')).toBe('Play: Song, Artist, 3:42');
    expect(mediaListItemLabel({ title: 'Song' })).toBe('Song');
  });

  it('renders thumbnails with a placeholder under a lazy image that hides on error', () => {
    const m = createMediaList({ label: 'Up next', items: [{ title: 'Song', subtitle: 'Artist', meta: '3:42', image: 'cover.png' }, { title: 'Film', image: null, placeholder: 'film' }] });
    expect(m.el.tagName).toBe('UL');
    expect(m.el.className).toBe('mh-media-list');
    const [first, second] = Array.from(m.el.querySelectorAll('li'));
    const img = first!.querySelector('img')!;
    expect(img.className).toBe('mh-media-list__image');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(img.getAttribute('alt')).toBe('');
    expect(first!.querySelector('.mh-media-list__thumb')!.getAttribute('aria-hidden')).toBe('true');
    expect(first!.querySelector('.mh-media-list__placeholder')).not.toBeNull();
    expect(first!.querySelector('.mh-media-list__subtitle')!.textContent).toBe('Artist · 3:42');
    img.dispatchEvent(new Event('error'));
    expect(img.hidden).toBe(true);
    expect(second!.querySelector('img')).toBeNull();
    expect(second!.querySelector('.mh-media-list__subtitle')).toBeNull();
    expect(m.el.querySelector('.mh-media-list__action')).toBeNull();
  });

  it('makes rows labelled buttons with onSelect and shows the action icon', () => {
    const onSelect = vi.fn();
    const m = createMediaList({ items: [{ title: 'Song', subtitle: 'Artist' }], action: 'play', actionLabel: 'Play', onSelect });
    const button = m.el.querySelector<HTMLButtonElement>('li > button.mh-media-list__row--interactive')!;
    expect(button.getAttribute('aria-label')).toBe('Play: Song, Artist');
    expect(button.querySelector('.mh-media-list__action')!.getAttribute('aria-hidden')).toBe('true');
    button.click();
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});
