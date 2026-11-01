// Helpers shared by the components of this group that show a list of options (command bar, multi-select,
// transfer list): moving the active option, matching typed text, and an action that runs again while held.

/** Lower case without accents, for matching typed text against labels. */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

/** Whether `label` contains every word of `query` (case and accents ignored). An empty query matches. */
export function matchesQuery(label: string, query: string): boolean {
  const q = normalizeSearch(query);
  if (q === '') return true;
  const l = normalizeSearch(label);
  return q.split(/\s+/).every((word) => l.includes(word));
}

/**
 * The index of the next enabled item from `from` in direction `delta`, or `from` when there is none. `from = -1`
 * with `delta = 1` finds the first; `from = items.length` with `delta = -1` the last. With `wrap`, it continues
 * from the other end.
 */
export function nextEnabled(items: readonly { disabled?: boolean }[], from: number, delta: 1 | -1, wrap = false): number {
  const n = items.length;
  if (n === 0) return -1;
  let i = from;
  for (let tries = 0; tries < n; tries++) {
    i += delta;
    if (i < 0 || i >= n) {
      if (!wrap) return from;
      i = i < 0 ? n - 1 : 0;
    }
    if (!items[i]!.disabled) return i;
  }
  return from;
}

/** Scrolls an option into view inside its list, when the platform can. */
export function revealOption(option: Element | null | undefined): void {
  option?.scrollIntoView?.({ block: 'nearest' });
}

const HOLD_DELAY = 400;
const HOLD_RATE = 70;

/**
 * Runs `action` when the button is pressed, and again and again while a pointer holds it (after a short delay).
 * Clicks from the keyboard or a screen reader run it once. Returns a function that removes the listeners.
 */
export function holdToRepeat(button: HTMLButtonElement, action: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let fromPointer = false;
  const stop = (): void => {
    clearTimeout(timer);
    timer = undefined;
  };
  const repeat = (delay: number): void => {
    timer = setTimeout(() => {
      if (button.disabled) return stop();
      action();
      repeat(HOLD_RATE);
    }, delay);
  };
  const down = (event: PointerEvent): void => {
    if (event.button !== 0 || button.disabled) return;
    fromPointer = true;
    action();
    stop();
    repeat(HOLD_DELAY);
  };
  // A pointer press already ran the action; a click from the keyboard or a screen reader (detail 0) runs it.
  const click = (event: MouseEvent): void => {
    const pressed = fromPointer;
    fromPointer = false;
    if (pressed && event.detail > 0) return;
    action();
  };
  // Keeps focus where it was (the value), so typing and arrow keys go on working.
  const keepFocus = (event: MouseEvent): void => event.preventDefault();
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', stop);
  button.addEventListener('pointercancel', stop);
  button.addEventListener('pointerleave', stop);
  button.addEventListener('mousedown', keepFocus);
  button.addEventListener('click', click);
  return () => {
    stop();
    button.removeEventListener('pointerdown', down);
    button.removeEventListener('pointerup', stop);
    button.removeEventListener('pointercancel', stop);
    button.removeEventListener('pointerleave', stop);
    button.removeEventListener('mousedown', keepFocus);
    button.removeEventListener('click', click);
  };
}
