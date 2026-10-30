import { chromium } from 'playwright'
const URL_ = process.env.URL || 'http://localhost:4173/pekalogo/'
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text())); page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(URL_); await page.waitForTimeout(1500)
for (const g of ['material', 'light', 'shape', 'aspect', 'bg']) { const n = await page.locator(`[data-group=${g}] .chip`).count(); for (let i = 0; i < n; i++) { await page.locator(`[data-group=${g}] .chip`).nth(i).click(); await page.waitForTimeout(250) } }
await page.locator('[data-group=shape] .chip', { hasText: 'Monograma' }).click(); await page.locator('[data-group=aspect] .chip', { hasText: '16:9' }).click(); await page.fill('#name', 'Pekalogó Ñandú ¿Sí?'); await page.click('#suggest'); await page.waitForTimeout(600)
await page.click('#download'); await page.waitForTimeout(800)
const exp = await page.evaluate(() => window.__pekalogoExport); const hist = await page.locator('.hist img').count()
await page.screenshot({ path: process.env.SHOT || '/workspace/pekalogo.png', fullPage: true })
await page.setViewportSize({ width: 1400, height: 850 }); await page.waitForTimeout(800); await page.screenshot({ path: '/workspace/pekalogo-desktop.png' })
await browser.close()
console.log(JSON.stringify({ exportBytes: exp, hist, errors }))
if (!exp || !hist || errors.length) process.exit(1)
