import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createButton, createIconButton } from '../web/index.ts';
import { Button, IconButton, ThemeProvider, useTokens } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('parity with the web renderer', () => {
  it('Button renders the same classes as createButton', () => {
    const html = renderToStaticMarkup(
      <Button variant="tonal" size="large" icon="check">
        Save
      </Button>,
    );
    const web = createButton({ label: 'Save', variant: 'tonal', size: 'large', icon: 'check' }).el;
    const div = document.createElement('div');
    div.innerHTML = html;
    expect(div.firstElementChild!.className).toBe(web.className);
    expect(div.querySelector('.mh-button__label')!.textContent).toBe('Save');
  });

  it('IconButton renders the same classes as createIconButton', () => {
    const div = document.createElement('div');
    div.innerHTML = renderToStaticMarkup(<IconButton icon="play" label="Play" filled tone="accent" />);
    expect(div.firstElementChild!.className).toBe(createIconButton({ icon: 'play', label: 'Play', filled: true, tone: 'accent' }).el.className);
  });
});

describe('ThemeProvider', () => {
  it('applies the theme locally and provides tokens', async () => {
    let seen = '';
    function Probe() {
      seen = useTokens().theme.id;
      return null;
    }
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => {
      root.render(
        <ThemeProvider theme="nightstand" scope="local" deviceClass="tablet">
          <Probe />
        </ThemeProvider>,
      );
    });
    const scoped = host.querySelector<HTMLElement>('.mh-root')!;
    expect(scoped.dataset.mhTheme).toBe('nightstand');
    expect(scoped.dataset.mhDevice).toBe('tablet');
    expect(seen).toBe('nightstand');
    await act(async () => root.unmount());
  });
});
