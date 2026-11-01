import { useState } from 'react';
import { TextArea } from '@mosaic-home/design-system/react';

export function TextAreaExample() {
  const [text, setText] = useState('Dinner is ready in ten minutes.');
  return (
    <TextArea
      label="Announcement"
      placeholder="What should the speakers say?"
      error={text.trim() ? undefined : 'Write a message before sending.'}
      maxLength={140}
      showCount
      maxRows={6}
      value={text}
      onChange={(event) => setText(event.target.value)}
    />
  );
}
