// receiver.js
import { registerServiceWorker, setupInstallButton } from './app.js';
import { createMqttClient } from './mqtt-client.js';
import { STATUS_TOPIC, TRIGGER_TOPIC } from './config.js';
import { getAudioContext, playClick, preloadSounds } from './audio.js';
import { Store } from './store.js';

registerServiceWorker();
setupInstallButton('installAppBtn');

// State
let outputMode = Store.get('outputMode', 'both');
let soundType = Store.get('soundType', 'mechanical');
let volume = Store.get('volume', 1);
let keepAwake = Store.get('keepAwake', false);
let lastClickTime = Store.get('lastClickTime', null);

// DOM Elements
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const lastTriggerTimeEl = document.getElementById('lastTriggerTime');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const keepAwakeToggle = document.getElementById('keepAwakeToggle');
const testBtn = document.getElementById('testBtn');
const outputModeButtons = document.querySelectorAll('#outputModeGroup button');
const soundProfileButtons = document.querySelectorAll('#soundProfileGroup button');
const soundProfileContainer = document.getElementById('soundProfileContainer');
const volumeContainer = document.getElementById('volumeContainer');

// Initialize UI from state
function updateUI() {
  volumeSlider.value = volume;
  volumeValue.textContent = `${Math.round(volume * 100)}%`;
  keepAwakeToggle.checked = keepAwake;
  
  if (lastClickTime) {
    lastTriggerTimeEl.textContent = new Date(lastClickTime).toLocaleTimeString();
  } else {
    lastTriggerTimeEl.textContent = 'Never';
  }

  outputModeButtons.forEach(btn => {
    if (btn.dataset.mode === outputMode) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  soundProfileButtons.forEach(btn => {
    if (btn.dataset.sound === soundType) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  if (outputMode === 'vibration') {
    soundProfileContainer.classList.add('disabled');
    volumeContainer.classList.add('disabled');
  } else {
    soundProfileContainer.classList.remove('disabled');
    volumeContainer.classList.remove('disabled');
  }
}
updateUI();

// Preload audio files
preloadSounds();

// Event Listeners for UI
outputModeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    outputMode = btn.dataset.mode;
    Store.set('outputMode', outputMode);
    updateUI();
  });
});

soundProfileButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    soundType = btn.dataset.sound;
    Store.set('soundType', soundType);
    updateUI();
  });
});

volumeSlider.addEventListener('input', (e) => {
  volume = parseFloat(e.target.value);
  Store.set('volume', volume);
  updateUI();
});

keepAwakeToggle.addEventListener('change', (e) => {
  keepAwake = e.target.checked;
  Store.set('keepAwake', keepAwake);
  handleWakeLock();
});

// Trigger Action
function triggerAction() {
  lastClickTime = Date.now();
  Store.set('lastClickTime', lastClickTime);
  updateUI();
  
  if (outputMode === 'click' || outputMode === 'both') {
    playClick(soundType, volume);
  }
  
  if ((outputMode === 'vibration' || outputMode === 'both') && navigator.vibrate) {
    navigator.vibrate(200);
  }
}

testBtn.addEventListener('click', () => {
  getAudioContext(); // Ensure audio context is started
  triggerAction();
});

// Click anywhere to ensure audio context
document.body.addEventListener('click', () => {
  getAudioContext();
}, { once: true });

// Wake Lock
let wakeLock = null;
async function handleWakeLock() {
  if (keepAwake && 'wakeLock' in navigator) {
    try {
      if (!wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
        });
      }
    } catch (err) {
      console.error('Wake Lock error:', err);
    }
  } else {
    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  }
}
handleWakeLock();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (keepAwake) handleWakeLock();
    // Resume audio immediately when the page becomes active again
    getAudioContext();
    
    // Restore the MQTT connection automatically after browser sleep
    if (client && !client.connected) {
      client.reconnect();
    }
  }
});

// MQTT
const client = createMqttClient('receiver');

client.on('connect', () => {
  statusIndicator.className = 'status-indicator status-online';
  statusText.textContent = 'Online';
  
  client.subscribe(TRIGGER_TOPIC);
  client.publish(STATUS_TOPIC, 'online', { retain: true });
});

client.on('disconnect', () => {
  statusIndicator.className = 'status-indicator status-offline';
  statusText.textContent = 'Offline';
});

client.on('offline', () => {
  statusIndicator.className = 'status-indicator status-offline';
  statusText.textContent = 'Offline';
});

client.on('message', (topic, message) => {
  if (topic === TRIGGER_TOPIC) {
    triggerAction();
  }
});

window.addEventListener('beforeunload', () => {
  if (client.connected) {
    client.publish(STATUS_TOPIC, 'offline', { retain: true });
    client.end(true);
  }
});
