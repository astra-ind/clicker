// controller.js
import { registerServiceWorker, setupInstallButton } from './app.js';
import { createMqttClient } from './mqtt-client.js';
import { STATUS_TOPIC, TRIGGER_TOPIC } from './config.js';

registerServiceWorker();
setupInstallButton('installAppBtn');

const clickBtn = document.getElementById('clickBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

let receiversOnline = false;
const client = createMqttClient('controller');

client.on('connect', () => {
  client.subscribe(STATUS_TOPIC);
  updateStatus(false, true); // Connected to broker, waiting for receiver status
});

client.on('disconnect', () => {
  updateStatus(false, false);
});

client.on('offline', () => {
  updateStatus(false, false);
});

client.on('message', (topic, message) => {
  if (topic === STATUS_TOPIC) {
    receiversOnline = (message.toString() === 'online');
    updateStatus(receiversOnline, true);
  }
});

function updateStatus(isReceiverOnline, isBrokerConnected) {
  statusIndicator.className = 'status-indicator';
  statusIndicator.style.color = '';
  statusIndicator.querySelector('.status-dot').style.backgroundColor = '';

  if (!isBrokerConnected) {
    statusIndicator.classList.add('status-offline');
    statusText.textContent = 'Disconnected';
    clickBtn.disabled = true;
  } else if (isReceiverOnline) {
    statusIndicator.classList.add('status-online');
    statusText.textContent = 'Receiver Online';
    clickBtn.disabled = false;
  } else {
    // We use a warning color for connected to broker but receiver offline
    statusIndicator.style.color = 'var(--warning-color)';
    statusIndicator.querySelector('.status-dot').style.backgroundColor = 'var(--warning-color)';
    statusText.textContent = 'Receiver Offline';
    clickBtn.disabled = true;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (client && !client.connected) {
      client.reconnect();
    }
  }
});

clickBtn.addEventListener('click', () => {
  if (!clickBtn.disabled) {
    client.publish(TRIGGER_TOPIC, 'trigger');
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
});
