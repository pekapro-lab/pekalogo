import { chromium } from 'playwright'
const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1400, height: 850 } })
await p.goto(process.env.URL || 'http://localhost:4180/pekalogo/'); await p.waitForTimeout(1200)
await p.evaluate(() => localStorage.clear())
const o = { name: 'Pekalogo', slogan: 'Logos 3D gratis', shape: 'Anillo orbital', material: 'Cromo líquido', light: 'Estudio dramático', bg: 'Degradado aurora', aspect: '16:9', angle: 'Tres cuartos', bevel: 4, roughness: 8 }
const url = await p.evaluate(async (o) => { const s = window.__pekalogo; s.update(o); await new Promise(r => setTimeout(r, 500)); s.renderer.setPixelRatio(1); s.renderer.setSize(1200, 630, false); s.camera.aspect = 1200 / 630; s.camera.updateProjectionMatrix(); s.renderer.render(s.scene, s.camera); return s.renderer.domElement.toDataURL('image/png') }, o)
const fs = await import('node:fs'); fs.writeFileSync('/workspace/pekalogo-cover.png', Buffer.from(url.split(',')[1], 'base64')); await b.close()
