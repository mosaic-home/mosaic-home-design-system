import { createComposer, createComposerAction } from '@mosaic-home/design-system/web';

const sent = document.createElement('ol');

const composer = createComposer({
  placeholder: 'Ask about your home',
  leading: createComposerAction('attach').el,
  trailing: createComposerAction('send', { onClick: () => composer.submit() }).el,
  suggestions: ['Turn off all lights', 'Is the back door locked?', 'Warmer in the kitchen'],
  onSuggestion: (text) => {
    composer.setValue(text);
    composer.focus();
  },
  onSubmit: (text) => {
    sent.append(Object.assign(document.createElement('li'), { textContent: text }));
    composer.setValue('');
    composer.focus();
  },
});

document.body.append(sent, composer.el);
