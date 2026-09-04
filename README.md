# Simple Photo Booth

A PWA photo booth app built with Vue 3 + TypeScript. Take countdown photos and motion videos directly from your browser, save them to device, browse your persistent in-app gallery, and customize themes.

**Live:** https://straktor.github.io/simplePhotoBooth/

---

## Features

- **Live camera feed** — front or rear camera, with mirror mode for selfies and camera selection
- **WYSIWYG 3:4 capture** — view-framed canvas capture matches the on-screen viewfinder
- **Countdown timer** — 3, 5, or 10 seconds, with an animated overlay (tap to cancel)
- **Motion Photos & Video Playback** — records synchronized short video clips with playback and Google Motion Photo format support
- **IndexedDB Photo & Video Gallery** — local persistence with swipe navigation, pinch-to-zoom, playback, batch download, and deletion
- **Presets & Custom Theme Studio** — Core and Holiday theme presets, with full custom color, gradient, and camera-roll background image support
- **Internationalization (i18n)** — Full English and French language support
- **PWA** — installable on iOS and Android, works offline after first load
- **Auto-deploy** — every push to `main` deploys to GitHub Pages via GitHub Actions

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| Build | Vite 8 |
| Testing | Vitest |
| PWA | vite-plugin-pwa (Workbox) |
| Routing | Vue Router 4 (hash history) |
| Localization | Vue I18n 11 |
| Storage | IndexedDB (`photobooth-db`) + `localStorage` |
| Deploy | GitHub Actions → GitHub Pages |

---

## Project structure

```
src/
├── components/
│   ├── AppLayout.vue          # Root container layout
│   ├── PhotoViewer.vue        # Full-screen photo viewer with pinch/swipe/video
│   ├── ThemeDecorations.vue   # Animated SVG holiday & ambient decorations
│   └── ThemeIcon.vue          # Theme preview icons
├── composables/
│   ├── useCamera.ts           # getUserMedia, framed canvas capture, recording
│   ├── useCountdown.ts        # Promise-based countdown timer
│   └── useSettings.ts         # Reactive settings store + IndexedDB sync
├── locales/
│   ├── en.ts                  # English translations
│   └── fr.ts                  # French translations
├── router/
│   └── index.ts               # Hash history router
├── utils/
│   └── db.ts                  # IndexedDB client for photos, videos & custom assets
├── views/
│   ├── CustomThemeView.vue    # Theme customizer with live preview
│   ├── GalleryView.vue        # Photo grid, multi-select, and management
│   ├── HomeView.vue           # Landing page
│   ├── PhotoBoothView.vue     # Full-screen camera booth + floating controls
│   └── SettingsView.vue       # App configuration and theme selector
├── i18n.ts                    # Vue I18n setup
├── main.ts                    # App entrypoint
├── style.css                  # Global resets, keyframe animations, typography
└── themes.ts                  # Theme preset definitions & dynamic resolution
```

---

## Local development

```bash
npm install
npm run dev       # http://localhost:5173/simplePhotoBooth/
npm test          # run automated test suite (Vitest)
npm run build     # type-check + production build → dist/
```

> Camera requires HTTPS or `localhost`. The dev server satisfies this.

---

## Deploy

Deployment is automatic: push to `main` → GitHub Actions builds and deploys.

The workflow lives at [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
