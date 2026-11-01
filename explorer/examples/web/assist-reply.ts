import { mdiBlindsHorizontal, mdiCeilingLight } from '@mdi/js';
import { createAssistReply, type AssistReplyOptions } from '@mosaic-home/design-system/web';

const answer: AssistReplyOptions = {
  heard: 'Turn off the living room lights and close the blinds',
  reply: 'Done. I turned off 2 lights and closed the blinds.',
  changes: [
    { id: 'ceiling', name: 'Ceiling light', icon: mdiCeilingLight, state: 'Off' },
    { id: 'lamp', name: 'Reading lamp', icon: 'lightbulb', state: 'Off' },
    { id: 'blinds', name: 'Living room blinds', icon: mdiBlindsHorizontal, state: 'Closing', active: true },
  ],
};

const undo = (): void => {
  reply.update({ ...answer, undoing: true });
  setTimeout(
    () =>
      reply.update({
        ...answer,
        undone: true,
        changes: [
          { id: 'ceiling', name: 'Ceiling light', icon: mdiCeilingLight, state: 'On', active: true, tone: 'warm' },
          { id: 'lamp', name: 'Reading lamp', icon: 'lightbulb', state: 'On', active: true, tone: 'warm' },
          { id: 'blinds', name: 'Living room blinds', icon: mdiBlindsHorizontal, state: 'Open' },
        ],
      }),
    900,
  );
};

const reply = createAssistReply({ ...answer, onUndo: undo });

document.body.append(reply.el);
