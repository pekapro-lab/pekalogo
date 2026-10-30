import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import fontData from './font.json'
const font = new Font(fontData)
export const clean = (s) => [...(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')].filter((c) => c === ' ' || font.data.glyphs[c]).join('')

function canvasTex(draw, w = 512) { const c = document.createElement('canvas'); c.width = c.height = w; draw(c.getContext('2d'), w); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t }
const marble = () => canvasTex((g, w) => { g.fillStyle = '#eeeae4'; g.fillRect(0, 0, w, w); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(90,90,100,${Math.random() * .35})`; g.lineWidth = Math.random() * 3; g.beginPath(); let x = Math.random() * w, y = 0; g.moveTo(x, y); while (y < w) { x += (Math.random() - .5) * 40; y += 20; g.lineTo(x, y) } g.stroke() } })
const carbon = () => { const t = canvasTex((g, w) => { const s = w / 16; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { const gr = g.createLinearGradient(i * s, j * s, (i + ((i + j) % 2 ? 1 : 0)) * s, (j + ((i + j) % 2 ? 0 : 1)) * s); gr.addColorStop(0, '#111'); gr.addColorStop(.5, '#3a3a3a'); gr.addColorStop(1, '#111'); g.fillStyle = gr; g.fillRect(i * s, j * s, s, s) } }); t.repeat.set(3, 3); return t }
const holo = () => canvasTex((g, w) => { const gr = g.createLinearGradient(0, 0, w, w); ['#ff6ec7', '#7afcff', '#feff9c', '#a78bfa', '#ff6ec7'].forEach((c, i) => gr.addColorStop(i / 4, c)); g.fillStyle = gr; g.fillRect(0, 0, w, w) })

export const MATERIALS = {
  'Cromo líquido': (r) => new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: r * .5, envMapIntensity: 1.4 }),
  'Oro cepillado 24K': (r) => new THREE.MeshPhysicalMaterial({ color: 0xffc95c, metalness: 1, roughness: .15 + r * .6, clearcoat: .3 }),
  'Vidrio esmerilado': (r) => new THREE.MeshPhysicalMaterial({ color: 0xdfefff, metalness: 0, roughness: .05 + r * .7, transmission: 1, thickness: 1.2, ior: 1.5 }),
  'Obsidiana mate': (r) => new THREE.MeshPhysicalMaterial({ color: 0x0c0c12, metalness: .2, roughness: .3 + r * .7, clearcoat: .6, clearcoatRoughness: .4 }),
  'Resina holográfica': (r) => new THREE.MeshPhysicalMaterial({ map: holo(), metalness: .3, roughness: r * .5, iridescence: 1, iridescenceIOR: 1.8, clearcoat: 1 }),
  'Núcleo neón': (r) => new THREE.MeshPhysicalMaterial({ color: 0x00e5ff, emissive: 0x00c8ff, emissiveIntensity: 1.6, roughness: .2 + r * .5 }),
  'Mármol veteado': (r) => new THREE.MeshPhysicalMaterial({ map: marble(), roughness: .1 + r * .6, clearcoat: .8 }),
  'Fibra de carbono': (r) => new THREE.MeshPhysicalMaterial({ map: carbon(), metalness: .5, roughness: .2 + r * .5, clearcoat: 1, clearcoatRoughness: .1 }),
}
export const LIGHTS = {
  'Estudio dramático': [[0xffffff, 3, [4, 5, 3]], [0x6688ff, 1, [-5, 1, -2]]],
  'Neón cyber': [[0xff00cc, 4, [-4, 2, 3]], [0x00ffee, 4, [4, -1, 3]]],
  'Hora dorada': [[0xffa040, 3.5, [5, 2, 2]], [0x4060a0, .8, [-4, 3, -2]]],
  'Softbox mínimo': [[0xffffff, 1.6, [0, 6, 4]], [0xffffff, 1, [0, -2, 5]]],
  'Contraluz': [[0xffffff, 5, [0, 3, -5]], [0x8899ff, .6, [0, 0, 5]]],
}
export const BACKGROUNDS = { 'Negro estudio': ['#050507', '#18181f'], 'Blanco infinito': ['#ffffff', '#d8d8de'], 'Degradado aurora': ['#1b0b3a', '#0a6a7a'], 'Atardecer': ['#2a0e2e', '#f08a3c'], 'Azul profundo': ['#020818', '#123a7a'] }
export const ASPECTS = { '1:1': 1, '16:9': 16 / 9, '4:3': 4 / 3, '9:16': 9 / 16 }
export const ANGLES = { 'Frontal': [0, 0, 9], 'Tres cuartos': [5, 2, 7.5], 'Picado': [0, 6.5, 6.5], 'Contrapicado': [-3, -4, 7.5] }
export const SHAPES = ['Monolito', 'Anillo orbital', 'Icosaedro', 'Monograma', 'Toro nudo', 'Prisma hexagonal', 'Esfera facetada', 'Estrella', 'Ninguno']

function bgTex([a, b]) { return canvasTex((g, w) => { const gr = g.createRadialGradient(w / 2, w * .4, 10, w / 2, w / 2, w * .75); gr.addColorStop(0, b); gr.addColorStop(1, a); g.fillStyle = gr; g.fillRect(0, 0, w, w) }) }

function symbol(shape, name, bevel, mat) {
  const b = bevel * .02, grp = new THREE.Group()
  const add = (geo, rot) => { const m = new THREE.Mesh(geo, mat); if (rot) m.rotation.set(...rot); grp.add(m); return m }
  switch (shape) {
    case 'Monolito': add(new THREE.BoxGeometry(.9, 2, .35, 1, 1, 1)); break
    case 'Anillo orbital': add(new THREE.TorusGeometry(.9, .12 + b, 24, 96), [1.2, .3, 0]); add(new THREE.TorusGeometry(.9, .12 + b, 24, 96), [-.4, 1, 0]); add(new THREE.SphereGeometry(.35, 48, 32)); break
    case 'Icosaedro': add(new THREE.IcosahedronGeometry(1, 0)); break
    case 'Monograma': { const ch = clean(name).trim()[0] || 'P'; const g = new TextGeometry(ch.toUpperCase(), { font, size: 1.8, depth: .5, curveSegments: 8, bevelEnabled: true, bevelThickness: b * 2, bevelSize: b * 1.5, bevelSegments: 4 }); g.center(); add(g); add(new THREE.TorusGeometry(1.45, .06 + b / 2, 16, 96)); break }
    case 'Toro nudo': add(new THREE.TorusKnotGeometry(.7, .22 + b, 160, 24)); break
    case 'Prisma hexagonal': add(new THREE.CylinderGeometry(1, 1, .5, 6), [Math.PI / 2, 0, 0]); break
    case 'Esfera facetada': add(new THREE.IcosahedronGeometry(1, 1)); break
    case 'Estrella': { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? .45 : 1.1, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r) } const g = new THREE.ExtrudeGeometry(s, { depth: .35, bevelEnabled: true, bevelThickness: b * 2, bevelSize: b * 2, bevelSegments: 4 }); g.center(); add(g); break }
    default: break
  }
  return grp
}
function text(str, size, bevel, mat) {
  const s = clean(str); if (!s.trim()) return null
  const b = bevel * .012 * size
  const g = new TextGeometry(s, { font, size, depth: size * .35, curveSegments: 6, bevelEnabled: true, bevelThickness: b, bevelSize: b * .8, bevelSegments: 3 }); g.center(); return new THREE.Mesh(g, mat)
}

export class LogoScene {
  constructor(el) {
    this.el = el
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.appendChild(this.renderer.domElement)
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(35, 1, .1, 100)
    this.scene.environment = new THREE.PMREMGenerator(this.renderer).fromScene(new RoomEnvironment(), .04).texture
    this.controls = new OrbitControls(this.camera, this.renderer.domElement); this.controls.enableDamping = true; this.controls.enablePan = false
    this.controls.addEventListener('change', () => this.render())
    this.logo = new THREE.Group(); this.lights = new THREE.Group(); this.scene.add(this.logo, this.lights)
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(el)
    this.pending = false
  }
  render() { if (this.pending) return; this.pending = true; requestAnimationFrame(() => { this.pending = false; this.controls.update(); this.renderer.render(this.scene, this.camera) }) }
  resize() { const w = this.el.clientWidth, h = this.el.clientHeight; if (!w || !h) return; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.render() }
  update(o) {
    this.logo.traverse((m) => { m.geometry?.dispose() }); this.logo.clear(); this.lights.clear()
    const mat = MATERIALS[o.material](o.roughness / 100)
    const sym = symbol(o.shape, o.name, o.bevel, mat), nm = text(o.name, .7, o.bevel, mat), sl = text(o.slogan, .22, o.bevel, mat)
    let y = 0; const parts = []
    if (sym.children.length) parts.push([sym, 2.4]); if (nm) parts.push([nm, .9]); if (sl) parts.push([sl, .4])
    const total = parts.reduce((a, p) => a + p[1], 0) + (parts.length - 1) * .3; y = total / 2
    for (const [obj, h] of parts) { obj.position.y = y - h / 2; y -= h + .3; this.logo.add(obj) }
    if (nm) { const w = new THREE.Box3().setFromObject(nm).getSize(new THREE.Vector3()).x; if (w > 7) nm.scale.setScalar(7 / w) }
    if (sl) { const w = new THREE.Box3().setFromObject(sl).getSize(new THREE.Vector3()).x; if (w > 6) sl.scale.setScalar(6 / w) }
    this.lights.add(new THREE.AmbientLight(0xffffff, .15))
    for (const [c, i, p] of LIGHTS[o.light]) { const l = new THREE.DirectionalLight(c, i); l.position.set(...p); this.lights.add(l) }
    this.scene.environmentIntensity = o.light === 'Neón cyber' ? .4 : 1
    this.scene.background?.dispose?.(); this.scene.background = bgTex(BACKGROUNDS[o.bg])
    const fit = Math.max(1, total / 4.2) * (ASPECTS[o.aspect] < 1 ? 1.5 : 1)
    this.camera.position.set(...ANGLES[o.angle].map((v) => v * fit)); this.controls.target.set(0, 0, 0)
    this.resize(); this.render()
  }
  exportPNG(aspect) {
    const r = ASPECTS[aspect], long = 2400, w = r >= 1 ? long : Math.round(long * r), h = r >= 1 ? Math.round(long / r) : long
    const old = this.renderer.getPixelRatio(); const ow = this.el.clientWidth, oh = this.el.clientHeight
    this.renderer.setPixelRatio(1); this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix()
    this.renderer.render(this.scene, this.camera); const url = this.renderer.domElement.toDataURL('image/png')
    this.renderer.setPixelRatio(old); this.renderer.setSize(ow, oh, false); this.camera.aspect = ow / oh; this.camera.updateProjectionMatrix(); this.render()
    return url
  }
  thumb() { this.renderer.render(this.scene, this.camera); const c = document.createElement('canvas'); c.width = c.height = 128; const s = this.renderer.domElement, m = Math.min(s.width, s.height); c.getContext('2d').drawImage(s, (s.width - m) / 2, (s.height - m) / 2, m, m, 0, 0, 128, 128); return c.toDataURL('image/jpeg', .7) }
}
