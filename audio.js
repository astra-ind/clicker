// audio.js
export const ClickSoundTypes = ['mechanical', 'soft', 'loud'];

let audioCtx = null;

export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClick(type, volume = 1) {
  const ctx = getAudioContext();
  const time = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const masterGain = ctx.createGain();
  
  masterGain.gain.value = volume;
  
  osc.connect(gainNode);
  gainNode.connect(masterGain);
  masterGain.connect(ctx.destination);
  
  switch (type) {
    case 'mechanical':
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
      gainNode.gain.setValueAtTime(1, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.05);
      break;
    case 'soft':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, time);
      osc.frequency.exponentialRampToValueAtTime(200, time + 0.1);
      gainNode.gain.setValueAtTime(0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.1);
      break;
    case 'loud':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1000, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);
      gainNode.gain.setValueAtTime(1, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.1);
      break;
  }
}
