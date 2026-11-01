import type { Tokens } from '../../../src/tokens/types.ts';

/** One explorer page per catalogue entry. `id` is the catalogue id; `render` builds the demo with the web renderer. */
export interface Story {
  id: string;
  render(tokens: Tokens): HTMLElement;
}
