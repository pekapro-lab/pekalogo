// Conversión estilo facetype.js: TTF -> typeface.json de three.js (subconjunto Latin-1 + €).
import opentype from 'opentype.js'
import { writeFileSync } from 'node:fs'
const [, , inp, out] = process.argv
const font = opentype.loadSync(inp), scale = 1000 / font.unitsPerEm, r = (v) => Math.round(v * scale)
const chars = []; for (let c = 32; c <= 126; c++) chars.push(c); for (let c = 160; c <= 255; c++) chars.push(c); chars.push(0x20ac, 0x2019, 0x201c, 0x201d, 0x2013, 0x2014)
const glyphs = {}
for (const code of chars) {
  const g = font.charToGlyph(String.fromCodePoint(code)); if (!g || g.index === 0) continue
  let o = ''
  for (const c of g.getPath(0, 0, font.unitsPerEm).commands) {
    // getPath invierte Y; three.js espera Y hacia arriba en unidades de 1000
    const p = (x, y) => `${r(x / font.unitsPerEm * font.unitsPerEm)} ${r(-y)}`
    if (c.type === 'M') o += `m ${p(c.x, c.y)} `; else if (c.type === 'L') o += `l ${p(c.x, c.y)} `
    else if (c.type === 'Q') o += `q ${p(c.x, c.y)} ${p(c.x1, c.y1)} `; else if (c.type === 'C') o += `b ${p(c.x, c.y)} ${p(c.x1, c.y1)} ${p(c.x2, c.y2)} `
  }
  glyphs[String.fromCodePoint(code)] = { ha: r(g.advanceWidth), x_min: r(g.xMin || 0), x_max: r(g.xMax || 0), o: o.trim() }
}
writeFileSync(out, JSON.stringify({ glyphs, familyName: font.names.fontFamily.en, ascender: r(font.ascender), descender: r(font.descender), underlinePosition: r(font.tables.post.underlinePosition), underlineThickness: r(font.tables.post.underlineThickness), boundingBox: { xMin: r(font.tables.head.xMin), yMin: r(font.tables.head.yMin), xMax: r(font.tables.head.xMax), yMax: r(font.tables.head.yMax) }, resolution: 1000, original_font_information: { license: 'SIL Open Font License 1.1', name: font.names.fullName.en } }))
console.log(Object.keys(glyphs).length, 'glifos')
