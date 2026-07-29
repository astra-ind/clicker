import fs from 'fs';

function writeWav(filename, generateSample, durationSec, sampleRate = 44100) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(44 + numSamples * 2);
  
  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  
  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat
  buffer.writeUInt16LE(1, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  
  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = generateSample(t, i);
    // clip
    const val = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
    buffer.writeInt16LE(val, 44 + i * 2);
  }
  
  fs.mkdirSync('assets', { recursive: true });
  fs.writeFileSync('assets/' + filename, buffer);
}

// Mechanical: short, sharp click with a "double" sound common in clickers
writeWav('mechanical.wav', (t) => {
  if (t > 0.05) return 0;
  const env1 = Math.max(0, 1 - t * 100);
  const env2 = Math.max(0, 1 - Math.abs(t - 0.02) * 150);
  const noise = Math.random() * 2 - 1;
  const tone = Math.sin(t * Math.PI * 2 * 3000) * 0.5;
  return (noise + tone) * (env1 * 0.7 + env2 * 0.8) * 0.5;
}, 0.06);

// Soft: gentle pop
writeWav('soft.wav', (t) => {
  if (t > 0.05) return 0;
  const env = Math.max(0, Math.pow(1 - t * 20, 2));
  const tone = Math.sin(t * Math.PI * 2 * (800 - t * 10000));
  return tone * env * 0.8;
}, 0.06);

// Loud: sharp, metallic snap
writeWav('loud.wav', (t) => {
  if (t > 0.06) return 0;
  const env = Math.exp(-t * 80);
  const noise = (Math.random() * 2 - 1) * 0.6;
  const tone1 = Math.sin(t * Math.PI * 2 * 2500) * 0.5;
  const tone2 = Math.sin(t * Math.PI * 2 * 4500) * 0.3;
  return (noise + tone1 + tone2) * env;
}, 0.08);

// Classic: Classic metal-tab clicker with a highly authentic dual-snap feel
writeWav('classic.wav', (t) => {
  if (t > 0.06) return 0;
  // First click (downward press)
  const env1 = Math.max(0, Math.exp(-t * 220));
  const tone1 = Math.sin(t * Math.PI * 2 * 3400);
  const noise1 = (Math.random() * 2 - 1) * 0.4;
  
  // Second click (upward release of metal) at 16ms
  const t2 = t - 0.016;
  const env2 = t2 > 0 ? Math.max(0, Math.exp(-t2 * 180)) : 0;
  const tone2 = Math.sin(t2 * Math.PI * 2 * 2900);
  const noise2 = (Math.random() * 2 - 1) * 0.4;
  
  return (tone1 + noise1) * env1 * 0.6 + (tone2 + noise2) * env2 * 0.7;
}, 0.07);

// Bell: Bright, crystal-clear, resonant high-quality bell with exponential decay
writeWav('bell.wav', (t) => {
  if (t > 1.0) return 0;
  
  // Strike transient
  const strikeEnv = Math.exp(-t * 200);
  const strikeNoise = (Math.random() * 2 - 1) * strikeEnv * 0.4;
  
  // Resonant multi-harmonic tones
  const envCommon = Math.exp(-t * 3.5);
  const harm1 = Math.sin(t * Math.PI * 2 * 1109.73) * envCommon * 0.45; // C#6
  const harm2 = Math.sin(t * Math.PI * 2 * 1479.98) * Math.exp(-t * 5) * 0.35; // F#6
  const harm3 = Math.sin(t * Math.PI * 2 * 2217.46) * Math.exp(-t * 8) * 0.15; // C#7
  const harm4 = Math.sin(t * Math.PI * 2 * 3135.96) * Math.exp(-t * 15) * 0.05; // G7
  
  return strikeNoise + harm1 + harm2 + harm3 + harm4;
}, 1.0);

// Whistle: Realistic whistle with Pea oscillation vibrato and rushing breath noise
writeWav('whistle.wav', (t) => {
  if (t > 0.4) return 0;
  
  // Pea vibrato at 24 Hz (oscillating frequency and volume)
  const vibFreq = 24;
  const f = 2500 + 250 * Math.sin(t * Math.PI * 2 * vibFreq);
  const ampMod = 0.85 + 0.15 * Math.sin(t * Math.PI * 2 * vibFreq - Math.PI / 2);
  
  // Envelopes
  let env = 1.0;
  if (t < 0.04) {
    env = t / 0.04; // Smooth attack
  } else if (t > 0.32) {
    env = Math.max(0, (0.4 - t) / 0.08); // Smooth release
  }
  
  const coreTone = Math.sin(t * Math.PI * 2 * f) * ampMod * env;
  const breathNoise = (Math.random() * 2 - 1) * 0.12 * env;
  
  return (coreTone + breathNoise) * 0.6;
}, 0.4);

console.log("Wav files generated.");
