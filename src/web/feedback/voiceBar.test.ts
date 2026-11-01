import { describe, expect, it, vi } from 'vitest';
import { VOICE_BAR_SAMPLES, createVoiceBar, pushVoiceLevel, voiceLevel } from '../index.ts';

describe('voice bar', () => {
  it('conversation: a mosaic of four tiles that follows the phase and level', () => {
    const onTap = vi.fn();
    const onEnd = vi.fn();
    const bar = createVoiceBar({ level: 0.5, onTap, onEnd, leading: document.createElement('button') });
    expect(bar.el.className).toBe('mh-voice-bar mh-voice-bar--conversation is-listening');
    expect([...bar.el.children].map((e) => e.classList[0])).toEqual(['mh-voice-bar__leading', 'mh-voice-bar__mosaic', 'mh-voice-bar__label', 'mh-icon-button']);
    const mosaic = bar.el.querySelector('.mh-voice-bar__mosaic') as HTMLButtonElement;
    expect(mosaic.tagName).toBe('BUTTON');
    expect(mosaic.querySelectorAll('.mh-voice-bar__tile').length).toBe(4);
    expect(mosaic.getAttribute('aria-label')).toBe('Listening…');
    expect(mosaic.style.getPropertyValue('--_level')).toBe('0.5');
    bar.setLevel(2);
    expect(mosaic.style.getPropertyValue('--_level')).toBe('1');
    bar.setPhase('thinking');
    expect(bar.el.className).toBe('mh-voice-bar mh-voice-bar--conversation is-thinking');
    expect(bar.el.querySelector('.mh-voice-bar__label')!.textContent).toBe('Thinking…');
    expect(mosaic.getAttribute('aria-label')).toBe('Thinking…');
    bar.setLabel('Working on it');
    expect(mosaic.getAttribute('aria-label')).toBe('Working on it');
    mosaic.click();
    expect(onTap).toHaveBeenCalled();
    const end = bar.el.querySelector('.mh-voice-bar__end') as HTMLButtonElement;
    expect(end.getAttribute('aria-label')).toBe('End conversation');
    end.click();
    expect(onEnd).toHaveBeenCalled();
  });

  it('conversation without onTap: a decorative mosaic', () => {
    const bar = createVoiceBar({ phase: 'idle' });
    const mosaic = bar.el.querySelector('.mh-voice-bar__mosaic')!;
    expect(mosaic.tagName).toBe('SPAN');
    expect(mosaic.getAttribute('aria-hidden')).toBe('true');
    expect(bar.el.querySelector('.mh-voice-bar__label')!.textContent).toBe('Tap to talk');
  });

  it('dictation: a waveform of the recent levels, cancel and done with a busy state', () => {
    const onCancel = vi.fn();
    const onDone = vi.fn();
    const bar = createVoiceBar({ variant: 'dictation', onCancel, onDone });
    const bars = [...bar.el.querySelectorAll<HTMLElement>('.mh-voice-bar__bar')];
    expect(bars.length).toBe(VOICE_BAR_SAMPLES);
    bar.setLevel(0.3);
    bar.setLevel(0.8);
    expect(bars.at(-1)!.style.getPropertyValue('--_v')).toBe('0.8');
    expect(bars.at(-2)!.style.getPropertyValue('--_v')).toBe('0.3');
    expect(bars.at(-3)!.style.getPropertyValue('--_v')).toBe('0');
    (bar.el.querySelector('.mh-voice-bar__cancel') as HTMLButtonElement).click();
    expect(onCancel).toHaveBeenCalled();
    const done = bar.el.querySelector('.mh-voice-bar__done') as HTMLButtonElement;
    done.click();
    expect(onDone).toHaveBeenCalled();
    bar.setBusy(true);
    expect(done.disabled).toBe(true);
    expect(done.getAttribute('aria-busy')).toBe('true');
    expect(done.querySelector('.mh-spinner')).not.toBeNull();
    bar.setBusy(false);
    expect(done.querySelector('.mh-spinner')).toBeNull();
    expect(done.hasAttribute('aria-busy')).toBe(false);
  });

  it('keeps the last levels, clamped and rounded', () => {
    expect(voiceLevel(-1)).toBe(0);
    expect(voiceLevel(0.456)).toBe(0.46);
    expect(voiceLevel(Number.NaN)).toBe(0);
    let levels: number[] = [];
    for (let i = 0; i < 30; i++) levels = pushVoiceLevel(levels, i / 30);
    expect(levels.length).toBe(VOICE_BAR_SAMPLES);
    expect(levels.at(-1)).toBe(0.97);
  });
});
