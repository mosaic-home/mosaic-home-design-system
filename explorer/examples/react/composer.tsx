import { useState } from 'react';
import { Composer, ComposerAction } from '@mosaic-home/design-system/react';

export function ComposerExample() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const send = (value: string) => {
    if (!value.trim()) return;
    setSent((messages) => [...messages, value]);
    setText('');
  };
  return (
    <>
      <ol>
        {sent.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ol>
      <Composer
        placeholder="Ask about your home"
        value={text}
        onInput={(value) => setText(value)}
        onSubmit={send}
        suggestions={['Turn off all lights', 'Is the back door locked?', 'Warmer in the kitchen']}
        onSuggestion={setText}
        leading={<ComposerAction kind="attach" />}
        trailing={<ComposerAction kind="send" onClick={() => send(text)} />}
      />
    </>
  );
}
