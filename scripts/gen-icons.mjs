import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const out = join(__dir, '..', 'public', 'icons')
mkdirSync(out, { recursive: true })

// Photo booth SVG: white icon on black background
// Design: vintage camera booth shape — camera body + lens + flash
function makeSvg(size) {
  const s = size
  const r = size * 0.22  // corner radius for bg

  // Scale factors (designed on 100x100 grid)
  const sc = s / 100

  // Camera body: rounded rect
  const bx = 18 * sc, by = 30 * sc, bw = 64 * sc, bh = 44 * sc, br = 8 * sc
  // Lens: circle
  const lx = 50 * sc, ly = 52 * sc, lr = 14 * sc
  // Lens inner
  const li = 9 * sc
  // Viewfinder: small rect top-right of body
  const vx = 60 * sc, vy = 34 * sc, vw = 14 * sc, vh = 8 * sc, vr = 2 * sc
  // Flash: small rect top-left
  const fx = 24 * sc, fy = 34 * sc, fw = 10 * sc, fh = 8 * sc, fr = 2 * sc
  // Top bump (where you insert your head)
  const tx = 36 * sc, ty = 22 * sc, tw = 28 * sc, th = 10 * sc, tr = 5 * sc
  // Curtain lines at bottom
  const c1y = 76 * sc, c2y = 82 * sc
  const cx1 = 25 * sc, cx2 = 75 * sc

  const sw = 2.5 * sc  // stroke width

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <!-- Black background -->
  <rect width="${s}" height="${s}" rx="${r}" fill="#000000"/>

  <!-- Top bump (photo slot) -->
  <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="${tr}" fill="white"/>

  <!-- Camera body -->
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${br}" fill="white"/>

  <!-- Lens outer -->
  <circle cx="${lx}" cy="${ly}" r="${lr}" fill="#000000"/>
  <!-- Lens ring -->
  <circle cx="${lx}" cy="${ly}" r="${lr}" fill="none" stroke="white" stroke-width="${sw}"/>
  <!-- Lens inner -->
  <circle cx="${lx}" cy="${ly}" r="${li}" fill="#000000"/>
  <circle cx="${lx}" cy="${ly}" r="${li * 0.55}" fill="white" opacity="0.15"/>

  <!-- Viewfinder -->
  <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="${vr}" fill="#000000"/>

  <!-- Flash -->
  <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${fr}" fill="#000000"/>

  <!-- Curtain lines -->
  <line x1="${cx1}" y1="${c1y}" x2="${cx2}" y2="${c1y}" stroke="white" stroke-width="${sw * 0.8}" stroke-linecap="round"/>
  <line x1="${cx1 + 4 * sc}" y1="${c2y}" x2="${cx2 - 4 * sc}" y2="${c2y}" stroke="white" stroke-width="${sw * 0.8}" stroke-linecap="round" opacity="0.6"/>
</svg>`
}

async function gen(size, filename) {
  const svg = Buffer.from(makeSvg(size))
  await sharp(svg).png().toFile(join(out, filename))
  console.log(`✓ ${filename} (${size}x${size})`)
}

await gen(192, 'icon-192x192.png')
await gen(512, 'icon-512x512.png')
await gen(180, 'apple-touch-icon.png')
await gen(32,  'favicon-32x32.png')
