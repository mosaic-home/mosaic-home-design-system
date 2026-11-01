import { homeClimateEnergyReady } from './home-climate-energy.ts';
import { homeSecurityReady } from './home-security.ts';
import { homeRoomsReady } from './home-rooms.ts';
import { homeMediaVoiceReady } from './home-media-voice.ts';
import { homeInfoReady } from './home-info.ts';

/** Catalogue ids of the home group that the web renderer has built (each needs an explorer story). */
export const homeReady: readonly string[] = ['media-player', 'camera-tile', 'weather-now', 'agenda', 'control-card', 'thermostat', 'light-control', 'position-control', 'lock-control', ...homeClimateEnergyReady, ...homeSecurityReady, ...homeRoomsReady, ...homeMediaVoiceReady, ...homeInfoReady];
