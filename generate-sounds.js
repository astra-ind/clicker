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

console.log("Wav files generated.");
