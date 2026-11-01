import { describe, expect, it } from 'vitest';
import { avatarInitials, avatarTone, cardMediaStyle, carouselDotClass, createAvatar, createAvatarGroup, createCard, createCarousel, createList, createPropertyList, createStatTile, createTile, createTileGrid } from './index.ts';

describe('card', () => {
  it('renders header, body and footer', () => {
    const c = createCard({ title: 'Living room', subtitle: '3 lights on', icon: 'home', body: 'Body', footer: [document.createElement('button')] });
    expect(c.el.className).toBe('mh-card');
    expect(c.el.querySelector('h3.mh-card__title')!.textContent).toBe('Living room');
    expect(c.el.querySelector('.mh-card__subtitle')!.textContent).toBe('3 lights on');
    expect(c.el.querySelector('.mh-card__body')!.textContent).toBe('Body');
    expect(c.el.querySelector('.mh-card__footer button')).not.toBeNull();
    expect(c.el.hasAttribute('role')).toBe(false);
    c.setTitle('Kitchen');
    expect(c.el.querySelector('.mh-card__title')!.textContent).toBe('Kitchen');
  });

  it('is a keyboard-operable button when pressable', () => {
    let presses = 0;
    const c = createCard({ title: 'Kitchen', variant: 'flat', onClick: () => presses++ });
    expect(c.el.className).toBe('mh-card mh-card--flat mh-card--interactive');
    expect(c.el.getAttribute('role')).toBe('button');
    expect(c.el.tabIndex).toBe(0);
    c.el.click();
    c.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    c.el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    c.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(presses).toBe(3);
  });
});

describe('list', () => {
  it('renders plain, button and link rows', () => {
    let clicks = 0;
    const l = createList({
      label: 'Devices',
      inset: true,
      items: [
        { title: 'Kitchen light', subtitle: 'On', icon: 'lightbulb', trailing: '80%' },
        { title: 'Wi-Fi', chevron: true, onClick: () => clicks++ },
        { title: 'Help', href: '#help', current: true },
      ],
    });
    expect(l.el.tagName).toBe('UL');
    expect(l.el.className).toBe('mh-list mh-list--dividers mh-list--inset');
    expect(l.el.getAttribute('aria-label')).toBe('Devices');
    const rows = l.el.querySelectorAll('.mh-list-row');
    expect(rows[0]!.tagName).toBe('DIV');
    expect(rows[0]!.querySelector('.mh-list-row__trailing')!.textContent).toBe('80%');
    expect(rows[1]!.tagName).toBe('BUTTON');
    expect(rows[1]!.className).toBe('mh-list-row mh-list-row--interactive');
    expect(rows[1]!.querySelector('.mh-list-row__chevron')).not.toBeNull();
    (rows[1] as HTMLButtonElement).click();
    expect(clicks).toBe(1);
    expect(rows[2]!.tagName).toBe('A');
    expect(rows[2]!.getAttribute('aria-current')).toBe('true');
    l.setItems([{ title: 'Only' }]);
    expect(l.el.children.length).toBe(1);
  });
});

describe('avatar', () => {
  it('derives initials and a stable tone', () => {
    expect(avatarInitials('Living room')).toBe('LR');
    expect(avatarInitials('guest')).toBe('G');
    expect(avatarInitials('  ')).toBe('?');
    expect(avatarTone('Guest')).toBe(avatarTone('Guest'));
    expect(avatarTone('Guest')).toBeGreaterThanOrEqual(1);
    expect(avatarTone('Guest')).toBeLessThanOrEqual(6);
  });

  it('names itself with its status', () => {
    const a = createAvatar({ name: 'Guest', size: 'large', status: 'online' });
    expect(a.el.getAttribute('role')).toBe('img');
    expect(a.el.getAttribute('aria-label')).toBe('Guest, online');
    expect(a.el.classList.contains('mh-avatar--lg')).toBe(true);
    expect(a.el.querySelector('.mh-avatar__status--online')).not.toBeNull();
    a.setStatus(null);
    expect(a.el.querySelector('.mh-avatar__status')).toBeNull();
    expect(a.el.getAttribute('aria-label')).toBe('Guest');
  });

  it('collapses a group into +N', () => {
    const g = createAvatarGroup({ avatars: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }], max: 2 });
    expect(g.el.querySelectorAll('.mh-avatar').length).toBe(3);
    expect(g.el.querySelector('.mh-avatar--more')!.textContent).toBe('+2');
  });
});

describe('tiles', () => {
  it('toggles on press', () => {
    const seen: boolean[] = [];
    const t = createTile({ icon: 'lightbulb', label: 'Kitchen light', on: false, onToggle: (on) => seen.push(on) });
    expect(t.el.getAttribute('aria-pressed')).toBe('false');
    t.el.click();
    expect(t.el.getAttribute('aria-pressed')).toBe('true');
    expect(t.el.classList.contains('is-on')).toBe(true);
    expect(seen).toEqual([true]);
  });

  it('leaves action tiles unpressed', () => {
    expect(createTile({ icon: 'camera', label: 'Camera' }).el.hasAttribute('aria-pressed')).toBe(false);
  });

  it('renders stat tiles and grids', () => {
    const s = createStatTile({ label: 'Battery', value: 82, unit: '%', trend: 'down' });
    expect(s.el.querySelector('.mh-tile__number')!.textContent).toBe('82');
    expect(s.el.querySelector('.mh-tile__trend svg')!.getAttribute('aria-label')).toBe('falling');
    s.setValue(80);
    expect(s.el.querySelector('.mh-tile__number')!.textContent).toBe('80');
    expect(createTileGrid([s.el], { size: 'small' }).el.className).toBe('mh-tile-grid mh-tile-grid--sm');
  });
});

describe('card as a link', () => {
  it('renders media, eyebrow and a clamped title inside an anchor', () => {
    const img = document.createElement('img');
    const c = createCard({ href: 'https://example.com/a', target: '_blank', media: img, eyebrow: 'Example Times · 2 h', title: 'A headline', titleLines: 3, body: 'Snippet' });
    expect(c.el.tagName).toBe('A');
    expect(c.el.className).toBe('mh-card mh-card--interactive');
    expect(c.el.getAttribute('href')).toBe('https://example.com/a');
    expect(c.el.getAttribute('rel')).toBe('noopener noreferrer');
    expect(c.el.hasAttribute('role')).toBe(false);
    expect(c.el.firstElementChild!.className).toBe('mh-card__media');
    expect(c.el.querySelector('.mh-card__media > img')).toBe(img);
    expect(c.el.querySelector('.mh-card__heading')!.firstElementChild!.className).toBe('mh-card__eyebrow');
    expect(c.el.querySelector('h3')!.className).toBe('mh-card__title mh-clamp-3');
  });
});

describe('carousel', () => {
  const card = (text: string): HTMLElement => createCard({ title: text }).el;

  it('wraps each item in a labelled slide inside a labelled region', () => {
    const c = createCarousel({ label: 'Results', items: [card('One'), card('Two'), card('Three')] });
    expect(c.el.className).toBe('mh-carousel');
    expect(c.el.getAttribute('role')).toBe('region');
    expect(c.el.getAttribute('aria-roledescription')).toBe('carousel');
    expect(c.el.getAttribute('aria-label')).toBe('Results');
    expect(c.track.className).toBe('mh-carousel__track');
    expect(c.track.tabIndex).toBe(0);
    const slides = c.track.querySelectorAll('.mh-carousel__slide');
    expect(slides.length).toBe(3);
    expect(slides[1]!.getAttribute('role')).toBe('group');
    expect(slides[1]!.getAttribute('aria-roledescription')).toBe('slide');
    expect(slides[1]!.getAttribute('aria-label')).toBe('2 of 3');
    const nav = c.el.querySelectorAll<HTMLButtonElement>('.mh-carousel__nav');
    expect(nav[0]!.className).toContain('mh-icon-button');
    expect(nav[0]!.getAttribute('aria-label')).toBe('Previous');
    expect(nav[1]!.getAttribute('aria-label')).toBe('Next');
    c.setItems([card('Only')]);
    expect(c.track.querySelector('.mh-carousel__slide')!.getAttribute('aria-label')).toBe('1 of 1');
    c.destroy();
  });

  it('steps one slide on arrow keys and buttons, and disables the buttons at the ends', () => {
    const c = createCarousel({ label: 'Results', items: [card('One'), card('Two'), card('Three')] });
    const track = c.track;
    Object.defineProperty(track, 'clientWidth', { configurable: true, value: 300 });
    Object.defineProperty(track, 'scrollWidth', { configurable: true, value: 800 });
    for (const slide of track.querySelectorAll('.mh-carousel__slide')) Object.defineProperty(slide, 'offsetWidth', { configurable: true, value: 240 });
    const moves: number[] = [];
    track.scrollBy = ((opts: ScrollToOptions) => moves.push(opts.left ?? 0)) as typeof track.scrollBy;
    const [prev, next] = Array.from(c.el.querySelectorAll<HTMLButtonElement>('.mh-carousel__nav'));

    track.dispatchEvent(new Event('scroll'));
    expect(prev!.disabled).toBe(true);
    expect(next!.disabled).toBe(false);

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    next!.click();
    expect(moves.length).toBe(3);
    expect(moves[0]).toBeGreaterThanOrEqual(240);
    expect(moves[1]).toBeLessThanOrEqual(-240);
    expect(moves[2]).toBeGreaterThan(0);

    track.scrollLeft = 500;
    track.dispatchEvent(new Event('scroll'));
    expect(prev!.disabled).toBe(false);
    expect(next!.disabled).toBe(true);
  });
});

describe('property list', () => {
  it('renders label / value rows', () => {
    const strong = document.createElement('strong');
    strong.textContent = 'Printing';
    const p = createPropertyList({ items: [{ label: 'Status', value: strong }, { label: 'Progress', value: '42 %' }], dense: true });
    expect(p.el.tagName).toBe('DL');
    expect(p.el.className).toBe('mh-property-list mh-property-list--dense');
    const rows = p.el.querySelectorAll('.mh-property-list__row');
    expect(rows.length).toBe(2);
    expect(rows[0]!.querySelector('dt.mh-property-list__label')!.textContent).toBe('Status');
    expect(rows[0]!.querySelector('dd.mh-property-list__value > strong')).toBe(strong);
    expect(rows[1]!.querySelector('dd')!.textContent).toBe('42 %');
    p.setItems([{ label: 'Nozzle', value: '215 °C' }]);
    expect(p.el.children.length).toBe(1);
    expect(createPropertyList({ items: [] }).el.className).toBe('mh-property-list');
  });
});

describe('card media aspect and carousel dots', () => {
  it('sets a custom media aspect', () => {
    expect(cardMediaStyle(2)).toBe('aspect-ratio: 2');
    expect(cardMediaStyle(undefined)).toBeNull();
    const card = createCard({ title: 'News', media: document.createElement('img'), mediaAspect: 2.4 });
    expect(card.el.querySelector<HTMLElement>('.mh-card__media')!.style.aspectRatio).toMatch(/^2.4/);
  });

  it('marks the current dot and shows none when everything fits', () => {
    expect(carouselDotClass(true)).toBe('mh-carousel__dot is-current');
    expect(carouselDotClass(false)).toBe('mh-carousel__dot');
    const c = createCarousel({ label: 'Results', items: [document.createElement('div'), document.createElement('div')] });
    expect(c.el.querySelector('.mh-carousel__dots')).toBeNull();
  });
});
