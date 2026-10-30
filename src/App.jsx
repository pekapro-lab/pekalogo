import React, { useEffect, useRef, useState } from 'react'
import { LogoScene, MATERIALS, LIGHTS, BACKGROUNDS, ASPECTS, ANGLES, SHAPES } from './scene.js'
const DEF = { name: 'PEKAPRO', slogan: 'Crea sin límites', idea: 'Un anillo orbital alrededor de un nucleo', shape: 'Anillo orbital', material: 'Cromo líquido', light: 'Estudio dramático', bg: 'Negro estudio', aspect: '1:1', angle: 'Tres cuartos', bevel: 3, roughness: 20 }
const pick = (a) => a[Math.floor(Math.random() * a.length)]
const IDEAS = { 'Monolito': 'un monolito pulido que se eleva', 'Anillo orbital': 'órbitas que giran alrededor de un núcleo', 'Icosaedro': 'un cristal geométrico de veinte caras', 'Monograma': 'la inicial de la marca dentro de un aro', 'Toro nudo': 'un nudo infinito que simboliza conexión', 'Prisma hexagonal': 'un hexágono sólido como una colmena', 'Esfera facetada': 'una gema facetada', 'Estrella': 'una estrella que marca el rumbo' }
function guessShape(idea) { const t = idea.toLowerCase(); const m = [['monolit', 'Monolito'], ['anillo', 'Anillo orbital'], ['orbit', 'Anillo orbital'], ['icosa', 'Icosaedro'], ['cristal', 'Icosaedro'], ['inicial', 'Monograma'], ['letra', 'Monograma'], ['monogram', 'Monograma'], ['nudo', 'Toro nudo'], ['infinit', 'Toro nudo'], ['hex', 'Prisma hexagonal'], ['gema', 'Esfera facetada'], ['esfera', 'Esfera facetada'], ['estrella', 'Estrella']].find(([k]) => t.includes(k)); return m?.[1] }
const Chips = ({ list, value, onChange, id }) => <div className="chips" data-group={id}>{list.map((k) => <button key={k} className={'chip' + (k === value ? ' on' : '')} onClick={() => onChange(k)}>{k}</button>)}</div>
export default function App() {
  const [o, setO] = useState(() => ({ ...DEF, ...JSON.parse(localStorage.getItem('pekalogo:last') || '{}') }))
  const [hist, setHist] = useState(() => JSON.parse(localStorage.getItem('pekalogo:hist') || '[]'))
  const [about, setAbout] = useState(false)
  const box = useRef(), sc = useRef()
  const set = (k) => (v) => setO((p) => ({ ...p, [k]: v }))
  useEffect(() => { sc.current = new LogoScene(box.current); window.__pekalogo = sc.current }, [])
  useEffect(() => { const t = setTimeout(() => { sc.current.update(o); localStorage.setItem('pekalogo:last', JSON.stringify(o)) }, 150); return () => clearTimeout(t) }, [o])
  const suggest = () => { const shape = pick(SHAPES.filter((s) => s !== 'Ninguno')); setO((p) => ({ ...p, shape, idea: IDEAS[shape], material: pick(Object.keys(MATERIALS)), light: pick(Object.keys(LIGHTS)), bg: pick(Object.keys(BACKGROUNDS)), angle: pick(Object.keys(ANGLES)), bevel: 1 + Math.floor(Math.random() * 5), roughness: Math.floor(Math.random() * 60) })) }
  const save = () => { const h = [{ o, img: sc.current.thumb(), t: Date.now() }, ...hist].slice(0, 20); setHist(h); try { localStorage.setItem('pekalogo:hist', JSON.stringify(h)) } catch {} }
  const download = () => { const a = document.createElement('a'); a.href = sc.current.exportPNG(o.aspect); a.download = `pekalogo-${(o.name || 'logo').replace(/\W+/g, '-')}-${o.aspect.replace(':', 'x')}.png`; a.click(); save(); window.__pekalogoExport = a.href.length }
  return <div className="app">
    <div className="panel">
      <header style={{ margin: '-12px -12px 0' }}><h1>Pekalogo <small style={{ color: '#f5b301' }}>3D</small></h1><button className="sec" onClick={() => setAbout(true)}>Acerca de</button></header>
      <label>Nombre de la marca</label><input type="text" id="name" value={o.name} onChange={(e) => set('name')(e.target.value)} />
      <label>Lema</label><input type="text" id="slogan" value={o.slogan} onChange={(e) => set('slogan')(e.target.value)} />
      <label>Idea del símbolo</label><input type="text" id="idea" value={o.idea} onChange={(e) => { const g = guessShape(e.target.value); setO((p) => ({ ...p, idea: e.target.value, ...(g ? { shape: g } : {}) })) }} />
      <button className="sec" id="suggest" style={{ marginTop: 8 }} onClick={suggest}>✨ Sugerir símbolo</button>
      <label>Símbolo</label><Chips id="shape" list={SHAPES} value={o.shape} onChange={set('shape')} />
      <label>Material</label><Chips id="material" list={Object.keys(MATERIALS)} value={o.material} onChange={set('material')} />
      <label>Iluminación</label><Chips id="light" list={Object.keys(LIGHTS)} value={o.light} onChange={set('light')} />
      <label>Fondo</label><Chips id="bg" list={Object.keys(BACKGROUNDS)} value={o.bg} onChange={set('bg')} />
      <label>Formato</label><Chips id="aspect" list={Object.keys(ASPECTS)} value={o.aspect} onChange={set('aspect')} />
      <label>Ángulo de cámara</label><Chips id="angle" list={Object.keys(ANGLES)} value={o.angle} onChange={set('angle')} />
      <label>Biselado: {o.bevel}</label><input type="range" min="1" max="5" value={o.bevel} onChange={(e) => set('bevel')(+e.target.value)} />
      <label>Rugosidad: {o.roughness}</label><input type="range" min="0" max="100" value={o.roughness} onChange={(e) => set('roughness')(+e.target.value)} />
      <button className="main" id="download" onClick={download}>⬇ Descargar PNG</button>
      <button className="sec" style={{ width: '100%', marginTop: 8 }} onClick={save}>Guardar en el historial</button>
      <label>Historial</label>
      <div className="hist">{hist.length ? hist.map((h) => <img key={h.t} src={h.img} title="Recuperar" onClick={() => setO(h.o)} />) : <small style={{ color: '#777' }}>Aún no hay logos guardados.</small>}</div>
      {hist.length > 0 && <button className="sec" style={{ marginTop: 6 }} onClick={() => { setHist([]); localStorage.removeItem('pekalogo:hist') }}>Borrar historial</button>}
    </div>
    <div className="stage"><div className="frame" ref={box} style={{ aspectRatio: String(ASPECTS[o.aspect]), maxWidth: ASPECTS[o.aspect] < 1 ? '50vh' : '100%' }} /></div>
    {about && <div className="modal" onClick={() => setAbout(false)}><div onClick={(e) => e.stopPropagation()}>
      <h2>Acerca de Pekalogo</h2><p>Generador de logos 3D gratuito de Pekapro. Todo se calcula en tu navegador con Three.js: texto 3D con biselado, símbolos paramétricos y materiales físicos. Sin APIs de pago ni inteligencia artificial externa.</p><p>Gira el logo con el dedo o el ratón y descárgalo en PNG de alta resolución. El historial se guarda solo en este navegador.</p><p><small>Licencia AGPL-3.0 · Pekapro Lab</small></p><button className="main" onClick={() => setAbout(false)}>Cerrar</button></div></div>}
  </div>
}
