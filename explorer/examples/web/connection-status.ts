import { createConnectionStatus } from '@mosaic-home/design-system/web';

const status = createConnectionStatus({
  state: 'connecting',
  server: 'homeassistant.local',
  variant: 'banner',
  onRetry: () => connect(),
});

let retry: ReturnType<typeof setTimeout> | undefined;

function connect(): void {
  clearTimeout(retry);
  status.update({ state: 'connecting', retryAt: null });
  const socket = new WebSocket('ws://homeassistant.local:8123/socket');
  socket.onopen = () => status.update({ state: 'connected' });
  socket.onclose = () => {
    status.update({ state: 'reconnecting', retryAt: Date.now() + 10_000 });
    retry = setTimeout(connect, 10_000);
  };
}

connect();
document.body.append(status.el);
