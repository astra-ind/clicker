import mqtt from 'mqtt';

// Use a free public broker. EMQX is generally reliable for test workloads.
// For WebSockets, we use wss://broker.emqx.io:8084/mqtt
const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// A fixed channel for this MVP
export const CHANNEL = 'pet-clicker-mvp-secret-channel-0987654321';
export const STATUS_TOPIC = `${CHANNEL}/status`;
export const TRIGGER_TOPIC = `${CHANNEL}/trigger`;

// We initialize the client but do not auto-connect immediately to save resources
export const client = mqtt.connect(BROKER_URL, {
  autoConnect: false,
  clientId: `pet-clicker-${Math.random().toString(16).substring(2, 10)}`,
  will: {
    topic: STATUS_TOPIC,
    payload: 'offline',
    qos: 1,
    retain: false,
  }
});
