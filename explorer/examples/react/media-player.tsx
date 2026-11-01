import { useState } from 'react';
import { MediaPlayer } from '@mosaic-home/design-system/react';

export function MediaPlayerExample() {
  const [playing, setPlaying] = useState(true);
  const [position, setPosition] = useState(83);
  const [volume, setVolume] = useState(0.45);
  return (
    <MediaPlayer
      title="Lanterns Over the Quay"
      subtitle="Marlow and the Tidelines"
      art="/covers/lanterns-over-the-quay.jpg"
      state={playing ? 'playing' : 'paused'}
      position={position}
      duration={227}
      volume={volume}
      can={{ play: true, pause: true, next: true, previous: true, volume: true, seek: true }}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onNext={() => setPosition(0)}
      onPrevious={() => setPosition(0)}
      onSeek={setPosition}
      onVolume={setVolume}
    />
  );
}
