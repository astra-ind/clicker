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
  if (t > 0.12) return 0;
  // First click (the press)
  const env1 = Math.max(0, Math.exp(-t * 220));
  const noise1 = Math.random() * 2 - 1;
  const tone1 = Math.sin(t * Math.PI * 2 * 3500) * 0.4;
  const click1 = (noise1 * 0.6 + tone1) * env1;
  
  // Second click (the release)
  let click2 = 0;
  if (t > 0.045) {
    const t2 = t - 0.045;
    const env2 = Math.max(0, Math.exp(-t2 * 180));
    const noise2 = Math.random() * 2 - 1;
    const tone2 = Math.sin(t2 * Math.PI * 2 * 2800) * 0.4;
    click2 = (noise2 * 0.5 + tone2) * env2 * 0.75;
  }
  
  // Mix and normalize
  return (click1 + click2) * 0.95;
}, 0.12);

// Soft: gentle pop (smooth transition, pleasant frequency sweep)
writeWav('soft.wav', (t) => {
  if (t > 0.10) return 0;
  const env = Math.max(0, Math.pow(1 - t * 15, 3));
  // Smooth frequency sweep from 1000Hz down to 150Hz
  const freq = 1000 - t * 8500;
  const tone = Math.sin(t * Math.PI * 2 * freq);
  return tone * env * 0.9;
}, 0.10);

// Loud: sharp, high-intensity metallic snap
writeWav('loud.wav', (t) => {
  if (t > 0.15) return 0;
  const env = Math.exp(-t * 110);
  const noise = (Math.random() * 2 - 1) * 0.7;
  // Sharp mixed metal tones
  const tone1 = Math.sin(t * Math.PI * 2 * 4000) * 0.5;
  const tone2 = Math.sin(t * Math.PI * 2 * 5500) * 0.3;
  const tone3 = Math.sin(t * Math.PI * 2 * 1800) * 0.2;
  return (noise + tone1 + tone2 + tone3) * env * 1.2;
}, 0.15);

console.log("Wav files generated.");
