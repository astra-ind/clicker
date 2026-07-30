// config.js
import { Store } from './store.js';

// Use a free public broker. EMQX is generally reliable for test workloads.
// For WebSockets, we use wss://broker.emqx.io:8084/mqtt
export const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// Returns the dynamic channel based on local storage pairing code
export function getChannel() {
  let code = Store.get('pairingCode');
  if (!code) {
    code = '0987'; // default pairing code so it works out of the box
    Store.set('pairingCode', code);
  }
  // Sanitize the code to prevent MQTT wildcard/hierarchy issues
  return `pet-clicker-mvp-channel-${code.trim().toUpperCase()}`;
}

export function getStatusTopic() {
  return `${getChannel()}/status`;
}

export function getTriggerTopic() {
  return `${getChannel()}/trigger`;
}

// A fixed legacy channel for backward compatibility
export const CHANNEL = 'pet-clicker-mvp-secret-channel-0987654321';
export const STATUS_TOPIC = `${CHANNEL}/status`;
export const TRIGGER_TOPIC = `${CHANNEL}/trigger`;

