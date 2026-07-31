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

  const buffer = audioBuffers[type];
  
  if (!buffer) {
    console.warn(`Buffer for ${type} not loaded yet; falling back to high-fidelity synthesized click.`);
    playSyntheticClick(type, ctx, volume);
    return;
  }
  
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    
    source.connect(masterGain);
    masterGain.connect(ctx.destination);
    
    source.start(0);
  } catch (err) {
    console.error(`Error playing audio buffer for ${type}:`, err);
    console.warn(`Falling back to high-fidelity synthesized click for ${type}.`);
    playSyntheticClick(type, ctx, volume);
  }
}

export function playSyntheticClick(type, ctx, volume = 1) {
  try {
    const now = ctx.currentTime;
    
    if (type === 'mechanical') {
      // First click (the press)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(3200, now);
      osc1.frequency.exponentialRampToValueAtTime(100, now + 0.03);
      
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(volume * 0.85, now + 0.001);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.04);
      
      // Second click (the release)
      const delay = 0.045; // 45ms delay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2600, now + delay);
      osc2.frequency.exponentialRampToValueAtTime(80, now + delay + 0.03);
      
      gain2.gain.setValueAtTime(0, now + delay);
      gain2.gain.linearRampToValueAtTime(volume * 0.65, now + delay + 0.001);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + delay);
      osc2.stop(now + delay + 0.04);
      
    } else if (type === 'soft') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.045);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 0.80, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      
    } else { // 'loud'
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(3800, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.05);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(4800, now);
      osc2.frequency.exponentialRampToValueAtTime(350, now + 0.05);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 1.10, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.06);
      osc2.stop(now + 0.06);
    }
  } catch (err) {
    console.error('Failed to play synthetic click:', err);
  }
}

