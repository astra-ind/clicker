// config.js
// Use a free public broker. EMQX is generally reliable for test workloads.
// For WebSockets, we use wss://broker.emqx.io:8084/mqtt
export const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// A fixed channel for this MVP
export const CHANNEL = 'pet-clicker-mvp-secret-channel-0987654321';
export const STATUS_TOPIC = `${CHANNEL}/status`;
export const TRIGGER_TOPIC = `${CHANNEL}/trigger`;
