import { chromium } from 'playwright'
import fs from 'node:fs'
const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 800, height: 800 } })
await p.goto(process.env.URL || 'http://localhost:4180/pekalogo/'); await p.waitForTimeout(1200)
const url = await p.evaluate(async () => { const s = window.__pekalogo; s.update({ name: 'P', slogan: '', shape: 'Monograma', material: 'Oro cepillado 24K', light: 'Estudio dramático', bg: 'Negro estudio', aspect: '1:1', angle: 'Frontal', bevel: 4, roughness: 15 }); s.logo.children.slice(1).forEach(c => c.visible = false); s.logo.children[0].position.y = 0; s.controls.target.set(0,0,0); s.camera.position.set(0, 0, 6.8); s.camera.lookAt(0,0,0); await new Promise(r => setTimeout(r, 400)); s.renderer.setPixelRatio(1); s.renderer.setSize(1024, 1024, false); s.camera.aspect = 1; s.camera.updateProjectionMatrix(); s.renderer.render(s.scene, s.camera); return s.renderer.domElement.toDataURL('image/png') })
fs.writeFileSync('/workspace/pekalogo-icono-1024.png', Buffer.from(url.split(',')[1], 'base64')); await b.close()
