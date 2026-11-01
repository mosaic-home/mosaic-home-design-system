import type { Story } from './types.ts';
import { foundationsStories } from './foundations.ts';
import { actionsStories } from './actions.ts';
import { textInputsStories } from './text-inputs.ts';
import { choiceInputsStories } from './choice-inputs.ts';
import { pickersStories } from './pickers.ts';
import { navigationStories } from './navigation.ts';
import { overlaysStories } from './overlays.ts';
import { feedbackStories } from './feedback.ts';
import { dataDisplayStories } from './data-display.ts';
import { chartsStories } from './charts.ts';
import { mediaStories } from './media.ts';
import { layoutStories } from './layout.ts';
import { homeStories } from './home.ts';

export type { Story } from './types.ts';

/** Every story. A catalogue entry is "ready" on the web only with a story here (catalog.test.ts). */
export const STORIES: readonly Story[] = [
  ...foundationsStories,
  ...actionsStories,
  ...textInputsStories,
  ...choiceInputsStories,
  ...pickersStories,
  ...navigationStories,
  ...overlaysStories,
  ...feedbackStories,
  ...dataDisplayStories,
  ...chartsStories,
  ...mediaStories,
  ...layoutStories,
  ...homeStories,
];
