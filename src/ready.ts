// Which catalogue entries the web renderer has built, one file per group (src/ready/<group>.ts).
import { foundationsReady } from './ready/foundations.ts';
import { actionsReady } from './ready/actions.ts';
import { textInputsReady } from './ready/text-inputs.ts';
import { choiceInputsReady } from './ready/choice-inputs.ts';
import { pickersReady } from './ready/pickers.ts';
import { navigationReady } from './ready/navigation.ts';
import { overlaysReady } from './ready/overlays.ts';
import { feedbackReady } from './ready/feedback.ts';
import { dataDisplayReady } from './ready/data-display.ts';
import { chartsReady } from './ready/charts.ts';
import { mediaReady } from './ready/media.ts';
import { layoutReady } from './ready/layout.ts';
import { homeReady } from './ready/home.ts';

export const WEB_READY_IDS: readonly string[] = [
  ...foundationsReady,
  ...actionsReady,
  ...textInputsReady,
  ...choiceInputsReady,
  ...pickersReady,
  ...navigationReady,
  ...overlaysReady,
  ...feedbackReady,
  ...dataDisplayReady,
  ...chartsReady,
  ...mediaReady,
  ...layoutReady,
  ...homeReady,
];
