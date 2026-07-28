# Remote Pet Clicker Trainer (MVP)

A lightweight Progressive Web App (PWA) that allows you to remotely trigger a pet training clicker from another device. 

## Architecture

* **Frontend**: React, TypeScript, Tailwind CSS, Zustand, Vite, and `vite-plugin-pwa`.
* **Backend**: None! The app is fully static.
* **Real-time Messaging**: Uses MQTT over WebSockets via a free public broker (EMQX) for zero-setup, instant messaging.
* **Audio**: Synthesized using the Web Audio API.
* **Vibration**: Uses the native HTML5 Vibration API (device dependent).

## Setup & Running

This project is a fully static Single Page Application (SPA).

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the provided preview link on multiple devices:
   * **Device 1**: Select **Receiver** and keep it with your pet.
   * **Device 2**: Select **Controller** to remotely trigger the Receiver.

## Features

- **Real-time Engine**: Built on MQTT over WebSockets for near-instant message delivery without any backend configuration.
- **Audio Synthesizer**: Generates three distinctive click profiles (Mechanical, Soft, Loud) locally via the Web Audio API without needing to load external `.mp3` files.
- **Wake Lock**: The Receiver uses the Screen Wake Lock API to prevent the device from going to sleep while active.
- **PWA Ready**: Includes an auto-updating service worker configuration.

## Deployment

Since this app is fully static, you can deploy it to any static hosting provider (e.g., GitHub Pages, Vercel, Netlify, Cloudflare Pages).

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the resulting `dist/` directory to your static host.
