import { useState } from 'react';
import { mdiBlindsHorizontal, mdiCeilingLight } from '@mdi/js';
import { AssistReply } from '@mosaic-home/design-system/react';

type Stage = 'done' | 'undoing' | 'undone';

export function AssistReplyExample() {
  const [stage, setStage] = useState<Stage>('done');
  const undone = stage === 'undone';
  const light = undone ? { state: 'On', active: true, tone: 'warm' as const } : { state: 'Off' };
  const undo = () => {
    setStage('undoing');
    setTimeout(() => setStage('undone'), 900);
  };
  return (
    <AssistReply
      heard="Turn off the living room lights and close the blinds"
      reply="Done. I turned off 2 lights and closed the blinds."
      changes={[
        { id: 'ceiling', name: 'Ceiling light', icon: mdiCeilingLight, ...light },
        { id: 'lamp', name: 'Reading lamp', icon: 'lightbulb', ...light },
        { id: 'blinds', name: 'Blinds', icon: mdiBlindsHorizontal, state: undone ? 'Open' : 'Closing' },
      ]}
      undoing={stage === 'undoing'}
      undone={undone}
      onUndo={undo}
    />
  );
}
