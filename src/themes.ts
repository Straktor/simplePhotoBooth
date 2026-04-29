export interface ThemePreset {
  label: string
  group: 'Core' | 'Holidays'
  emoji: string
  bg: string
  primary: string
  accent: string
  text: string
  textMuted: string
  border: string
  borderStrong: string
  surface: string
  surfaceSolid: string
  shutterGlow: string
  font: string
  countdownColor: string
  viewfinderBorder: string
  glassBlur: string
  titleGradient: string
  cameraBlobs: string[]
  cameraBg: string
  scanlines: boolean
  darkFrame: boolean
  bgImage?: string | null
}

export interface ResolvedTheme extends ThemePreset {
  bgImage?: string | null
}

export const PRESETS: Record<string, { dark: ThemePreset; light: ThemePreset }> = {
  neon: {
    dark:  { label:'Dark Neon',    group:'Core',     emoji:'🌌', bg:'#09090f', primary:'#7c6fff', accent:'#ff6b9d', text:'#f0eeff', textMuted:'rgba(240,238,255,0.4)',  border:'rgba(124,111,255,0.18)', borderStrong:'rgba(124,111,255,0.4)',  surface:'rgba(20,15,40,0.82)',   surfaceSolid:'#16112e',  shutterGlow:'0 0 28px rgba(255,107,157,0.55),0 0 60px rgba(255,107,157,0.22)', font:'"SF Pro Display",system-ui,sans-serif', countdownColor:'#ff6b9d', viewfinderBorder:'rgba(124,111,255,0.4)',  glassBlur:'blur(20px)', titleGradient:'linear-gradient(135deg,#7c6fff,#ff6b9d)',    cameraBlobs:['#1a0a2e','#0d1b3e','#1a2a1a','#2a1a1a','#0a1a2e'], cameraBg:'#06040f',  scanlines:false, darkFrame:true  },
    light: { label:'Dark Neon',    group:'Core',     emoji:'🌌', bg:'#f0eeff', primary:'#5a4ee0', accent:'#e8407a', text:'#1a1530', textMuted:'rgba(26,21,48,0.42)',    border:'rgba(90,78,224,0.15)',   borderStrong:'rgba(90,78,224,0.3)',    surface:'rgba(255,255,255,0.88)', surfaceSolid:'#ffffff',  shutterGlow:'0 4px 20px rgba(232,64,122,0.35)',                                font:'"SF Pro Display",system-ui,sans-serif', countdownColor:'#5a4ee0', viewfinderBorder:'rgba(90,78,224,0.3)',    glassBlur:'blur(20px)', titleGradient:'linear-gradient(135deg,#5a4ee0,#e8407a)',    cameraBlobs:['#c8b8ff','#ffd8ea','#c0d0ff','#ffc8dc','#d8c0ff'],  cameraBg:'#ddd8ff',  scanlines:false, darkFrame:false },
  },
  retro: {
    dark:  { label:'Retro Film',   group:'Core',     emoji:'📽️', bg:'#0f0b06', primary:'#c9a050', accent:'#e8704a', text:'#f0e8d0', textMuted:'rgba(240,232,208,0.4)', border:'rgba(201,160,80,0.2)',   borderStrong:'rgba(201,160,80,0.4)',   surface:'rgba(30,20,8,0.85)',    surfaceSolid:'#1e1408',  shutterGlow:'0 0 24px rgba(232,112,74,0.5)',                                   font:'"Georgia",serif',                      countdownColor:'#c9a050', viewfinderBorder:'rgba(201,160,80,0.4)',   glassBlur:'blur(16px)', titleGradient:'linear-gradient(135deg,#c9a050,#e8704a)',    cameraBlobs:['#3a2a15','#2a1a0a','#1a2a1a','#3a2010','#1a1510'],  cameraBg:'#140c04',  scanlines:true,  darkFrame:true  },
    light: { label:'Retro Film',   group:'Core',     emoji:'📽️', bg:'#fdf6e8', primary:'#8a5a20', accent:'#c84828', text:'#2a1808', textMuted:'rgba(42,24,8,0.42)',     border:'rgba(138,90,32,0.18)',   borderStrong:'rgba(138,90,32,0.32)',   surface:'rgba(255,252,242,0.9)', surfaceSolid:'#fdf8f0',  shutterGlow:'0 4px 20px rgba(200,72,40,0.35)',                                 font:'"Georgia",serif',                      countdownColor:'#8a5a20', viewfinderBorder:'rgba(138,90,32,0.3)',    glassBlur:'blur(16px)', titleGradient:'linear-gradient(135deg,#8a5a20,#c84828)',    cameraBlobs:['#e8c880','#f0d870','#ddc068','#e8cc78','#d8bc68'],   cameraBg:'#e8d4a0',  scanlines:true,  darkFrame:false },
  },
  light: {
    dark:  { label:'Clean',        group:'Core',     emoji:'☀️',  bg:'#1c1c1e', primary:'#e63946', accent:'#e63946', text:'#f5f5f5', textMuted:'rgba(245,245,245,0.38)', border:'rgba(245,245,245,0.1)',  borderStrong:'rgba(245,245,245,0.22)', surface:'rgba(30,30,32,0.88)',   surfaceSolid:'#232325',  shutterGlow:'0 0 24px rgba(230,57,70,0.5)',                                    font:'"Helvetica Neue",Helvetica,sans-serif', countdownColor:'#e63946', viewfinderBorder:'rgba(230,57,70,0.28)',   glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#f5f5f5,#e63946)',    cameraBlobs:['#2e2a2b','#28282a','#2a2b2e','#2e2a2a','#282b2a'],   cameraBg:'#2a2a2c',  scanlines:false, darkFrame:true  },
    light: { label:'Clean',        group:'Core',     emoji:'☀️',  bg:'#f2f0ed', primary:'#1a1a1a', accent:'#e63946', text:'#1a1a1a', textMuted:'rgba(26,26,26,0.38)',    border:'rgba(26,26,26,0.1)',     borderStrong:'rgba(26,26,26,0.25)',    surface:'rgba(255,255,255,0.88)', surfaceSolid:'#ffffff',  shutterGlow:'0 4px 22px rgba(230,57,70,0.4)',                                  font:'"Helvetica Neue",Helvetica,sans-serif', countdownColor:'#e63946', viewfinderBorder:'rgba(26,26,26,0.2)',     glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#1a1a1a,#e63946)',    cameraBlobs:['#c8d8e8','#d8c8e8','#e8d8c8','#c8e8d8','#e8c8d8'],   cameraBg:'#b8c8d8',  scanlines:false, darkFrame:false },
  },
  halloween: {
    dark:  { label:'Halloween',    group:'Holidays', emoji:'🎃', bg:'#0a0508', primary:'#ff6b00', accent:'#9b4dca', text:'#f5e6d0', textMuted:'rgba(245,230,208,0.38)', border:'rgba(255,107,0,0.2)',    borderStrong:'rgba(255,107,0,0.4)',    surface:'rgba(25,8,15,0.85)',    surfaceSolid:'#19080f',  shutterGlow:'0 0 28px rgba(255,107,0,0.55)',                                   font:'"Georgia",serif',                      countdownColor:'#ff6b00', viewfinderBorder:'rgba(255,107,0,0.38)',   glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#ff6b00,#9b4dca)',    cameraBlobs:['#3a1a00','#1a0a2a','#2a1000','#1a0a15','#300a00'],   cameraBg:'#080306',  scanlines:true,  darkFrame:true  },
    light: { label:'Halloween',    group:'Holidays', emoji:'🎃', bg:'#fff3e6', primary:'#cc5500', accent:'#7b3aaa', text:'#2a0e08', textMuted:'rgba(42,14,8,0.42)',     border:'rgba(204,85,0,0.18)',    borderStrong:'rgba(204,85,0,0.32)',    surface:'rgba(255,255,255,0.88)', surfaceSolid:'#fff8f0',  shutterGlow:'0 4px 22px rgba(204,85,0,0.38)',                                  font:'"Georgia",serif',                      countdownColor:'#cc5500', viewfinderBorder:'rgba(204,85,0,0.3)',     glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#cc5500,#7b3aaa)',    cameraBlobs:['#ffc090','#e8a8e0','#ffcc90','#e090c8','#ffb878'],   cameraBg:'#ffd8a8',  scanlines:false, darkFrame:false },
  },
  christmas: {
    dark:  { label:'Christmas',    group:'Holidays', emoji:'🎄', bg:'#050f08', primary:'#e74c3c', accent:'#2ecc71', text:'#f0fff4', textMuted:'rgba(240,255,244,0.38)', border:'rgba(231,76,60,0.2)',    borderStrong:'rgba(231,76,60,0.4)',    surface:'rgba(5,20,10,0.85)',    surfaceSolid:'#05140a',  shutterGlow:'0 0 28px rgba(231,76,60,0.55)',                                   font:'"Georgia",serif',                      countdownColor:'#e74c3c', viewfinderBorder:'rgba(46,204,113,0.4)',   glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#e74c3c,#2ecc71)',    cameraBlobs:['#3a0a08','#083a15','#2a0808','#083a10','#1a0505'],   cameraBg:'#030a05',  scanlines:false, darkFrame:true  },
    light: { label:'Christmas',    group:'Holidays', emoji:'🎄', bg:'#f5fff7', primary:'#b71c1c', accent:'#1a7040', text:'#0a1e10', textMuted:'rgba(10,30,16,0.42)',    border:'rgba(183,28,28,0.15)',   borderStrong:'rgba(183,28,28,0.3)',    surface:'rgba(255,255,255,0.88)', surfaceSolid:'#f8fff8',  shutterGlow:'0 4px 22px rgba(183,28,28,0.38)',                                 font:'"Georgia",serif',                      countdownColor:'#b71c1c', viewfinderBorder:'rgba(26,112,64,0.3)',    glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#b71c1c,#1a7040)',    cameraBlobs:['#f0c8c8','#c8e8d0','#f0d0c8','#c8e8c8','#e8c8d0'],   cameraBg:'#c8f0d8',  scanlines:false, darkFrame:false },
  },
  valentine: {
    dark:  { label:"Valentine's",  group:'Holidays', emoji:'💝', bg:'#120508', primary:'#ff4d6d', accent:'#ff8fa3', text:'#fff0f3', textMuted:'rgba(255,240,243,0.38)', border:'rgba(255,77,109,0.2)',   borderStrong:'rgba(255,77,109,0.4)',   surface:'rgba(30,5,15,0.85)',    surfaceSolid:'#1e050f',  shutterGlow:'0 0 28px rgba(255,77,109,0.6)',                                   font:'"Georgia",serif',                      countdownColor:'#ff4d6d', viewfinderBorder:'rgba(255,77,109,0.38)',  glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#ff4d6d,#ff8fa3)',    cameraBlobs:['#3a0a18','#2a0510','#1a0508','#3a0f20','#200810'],   cameraBg:'#0a0306',  scanlines:false, darkFrame:true  },
    light: { label:"Valentine's",  group:'Holidays', emoji:'💝', bg:'#fff0f3', primary:'#c0254a', accent:'#ff6b85', text:'#200810', textMuted:'rgba(32,8,16,0.42)',     border:'rgba(192,37,74,0.15)',   borderStrong:'rgba(192,37,74,0.3)',    surface:'rgba(255,255,255,0.88)', surfaceSolid:'#fff5f7',  shutterGlow:'0 4px 22px rgba(192,37,74,0.38)',                                 font:'"Georgia",serif',                      countdownColor:'#c0254a', viewfinderBorder:'rgba(192,37,74,0.3)',    glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#c0254a,#ff6b85)',    cameraBlobs:['#ffc0cc','#ffd0e0','#ffb8c8','#ffccd8','#ffc8d4'],   cameraBg:'#ffd0db',  scanlines:false, darkFrame:false },
  },
  newyear: {
    dark:  { label:"New Year's",   group:'Holidays', emoji:'🥂', bg:'#08080f', primary:'#ffd700', accent:'#c0a040', text:'#fff9e6', textMuted:'rgba(255,249,230,0.38)', border:'rgba(255,215,0,0.2)',    borderStrong:'rgba(255,215,0,0.4)',    surface:'rgba(15,12,5,0.88)',    surfaceSolid:'#0f0c05',  shutterGlow:'0 0 32px rgba(255,215,0,0.5)',                                    font:'"SF Pro Display",system-ui,sans-serif', countdownColor:'#ffd700', viewfinderBorder:'rgba(255,215,0,0.4)',    glassBlur:'blur(20px)', titleGradient:'linear-gradient(135deg,#ffd700,#c0a040)',    cameraBlobs:['#2a2000','#1a1800','#2a2208','#1a1500','#222000'],   cameraBg:'#060508',  scanlines:false, darkFrame:true  },
    light: { label:"New Year's",   group:'Holidays', emoji:'🥂', bg:'#fffae8', primary:'#907010', accent:'#b08828', text:'#201a08', textMuted:'rgba(32,26,8,0.42)',     border:'rgba(144,112,16,0.18)',  borderStrong:'rgba(144,112,16,0.32)', surface:'rgba(255,255,255,0.88)',  surfaceSolid:'#fffcf0',  shutterGlow:'0 4px 22px rgba(144,112,16,0.38)',                                font:'"SF Pro Display",system-ui,sans-serif', countdownColor:'#907010', viewfinderBorder:'rgba(144,112,16,0.3)',   glassBlur:'blur(20px)', titleGradient:'linear-gradient(135deg,#907010,#b08828)',    cameraBlobs:['#e8d888','#f0e098','#e4d480','#e8d890','#dcd080'],   cameraBg:'#f0e0a0',  scanlines:false, darkFrame:false },
  },
  easter: {
    dark:  { label:'Easter',       group:'Holidays', emoji:'🐣', bg:'#1e0f35', primary:'#9b59b6', accent:'#f1c40f', text:'#f5e8ff', textMuted:'rgba(245,232,255,0.38)', border:'rgba(155,89,182,0.22)', borderStrong:'rgba(155,89,182,0.4)',   surface:'rgba(30,15,55,0.88)',   surfaceSolid:'#1e0f35',  shutterGlow:'0 0 26px rgba(241,196,15,0.45)',                                  font:'"Helvetica Neue",Helvetica,sans-serif', countdownColor:'#9b59b6', viewfinderBorder:'rgba(155,89,182,0.35)', glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#9b59b6,#f1c40f)',    cameraBlobs:['#2a1045','#3a1840','#281040','#2a1238','#3a2040'],   cameraBg:'#160a28',  scanlines:false, darkFrame:true  },
    light: { label:'Easter',       group:'Holidays', emoji:'🐣', bg:'#f5f0fa', primary:'#9b59b6', accent:'#f1c40f', text:'#2c1a3a', textMuted:'rgba(44,26,58,0.38)',    border:'rgba(155,89,182,0.18)', borderStrong:'rgba(155,89,182,0.35)',  surface:'rgba(255,255,255,0.85)', surfaceSolid:'#ffffff',  shutterGlow:'0 4px 22px rgba(241,196,15,0.45)',                                font:'"Helvetica Neue",Helvetica,sans-serif', countdownColor:'#9b59b6', viewfinderBorder:'rgba(155,89,182,0.3)',   glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#9b59b6,#f1c40f)',    cameraBlobs:['#e8d0f8','#f8e8d0','#d0f0e8','#f8d0e8','#d8e8f8'],  cameraBg:'#ddd0f0',  scanlines:false, darkFrame:false },
  },
  stpatrick: {
    dark:  { label:"St. Patrick's",group:'Holidays', emoji:'🍀', bg:'#021a06', primary:'#2ecc71', accent:'#27ae60', text:'#e8ffe8', textMuted:'rgba(232,255,232,0.38)', border:'rgba(46,204,113,0.2)',   borderStrong:'rgba(46,204,113,0.4)',   surface:'rgba(2,20,6,0.85)',     surfaceSolid:'#021406',  shutterGlow:'0 0 28px rgba(46,204,113,0.5)',                                   font:'"Georgia",serif',                      countdownColor:'#2ecc71', viewfinderBorder:'rgba(46,204,113,0.4)',   glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#2ecc71,#27ae60)',    cameraBlobs:['#083a10','#052a08','#0a3a12','#063008','#042008'],   cameraBg:'#010a03',  scanlines:true,  darkFrame:true  },
    light: { label:"St. Patrick's",group:'Holidays', emoji:'🍀', bg:'#eefff0', primary:'#1a7a3a', accent:'#158030', text:'#061508', textMuted:'rgba(6,21,8,0.42)',      border:'rgba(26,122,58,0.18)',   borderStrong:'rgba(26,122,58,0.32)',   surface:'rgba(255,255,255,0.88)', surfaceSolid:'#f8fff8',  shutterGlow:'0 4px 22px rgba(26,122,58,0.38)',                                 font:'"Georgia",serif',                      countdownColor:'#1a7a3a', viewfinderBorder:'rgba(26,122,58,0.3)',    glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#1a7a3a,#158030)',    cameraBlobs:['#a8e8b8','#b8f0c8','#a0e0b0','#b0e8c0','#a8e0b8'],  cameraBg:'#b8f0c8',  scanlines:false, darkFrame:false },
  },
  birthday: {
    dark:  { label:'Birthday',     group:'Holidays', emoji:'🎂', bg:'#0a0515', primary:'#ff6b6b', accent:'#ffd93d', text:'#fff5ff', textMuted:'rgba(255,245,255,0.38)', border:'rgba(255,107,107,0.2)',  borderStrong:'rgba(255,107,107,0.4)', surface:'rgba(20,5,30,0.85)',    surfaceSolid:'#14051e',  shutterGlow:'0 0 28px rgba(255,107,107,0.5)',                                  font:'"SF Pro Display",system-ui,sans-serif', countdownColor:'#ffd93d', viewfinderBorder:'rgba(255,107,107,0.38)', glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#ff6b6b,#ffd93d,#6bcbff)', cameraBlobs:['#2a0a20','#0a2a10','#2a1a00','#080a2a','#200520'],  cameraBg:'#060308',  scanlines:false, darkFrame:true  },
    light: { label:'Birthday',     group:'Holidays', emoji:'🎂', bg:'#fff5ff', primary:'#d85050', accent:'#c89010', text:'#1a0520', textMuted:'rgba(26,5,32,0.42)',     border:'rgba(216,80,80,0.15)',   borderStrong:'rgba(216,80,80,0.3)',   surface:'rgba(255,255,255,0.88)', surfaceSolid:'#fffaff',  shutterGlow:'0 4px 22px rgba(216,80,80,0.35)',                                 font:'"SF Pro Display",system-ui,sans-serif', countdownColor:'#c89010', viewfinderBorder:'rgba(216,80,80,0.28)',   glassBlur:'blur(18px)', titleGradient:'linear-gradient(135deg,#d85050,#c89010,#5090cc)', cameraBlobs:['#ffc8e0','#ffd8c0','#ffc8d8','#e8d0f8','#ffd0e8'],  cameraBg:'#ffd8f0',  scanlines:false, darkFrame:false },
  },
}

export interface DecoDef {
  type: string
  x: number
  y: number
  size: number
  color: string
  lightColor?: string
  anim: string
  delay?: string
  opacity?: number
  rotate?: number
  extra?: Record<string, string>
}

export const THEME_DECOS: Record<string, DecoDef[]> = {
  neon: [
    { type:'particle', x:7,  y:12, size:7,  color:'#7c6fff', anim:'twinkle 3s ease-in-out infinite',   delay:'0s',    opacity:0.7 },
    { type:'particle', x:88, y:18, size:9,  color:'#ff6b9d', anim:'twinkle 2.5s ease-in-out infinite', delay:'0.5s',  opacity:0.6 },
    { type:'particle', x:4,  y:78, size:5,  color:'#ff6b9d', anim:'twinkle 3.5s ease-in-out infinite', delay:'1s',    opacity:0.5 },
    { type:'particle', x:92, y:82, size:8,  color:'#7c6fff', anim:'twinkle 2.8s ease-in-out infinite', delay:'0.3s',  opacity:0.65 },
    { type:'particle', x:45, y:88, size:6,  color:'#a090ff', anim:'twinkle 3.2s ease-in-out infinite', delay:'1.5s',  opacity:0.5 },
    { type:'star',     x:82, y:86, size:18, color:'#ff6b9d44', anim:'spin-slow 15s linear infinite',  delay:'0s',    opacity:0.5 },
    { type:'star',     x:10, y:82, size:14, color:'#7c6fff44', anim:'spin-slow 12s linear infinite reverse', delay:'2s', opacity:0.4 },
  ],
  retro: [
    { type:'film', x:2,  y:8,  size:22, color:'#c9a05055', anim:'shimmer 3s ease-in-out infinite', delay:'0s',   opacity:0.7 },
    { type:'film', x:2,  y:18, size:22, color:'#c9a05055', anim:'shimmer 3s ease-in-out infinite', delay:'0.6s', opacity:0.7 },
    { type:'film', x:2,  y:28, size:22, color:'#c9a05055', anim:'shimmer 3s ease-in-out infinite', delay:'1.2s', opacity:0.7 },
    { type:'film', x:88, y:8,  size:22, color:'#c9a05055', anim:'shimmer 3s ease-in-out infinite', delay:'0.3s', opacity:0.7 },
    { type:'film', x:88, y:18, size:22, color:'#c9a05055', anim:'shimmer 3s ease-in-out infinite', delay:'0.9s', opacity:0.7 },
    { type:'film', x:88, y:28, size:22, color:'#c9a05055', anim:'shimmer 3s ease-in-out infinite', delay:'1.5s', opacity:0.7 },
    { type:'film', x:2,  y:76, size:22, color:'#c9a05055', anim:'shimmer 3s ease-in-out infinite', delay:'0.2s', opacity:0.7 },
    { type:'film', x:88, y:76, size:22, color:'#c9a05055', anim:'shimmer 3s ease-in-out infinite', delay:'0.8s', opacity:0.7 },
  ],
  light: [
    { type:'particle', x:6,  y:10, size:10, color:'#e6394622', anim:'twinkle 4s ease-in-out infinite',   delay:'0s',   opacity:0.6 },
    { type:'particle', x:88, y:14, size:8,  color:'#1a1a1a18', anim:'twinkle 3.5s ease-in-out infinite', delay:'1s',   opacity:0.5 },
    { type:'particle', x:5,  y:82, size:9,  color:'#e6394633', anim:'twinkle 3s ease-in-out infinite',   delay:'0.5s', opacity:0.55 },
    { type:'particle', x:90, y:80, size:12, color:'#1a1a1a22', anim:'twinkle 4.2s ease-in-out infinite', delay:'0.8s', opacity:0.45 },
  ],
  halloween: [
    { type:'bat',      x:8,  y:4,  size:28, color:'#9b4dca', anim:'bat-fly 2.2s ease-in-out infinite',  delay:'0s',    opacity:0.88 },
    { type:'bat',      x:58, y:6,  size:20, color:'#7b3daa', anim:'bat-fly 2.8s ease-in-out infinite',  delay:'0.7s',  opacity:0.72 },
    { type:'bat',      x:78, y:3,  size:16, color:'#9b4dca', anim:'bat-fly 3.2s ease-in-out infinite',  delay:'1.4s',  opacity:0.6 },
    { type:'pumpkin',  x:2,  y:77, size:44, color:'#ff6b00', anim:'float-bob 4s ease-in-out infinite',  delay:'0s',    opacity:0.92 },
    { type:'pumpkin',  x:68, y:79, size:36, color:'#ff8c00', anim:'float-bob 3.5s ease-in-out infinite',delay:'1s',    opacity:0.82 },
    { type:'particle', x:12, y:88, size:6,  color:'#9b4dca', anim:'twinkle 2.5s ease-in-out infinite',  delay:'0.3s',  opacity:0.7 },
    { type:'particle', x:88, y:85, size:8,  color:'#ff6b00', anim:'twinkle 3s ease-in-out infinite',    delay:'0.8s',  opacity:0.65 },
  ],
  christmas: [
    { type:'snowflake', x:5,  y:6,  size:28, color:'rgba(255,255,255,0.7)', lightColor:'rgba(100,170,130,0.65)', anim:'snow-drift 4s ease-in-out infinite',   delay:'0s',    opacity:0.85, rotate:0 },
    { type:'snowflake', x:75, y:4,  size:20, color:'rgba(255,255,255,0.6)', lightColor:'rgba(180,60,60,0.45)',   anim:'snow-drift 3.5s ease-in-out infinite', delay:'0.8s',  opacity:0.7,  rotate:30 },
    { type:'snowflake', x:40, y:8,  size:14, color:'rgba(255,255,255,0.5)', lightColor:'rgba(100,170,130,0.5)',  anim:'snow-drift 5s ease-in-out infinite',   delay:'1.5s',  opacity:0.55, rotate:15 },
    { type:'ornament',  x:4,  y:75, size:40, color:'#e74c3c', extra:{capColor:'#ffd700'}, anim:'float-bob 3.5s ease-in-out infinite', delay:'0s',   opacity:0.9 },
    { type:'ornament',  x:68, y:77, size:34, color:'#2ecc71', extra:{capColor:'#ffd700'}, anim:'float-bob 4s ease-in-out infinite',   delay:'0.9s', opacity:0.85 },
    { type:'ornament',  x:82, y:72, size:24, color:'#ffd700', extra:{capColor:'#c0a040'}, anim:'float-bob 4.5s ease-in-out infinite', delay:'1.6s', opacity:0.8 },
    { type:'snowflake', x:88, y:82, size:16, color:'rgba(255,255,255,0.45)', lightColor:'rgba(100,170,130,0.45)', anim:'snow-drift 4.2s ease-in-out infinite', delay:'2s', opacity:0.5, rotate:45 },
  ],
  valentine: [
    { type:'heart', x:4,  y:6,  size:38, color:'#ff4d6d', anim:'heart-float 3s ease-in-out infinite',   delay:'0s',    opacity:0.9 },
    { type:'heart', x:72, y:8,  size:26, color:'#ff8fa3', anim:'heart-float 3.8s ease-in-out infinite', delay:'0.8s',  opacity:0.75 },
    { type:'heart', x:82, y:4,  size:18, color:'#ff4d6d', anim:'heart-float 2.8s ease-in-out infinite', delay:'1.6s',  opacity:0.6 },
    { type:'heart', x:6,  y:76, size:32, color:'#ff6b85', anim:'heart-float 4s ease-in-out infinite',   delay:'0.4s',  opacity:0.85 },
    { type:'heart', x:72, y:79, size:38, color:'#ff4d6d', anim:'heart-float 3.2s ease-in-out infinite', delay:'1.2s',  opacity:0.9 },
    { type:'heart', x:14, y:82, size:18, color:'#ff8fa3', anim:'heart-float 3.6s ease-in-out infinite', delay:'2s',    opacity:0.55 },
    { type:'particle', x:88, y:85, size:7, color:'#ff4d6d', anim:'twinkle 3s ease-in-out infinite',     delay:'0.5s',  opacity:0.7 },
  ],
  newyear: [
    { type:'star',     x:5,  y:6,  size:28, color:'#ffd700', anim:'shimmer 2.5s ease-in-out infinite',    delay:'0s',    opacity:0.9 },
    { type:'star',     x:78, y:5,  size:20, color:'#c0a040', anim:'shimmer 3s ease-in-out infinite',      delay:'0.6s',  opacity:0.75 },
    { type:'star',     x:42, y:7,  size:14, color:'#ffd700', anim:'shimmer 3.5s ease-in-out infinite',    delay:'1.2s',  opacity:0.6 },
    { type:'firework', x:3,  y:74, size:44, color:'#ffd700', anim:'firework-pop 2s ease-in-out infinite', delay:'0s',    opacity:0.88 },
    { type:'firework', x:70, y:76, size:36, color:'#e8b020', anim:'firework-pop 2.5s ease-in-out infinite', delay:'0.7s', opacity:0.82 },
    { type:'confetti', x:20, y:85, size:14, color:'#ffd700', anim:'confetti-spin 3s ease-in-out infinite',  delay:'0s',   opacity:0.8 },
    { type:'confetti', x:55, y:87, size:12, color:'#ff6b9d', anim:'confetti-spin 2.8s ease-in-out infinite', delay:'0.8s', opacity:0.7 },
    { type:'confetti', x:75, y:84, size:10, color:'#7c6fff', anim:'confetti-spin 3.2s ease-in-out infinite', delay:'1.5s', opacity:0.65 },
    { type:'particle', x:88, y:80, size:8,  color:'#ffd700', anim:'twinkle 2.2s ease-in-out infinite',    delay:'0.3s',  opacity:0.8 },
  ],
  easter: [
    { type:'egg', x:3,  y:4,  size:50, color:'#ff8fa3', extra:{stripe:'rgba(255,255,255,0.35)'}, anim:'egg-bob 3.5s ease-in-out infinite', delay:'0s',   opacity:0.9 },
    { type:'egg', x:73, y:6,  size:42, color:'#9b59b6', extra:{stripe:'rgba(255,255,255,0.3)'},  anim:'egg-bob 4s ease-in-out infinite',   delay:'0.8s', opacity:0.85 },
    { type:'egg', x:85, y:75, size:38, color:'#f1c40f', extra:{stripe:'rgba(255,255,255,0.3)'},  anim:'egg-bob 3.2s ease-in-out infinite', delay:'0.4s', opacity:0.88 },
    { type:'egg', x:4,  y:77, size:46, color:'#2ecc71', extra:{stripe:'rgba(255,255,255,0.3)'},  anim:'egg-bob 4.5s ease-in-out infinite', delay:'1.2s', opacity:0.9 },
    { type:'particle', x:40, y:82, size:10, color:'#ff8fa3', anim:'twinkle 3s ease-in-out infinite',   delay:'0.5s', opacity:0.6 },
    { type:'particle', x:60, y:84, size:8,  color:'#f1c40f', anim:'twinkle 2.8s ease-in-out infinite', delay:'1.2s', opacity:0.55 },
  ],
  stpatrick: [
    { type:'shamrock', x:2,  y:4,  size:40, color:'#2ecc71', anim:'leaf-sway 3s ease-in-out infinite',   delay:'0s',    opacity:0.88 },
    { type:'shamrock', x:72, y:6,  size:30, color:'#27ae60', anim:'leaf-sway 3.8s ease-in-out infinite', delay:'0.8s',  opacity:0.75 },
    { type:'shamrock', x:82, y:3,  size:20, color:'#2ecc71', anim:'leaf-sway 2.8s ease-in-out infinite', delay:'1.6s',  opacity:0.6 },
    { type:'shamrock', x:4,  y:74, size:44, color:'#27ae60', anim:'leaf-sway 4s ease-in-out infinite',   delay:'0.4s',  opacity:0.9 },
    { type:'shamrock', x:68, y:76, size:36, color:'#2ecc71', anim:'leaf-sway 3.5s ease-in-out infinite', delay:'1.2s',  opacity:0.85 },
    { type:'particle', x:88, y:82, size:8,  color:'#ffd700', anim:'twinkle 2.5s ease-in-out infinite',   delay:'0s',    opacity:0.8 },
    { type:'particle', x:14, y:85, size:10, color:'#ffd700', anim:'twinkle 3s ease-in-out infinite',     delay:'0.7s',  opacity:0.7 },
  ],
  birthday: [
    { type:'balloon',  x:2,  y:2,  size:44, color:'#ff6b6b', extra:{highlightColor:'rgba(255,200,200,0.3)'}, anim:'balloon-sway 3.5s ease-in-out infinite', delay:'0s',    opacity:0.92 },
    { type:'balloon',  x:76, y:1,  size:36, color:'#ffd93d', extra:{highlightColor:'rgba(255,240,150,0.3)'}, anim:'balloon-sway 4s ease-in-out infinite',   delay:'0.7s',  opacity:0.88 },
    { type:'balloon',  x:84, y:3,  size:26, color:'#6bcbff', extra:{highlightColor:'rgba(150,220,255,0.3)'}, anim:'balloon-sway 3.2s ease-in-out infinite', delay:'1.4s',  opacity:0.78 },
    { type:'balloon',  x:5,  y:70, size:50, color:'#c86bff', extra:{highlightColor:'rgba(210,150,255,0.3)'}, anim:'balloon-sway 4.5s ease-in-out infinite', delay:'0.5s',  opacity:0.9 },
    { type:'balloon',  x:68, y:68, size:42, color:'#ff6b6b', extra:{highlightColor:'rgba(255,200,200,0.3)'}, anim:'balloon-sway 3.8s ease-in-out infinite', delay:'1.1s',  opacity:0.88 },
    { type:'confetti', x:20, y:82, size:16, color:'#ffd93d', anim:'confetti-spin 2.5s ease-in-out infinite', delay:'0s',    opacity:0.85 },
    { type:'confetti', x:50, y:84, size:14, color:'#ff6b6b', anim:'confetti-spin 3s ease-in-out infinite',   delay:'0.5s',  opacity:0.8 },
    { type:'confetti', x:76, y:83, size:12, color:'#6bcbff', anim:'confetti-spin 2.8s ease-in-out infinite', delay:'1s',    opacity:0.75 },
    { type:'star',     x:88, y:78, size:20, color:'#ffd93d', anim:'shimmer 2s ease-in-out infinite',          delay:'0.3s',  opacity:0.8 },
  ],
}

export interface CustomThemeCfg {
  primary: string
  accent: string
  bg: string
  bgImage: string | null
}

export const GRADIENTS = [
  { label:'None',     value: null },
  { label:'Bokeh',    value:'radial-gradient(circle at 20% 30%,rgba(180,100,255,0.65),transparent 42%),radial-gradient(circle at 80% 70%,rgba(100,180,255,0.55),transparent 42%)' },
  { label:'Sunset',   value:'linear-gradient(160deg,#2d1b69,#ff6b6b 50%,#ffd93d)' },
  { label:'Forest',   value:'linear-gradient(160deg,#0f3d0f,#1a5c1a 40%,#2ecc71)' },
  { label:'Ocean',    value:'linear-gradient(160deg,#0a0a2a,#1a3a6a 50%,#4a90d9)' },
  { label:'Rose',     value:'linear-gradient(160deg,#3a0a1a,#8b1a3a 50%,#ff6b9d)' },
  { label:'Aurora',   value:'linear-gradient(160deg,#0a1a2a,#1a3a4a 30%,#2ecc71 70%,#ff6b9d)' },
  { label:'Dusk',     value:'linear-gradient(160deg,#1a0a2a,#3a1a4a 50%,#ff8c44)' },
]

export function resolveTheme(activeKey: string, customCfg: CustomThemeCfg, darkMode: boolean): ResolvedTheme {
  if (activeKey === 'custom') {
    const { primary, accent, bg, bgImage } = customCfg
    return {
      ...PRESETS.neon.dark,
      bg, primary, accent,
      text: '#f0f0f0',
      textMuted: 'rgba(240,240,240,0.4)',
      border: primary + '30',
      borderStrong: primary + '55',
      surface: 'rgba(0,0,0,0.5)',
      surfaceSolid: bg,
      shutterGlow: `0 0 28px ${accent}88`,
      countdownColor: accent,
      viewfinderBorder: primary + '55',
      titleGradient: `linear-gradient(135deg,${primary},${accent})`,
      cameraBlobs: [primary + '40', accent + '40', primary + '30', accent + '35', primary + '25'],
      cameraBg: bg,
      bgImage,
      scanlines: false,
      darkFrame: true,
    }
  }
  return PRESETS[activeKey]?.[darkMode ? 'dark' : 'light'] ?? PRESETS.neon.dark
}
