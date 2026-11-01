import { act, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createComposer, createComposerAction, createVoiceBar } from '../web/index.ts';
import { Composer, ComposerAction, VoiceBar } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const REF_ATTRS = new Set(['id', 'for', 'aria-describedby', 'aria-labelledby']);

/** Tags, sorted attributes (generated ids by order of appearance, styles without spaces), text and textarea values. */
function shape(root: Element): string {
  const ids = new Map<string, string>();
  const ref = (v: string): string =>
    v
      .split(' ')
      .map((part) => {
        if (!ids.has(part)) ids.set(part, `#${ids.size + 1}`);
        return ids.get(part)!;
      })
      .join(' ');
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').trim();
    if (!(node instanceof Element)) return '';
    const attrs = [...node.attributes]
      .filter((a) => a.name !== 'style' && a.name !== 'value')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => `${a.name}=${REF_ATTRS.has(a.name) ? ref(a.value) : a.value}`);
    const style = node.getAttribute('style');
    if (style) attrs.push(`style=${style.replace(/\s+/g, '').replace(/;$/, '')}`);
    if (node instanceof HTMLTextAreaElement) attrs.push(`.value=${node.value}`);
    const children = node instanceof HTMLTextAreaElement ? '' : [...node.childNodes].map(walk).filter(Boolean).join('');
    return `<${node.tagName.toLowerCase()} ${attrs.join(' ')}>${children}</>`;
  };
  return walk(root);
}

function fromReact(element: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(element);
  return div.firstElementChild!;
}

const same = (element: ReactElement, web: Element): void => expect(shape(fromReact(element))).toBe(shape(web));
const noop = (): void => {};

describe('composer and voice bar: parity with the web renderer', () => {
  it('Composer, plain', () => {
    same(<Composer placeholder="Message" defaultValue="Hi" />, createComposer({ placeholder: 'Message', value: 'Hi' }).el);
  });

  it('Composer with slots, mode, suggestions and a disabled reason', () => {
    const mode = { label: 'Automation', hint: 'Describe it', icon: 'lightbulb', onClear: noop };
    same(
      <Composer
        name="message"
        enterSends="always"
        mode={mode}
        suggestions={['Lights off', 'Lock up']}
        disabled
        disabledReason="Not connected."
        onRetry={noop}
        leading={<ComposerAction kind="attach" />}
        trailing={
          <>
            <ComposerAction kind="mic" />
            <ComposerAction kind="send" label="Send message" disabled />
          </>
        }
      />,
      createComposer({
        name: 'message',
        enterSends: 'always',
        mode,
        suggestions: ['Lights off', 'Lock up'],
        disabled: true,
        disabledReason: 'Not connected.',
        onRetry: noop,
        leading: createComposerAction('attach').el,
        trailing: [createComposerAction('mic').el, createComposerAction('send', { label: 'Send message', disabled: true }).el],
      }).el,
    );
  });

  it('VoiceBar, conversation', () => {
    same(<VoiceBar level={0.42} onTap={noop} leading={<ComposerAction kind="attach" />} />, createVoiceBar({ level: 0.42, onTap: noop, leading: createComposerAction('attach').el }).el);
    same(<VoiceBar phase="idle" label="Paused" />, createVoiceBar({ phase: 'idle', label: 'Paused' }).el);
  });

  it('VoiceBar, dictation', () => {
    same(<VoiceBar variant="dictation" level={0.6} />, createVoiceBar({ variant: 'dictation', level: 0.6 }).el);
    same(<VoiceBar variant="dictation" phase="transcribing" busy />, createVoiceBar({ variant: 'dictation', phase: 'transcribing', busy: true }).el);
  });
});

describe('composer and voice bar: behaviour', () => {
  async function mount(element: ReactElement) {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(element));
    return { host, unmount: () => act(async () => root.unmount()) };
  }

  it('Composer stays controlled and sends on Enter', async () => {
    const sent = vi.fn();
    function Chat() {
      const [text, setText] = useState('Hello');
      return (
        <Composer
          value={text}
          onInput={setText}
          enterSends="always"
          onSubmit={(value) => {
            sent(value);
            setText('');
          }}
        />
      );
    }
    const { host, unmount } = await mount(<Chat />);
    const textarea = host.querySelector('textarea')!;
    expect(textarea.value).toBe('Hello');
    await act(async () => {
      textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    });
    expect(sent).toHaveBeenCalledWith('Hello');
    expect(textarea.value).toBe('');
    await unmount();
  });

  it('VoiceBar adds each new level to the waveform', async () => {
    let setLevel: (n: number) => void = noop;
    function Dictation() {
      const [level, set] = useState(0.2);
      setLevel = set;
      return <VoiceBar variant="dictation" level={level} />;
    }
    const { host, unmount } = await mount(<Dictation />);
    await act(async () => setLevel(0.9));
    const bars = [...host.querySelectorAll<HTMLElement>('.mh-voice-bar__bar')];
    expect(bars.at(-1)!.style.getPropertyValue('--_v')).toBe('0.9');
    expect(bars.at(-2)!.style.getPropertyValue('--_v')).toBe('0.2');
    await unmount();
  });
});
