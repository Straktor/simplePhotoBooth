# Simple Photo Booth

A PWA photo booth app built with Vue 3 + TypeScript. Take countdown photos directly from your browser, save them to your device, and install it on your phone like a native app.

**Live:** https://straktor.github.io/simplePhotoBooth/

---

## Features

- **Live camera feed** — front or rear camera, with mirror mode for selfies
- **Countdown timer** — 3, 5, or 10 seconds, with a full-screen animated overlay
- **Tap to shoot** — tap the video feed or the shutter button to trigger
- **Save to device** — captured photos download as JPEG
- **Themeable** — change primary color, accent color, background color, and background image from Settings
- **PWA** — installable on iOS and Android, works offline after first load
- **Auto-deploy** — every push to `main` deploys to GitHub Pages via GitHub Actions

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| Build | Vite 8 |
| PWA | vite-plugin-pwa (Workbox) |
| Routing | Vue Router 4 (hash history) |
| State | Module-singleton composable + `localStorage` |
| Deploy | GitHub Actions → GitHub Pages |

No UI framework, no Pinia — just CSS custom properties and composables.

---

## Project structure

```
src/
├── composables/
│   ├── useCamera.ts       # getUserMedia, canvas capture, download
│   ├── useCountdown.ts    # Promise-based countdown timer
│   └── useSettings.ts     # Reactive settings store, persisted to localStorage
├── components/
│   ├── AppLayout.vue      # Root layout, injects CSS variables from settings
│   ├── BottomNav.vue      # Fixed bottom tab bar (hidden on Booth route)
│   └── CountdownOverlay.vue
├── views/
│   ├── HomeView.vue
│   ├── PhotoBoothView.vue # Full-screen camera + floating controls
│   └── SettingsView.vue
├── router/index.ts        # Hash history (required for GitHub Pages)
└── style.css              # CSS custom property defaults + reset
```

---

## Local development

```bash
npm install
npm run dev       # http://localhost:5173/simplePhotoBooth/
npm run build     # type-check + production build → dist/
```

> Camera requires HTTPS or `localhost`. The dev server satisfies this.

---

## Deploy

Deployment is automatic: push to `main` → GitHub Actions builds and deploys.

**First-time setup** (one-off):
1. Go to the repo → **Settings → Pages**
2. Set Source to **GitHub Actions**

The workflow lives at [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## Settings

All settings are persisted in `localStorage` under the key `photobooth-settings`.

| Setting | Default | Description |
|---|---|---|
| Primary color | `#6c63ff` | Accent color for buttons, nav, glow |
| Accent color | `#ff6584` | Shutter button, countdown highlight |
| Background color | `#09090f` | App background |
| Background image | — | Optional image, stored as data URL |
| Countdown | 3s | Duration before capture (3 / 5 / 10) |
| Mirror selfie | on | Horizontally flips the front camera preview |
| Font | System | System / Monospace / Serif |
