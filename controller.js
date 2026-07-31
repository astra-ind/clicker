// controller.js
import { registerServiceWorker, setupInstallButton } from './app.js';
import { createMqttClient } from './mqtt-client.js';
import { getStatusTopic, getTriggerTopic } from './config.js';
import { Store } from './store.js';

registerServiceWorker();
setupInstallButton('installAppBtn');

const clickBtn = document.getElementById('clickBtn');
const doubleClickBtn = document.getElementById('doubleClickBtn');
const longVibeBtn = document.getElementById('longVibeBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const pairingCodeInput = document.getElementById('pairingCodeInput');

let receiversOnline = false;
const client = createMqttClient('controller');

// Initialize pairing code input from Store
let pairingCode = Store.get('pairingCode', '0987');
pairingCodeInput.value = pairingCode;

client.on('connect', () => {
  client.subscribe(getStatusTopic());
  updateStatus(false, true); // Connected to broker, waiting for receiver status
});

client.on('disconnect', () => {
  updateStatus(false, false);
});

client.on('offline', () => {
  updateStatus(false, false);
});

client.on('message', (topic, message) => {
  if (topic === getStatusTopic()) {
    receiversOnline = (message.toString() === 'online');
    updateStatus(receiversOnline, true);
  }
});

// Real-time channel switching when pairing code changes
let inputTimeout;
pairingCodeInput.addEventListener('input', (e) => {
  const newCode = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  pairingCodeInput.value = newCode;
  
  clearTimeout(inputTimeout);
  inputTimeout = setTimeout(() => {
    if (newCode.trim().length > 0) {
      const oldStatusTopic = getStatusTopic();
      
      // Save new code
      Store.set('pairingCode', newCode.trim().toUpperCase());
      const newStatusTopic = getStatusTopic();
      
      if (client && client.connected) {
        if (oldStatusTopic !== newStatusTopic) {
          client.unsubscribe(oldStatusTopic);
          client.subscribe(newStatusTopic);
          
          // Reset status and wait for receiver on the new channel
          receiversOnline = false;
          updateStatus(false, true);
        }
      }
    }
  }, 400);
});

function updateStatus(isReceiverOnline, isBrokerConnected) {
  statusIndicator.className = 'status-indicator';
  statusIndicator.style.color = '';
  statusIndicator.querySelector('.status-dot').style.backgroundColor = '';

  if (!isBrokerConnected) {
    statusIndicator.classList.add('status-offline');
    statusText.textContent = 'Disconnected';
    clickBtn.disabled = true;
    doubleClickBtn.disabled = true;
    longVibeBtn.disabled = true;
  } else if (isReceiverOnline) {
    statusIndicator.classList.add('status-online');
    statusText.textContent = 'Receiver Online';
    clickBtn.disabled = false;
    doubleClickBtn.disabled = false;
    longVibeBtn.disabled = false;
  } else {
    // We use a warning color for connected to broker but receiver offline
    statusIndicator.style.color = 'var(--warning-color)';
    statusIndicator.querySelector('.status-dot').style.backgroundColor = 'var(--warning-color)';
    statusText.textContent = 'Receiver Offline';
    clickBtn.disabled = true;
    doubleClickBtn.disabled = true;
    longVibeBtn.disabled = true;
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
    client.publish(getTriggerTopic(), 'trigger');
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
});

doubleClickBtn.addEventListener('click', () => {
  if (!doubleClickBtn.disabled) {
    client.publish(getTriggerTopic(), 'double');
    if (navigator.vibrate) {
      // Shorter quick double-vibration
      navigator.vibrate([40, 40, 40]);
    }
  }
});

longVibeBtn.addEventListener('click', () => {
  if (!longVibeBtn.disabled) {
    client.publish(getTriggerTopic(), 'longvibe');
    if (navigator.vibrate) {
      // Strong local long vibration on the controller itself
      navigator.vibrate(600);
    }
  }
});
