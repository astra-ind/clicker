# Remote Pet Clicker Trainer (MVP)

A lightweight Progressive Web App (PWA) that allows you to remotely trigger a pet training clicker from another device.

## Static Rewrite

This version has been completely rewritten to be a **100% pure static web application** using vanilla HTML, CSS, and modern JavaScript. It uses zero build steps, no Node.js, and no frameworks.

## Features Preserved

- [x] **Controller page** - Big prominent button, online/offline status.
- [x] **Receiver page** - Last trigger time, output mode, sound profile, volume, keep awake, test button.
- [x] **Real-time Engine**: Built on MQTT over WebSockets for near-instant message delivery without any backend configuration.
- [x] **Audio Synthesizer**: Generates three distinctive click profiles (Mechanical, Soft, Loud) locally via the Web Audio API without needing to load external `.mp3` files.
- [x] **Wake Lock**: The Receiver uses the Screen Wake Lock API to prevent the device from going to sleep while active.
- [x] **Vibration Support**: Native HTML5 Vibration API.
- [x] **PWA Ready**: Offline caching, installable manifest, service worker.

## Deployment to GitHub Pages

Since this app is fully static, you can deploy it directly to GitHub Pages without any build process.

1. Create a new repository on GitHub.
2. Upload all the files in this directory to the root of the repository.
3. Go to **Settings > Pages**.
4. Select the `main` branch (or `master`) and save.
5. Your app will be live at `https://<username>.github.io/<repository-name>/`.
