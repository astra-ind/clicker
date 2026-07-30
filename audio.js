// audio.js
export const ClickSoundTypes = ['mechanical', 'soft', 'loud'];

let audioCtx = null;
const audioBuffers = {
  mechanical: null,
  soft: null,
  loud: null
};

export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export async function preloadSounds() {
  const ctx = getAudioContext();
  
  const loadSound = async (type) => {
    try {
      const response = await fetch(`assets/${type}.wav`);
      const arrayBuffer = await response.arrayBuffer();
      audioBuffers[type] = await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error(`Failed to load ${type} sound:`, e);
    }
  };

  await Promise.all(ClickSoundTypes.map(loadSound));
}

export async function playClick(type, volume = 1) {
  const ctx = getAudioContext();
  
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn('Failed to resume AudioContext dynamically:', e);
    }
  }
  
  // If the browser still blocks the audio context from running, we discard
  // the click playback to prevent queuing up multiple sounds that blast all at once.
  if (ctx.state === 'suspended') {
    console.warn(`AudioContext is suspended; discarding playback of ${type} click to avoid audio queue pile-up.`);
    return;
  }

  const buffer = audioBuffers[type];
  
  if (!buffer) {
    console.warn(`Buffer for ${type} not loaded yet`);
    return;
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume;
  
  source.connect(masterGain);
  masterGain.connect(ctx.destination);
  
  source.start(0);
}

