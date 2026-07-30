// audio.js
export const ClickSoundTypes = ['classic', 'bell', 'whistle', 'mechanical', 'soft', 'loud'];

let audioCtx = null;
const rawBuffers = {};
const audioBuffers = {};

/**
 * Returns the active AudioContext.
 * Note: Should be called within a user-gesture handler to ensure it starts in a 'running' state.
 */
export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(err => {
      console.warn('AudioContext resume failed (this is normal if no user gesture has occurred yet):', err);
    });
  }
  return audioCtx;
}

/**
 * Preloads the audio files as raw ArrayBuffers.
 * Safe to run on page load since it does NOT touch the AudioContext or trigger autoplay blocks.
 */
export async function preloadSounds() {
  const loadSound = async (type) => {
    try {
      const response = await fetch(`assets/${type}.wav`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      rawBuffers[type] = arrayBuffer;
      console.log(`Successfully preloaded raw sound file: ${type}`);
    } catch (e) {
      console.error(`Failed to preload raw ${type} sound:`, e);
    }
  };

  await Promise.all(ClickSoundTypes.map(loadSound));
}

/**
 * Initializes and unlocks the Web Audio Context, and decodes any preloaded raw buffers.
 * MUST be called inside a user-gesture handler (click, touchstart, etc.) to succeed.
 */
export async function initAudio() {
  // Create or resume the AudioContext within the user-gesture
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  if (audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
      console.log('AudioContext successfully unlocked & resumed');
    } catch (e) {
      console.warn('Could not resume AudioContext (needs user interaction):', e);
    }
  }

  // Decode any fetched raw buffers that are not yet decoded
  const decodePromises = ClickSoundTypes.map(async (type) => {
    if (!audioBuffers[type] && rawBuffers[type]) {
      try {
        // Since decodeAudioData consumes/destroys the array buffer, slice it to keep a copy
        const rawCopy = rawBuffers[type].slice(0);
        // decodeAudioData returns a promise in modern browsers, but we also handle legacy callback-based style just in case
        const decoded = await new Promise((resolve, reject) => {
          audioCtx.decodeAudioData(rawCopy, resolve, reject).catch(reject);
        });
        audioBuffers[type] = decoded;
        console.log(`Successfully decoded sound: ${type}`);
      } catch (e) {
        console.error(`Error decoding ${type} sound:`, e);
      }
    }
  });

  await Promise.all(decodePromises);
  return audioCtx;
}

/**
 * Plays a clicker sound.
 * Automatically ensures the AudioContext is running and decoded.
 */
export async function playClick(type, volume = 1) {
  try {
    const ctx = getAudioContext();
    
    // Ensure decoded buffer is available
    let buffer = audioBuffers[type];
    if (!buffer) {
      console.warn(`Buffer for ${type} is not decoded yet. Attempting decoding...`);
      if (rawBuffers[type]) {
        const rawCopy = rawBuffers[type].slice(0);
        buffer = await new Promise((resolve, reject) => {
          ctx.decodeAudioData(rawCopy, resolve, reject).catch(reject);
        });
        audioBuffers[type] = buffer;
      } else {
        // Fallback: fetch and decode on-the-fly
        console.warn(`Raw buffer for ${type} not preloaded. Fetching on-the-fly...`);
        const response = await fetch(`assets/${type}.wav`);
        const arrayBuffer = await response.arrayBuffer();
        rawBuffers[type] = arrayBuffer;
        const rawCopy = arrayBuffer.slice(0);
        buffer = await new Promise((resolve, reject) => {
          ctx.decodeAudioData(rawCopy, resolve, reject).catch(reject);
        });
        audioBuffers[type] = buffer;
      }
    }

    if (!buffer) {
      console.error(`Cannot play ${type}: no decoded audio buffer available.`);
      return;
    }

    // Play the audio
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(0);
    console.log(`Played ${type} at volume ${volume}`);
  } catch (error) {
    console.error(`Failed to play click sound ${type}:`, error);
  }
}

