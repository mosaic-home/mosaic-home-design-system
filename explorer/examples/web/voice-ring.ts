import { createVoiceRing } from '@mosaic-home/design-system/web';

const ring = createVoiceRing({ phase: 'idle', onTap: () => void listen() });

/** Listens for four seconds, driving the ring from the microphone level. */
async function listen(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
  if (!stream) {
    ring.setPhase('error');
    ring.setDetail('The microphone isn’t available.');
    return;
  }
  ring.setPhase('listening');
  ring.setDetail(undefined);
  const audio = new AudioContext();
  const analyser = audio.createAnalyser();
  audio.createMediaStreamSource(stream).connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);
  const stopAt = Date.now() + 4000;
  const frame = (): void => {
    analyser.getByteTimeDomainData(samples);
    ring.setLevel(samples.reduce((peak, s) => Math.max(peak, Math.abs(s - 128)), 0) / 128);
    if (Date.now() < stopAt) {
      requestAnimationFrame(frame);
      return;
    }
    stream.getTracks().forEach((track) => track.stop());
    void audio.close();
    ring.setPhase('thinking');
    setTimeout(() => ring.setPhase('idle'), 1500);
  };
  frame();
}

document.body.append(ring.el);
