// mqtt-client.js
import { BROKER_URL, STATUS_TOPIC } from './config.js';

export function createMqttClient(role) {
  const clientId = `pet-clicker-${Math.random().toString(16).substring(2, 10)}`;
  const options = {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };

  if (role === 'receiver') {
    options.will = {
      topic: STATUS_TOPIC,
      payload: 'offline',
      qos: 1,
      retain: true,
    };
  }

  // mqtt is available globally from CDN script tag
  const client = mqtt.connect(BROKER_URL, options);
  
  client.on('error', (err) => {
    console.error('MQTT error: ', err);
  });

  return client;
}
