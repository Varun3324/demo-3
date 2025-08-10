import { useMemo, useState } from 'react'
import './App.css'
import './index.css'
import { motion, AnimatePresence } from 'framer-motion'

// Generate 200 shades programmatically
const generateShades = (): { name: string; hex: string }[] => {
  const baseHues = [0, 12, 24, 36, 48, 60, 90, 120, 150, 180, 200, 220, 240, 260, 280, 300, 320, 340]
  const shades: { name: string; hex: string }[] = []
  for (let i = 0; i < 200; i++) {
    const hue = baseHues[i % baseHues.length]
    const sat = 60 + ((i * 7) % 35) // 60-95
    const light = 40 + ((i * 11) % 50) // 40-89
    const hex = hslToHex(hue, sat, light)
    shades.push({ name: `Shade ${i + 1}`, hex })
  }
  return shades
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

// Simple SVG lehenga template (outline only)
const LehengaSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 300 300" width="260" height="260" aria-label="Lehenga preview">
    <defs>
      <linearGradient id="shading" x1="0" x2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.9" />
        <stop offset="100%" stopColor={color} stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <g stroke="#222" strokeWidth="2" fill="url(#shading)">
      <path d="M150 40c20 0 32 12 36 32 8 40 32 72 60 120 6 10-6 20-18 20H72c-12 0-24-10-18-20 28-48 52-80 60-120 4-20 16-32 36-32z" />
      <path d="M84 212h132" fill="none" />
    </g>
  </svg>
)

const HeroBackground = () => {
  // Animated background made of minimal clothing-like silhouettes
  const shapes = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: 20 + Math.random() * 40,
    rot: Math.random() * 360,
    delay: Math.random() * 2,
  }))
  return (
    <div className="bg-canvas" aria-hidden>
      {shapes.map((s) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, rotate: s.rot }}
          animate={{ opacity: 0.08, rotate: s.rot + 30 }}
          transition={{ duration: 10, delay: s.delay, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.r,
            height: s.r * 1.4,
            borderRadius: 12,
            background: '#f3f4f6',
            transformOrigin: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,.03) inset',
          }}
        />
      ))}
    </div>
  )
}

function App() {
  const shades = useMemo(generateShades, [])
  const [selectedShade, setSelectedShade] = useState<string>(shades[0].hex)
  const [rotatingIdx, setRotatingIdx] = useState<number | null>(null)

  return (
    <div>
      <HeroBackground />
      <header className="header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img className="logo" src="/vite.svg" alt="Simran Boutique" />
            <strong>Simran Boutique</strong>
          </div>
          <nav style={{ display: 'flex', gap: 16 }}>
            <a href="#linen">Linen</a>
            <a href="#custom">Custom Lehenga</a>
            <a href="#colors">200 Shades</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, margin: 0 }}>Effortless white canvas, all eyes on the fabric</h1>
          <p style={{ color: 'var(--muted)', marginTop: 12 }}>Premium linen in 200 shades. Visualize lehenga designs in any color instantly.</p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a className="btn" href="#linen">Shop Linen</a>
            <a className="btn" href="#custom">Customize Lehenga</a>
          </div>
        </div>
      </section>

      <section id="colors" className="container">
        <h2>Explore 200 Shades</h2>
        <p style={{ color: 'var(--muted)' }}>Tap a color to preview on lehenga and products.</p>
        <div className="grid grid-4" style={{ marginTop: 12 }}>
          {shades.map((s) => (
            <button
              key={s.name}
              aria-label={s.name}
              className={`shade-swatch ${selectedShade === s.hex ? 'selected' : ''}`}
              style={{ background: s.hex }}
              onClick={() => setSelectedShade(s.hex)}
              onMouseEnter={() => setSelectedShade(s.hex)}
            />
          ))}
        </div>
      </section>

      <section id="linen" className="container" style={{ marginTop: 40 }}>
        <h2>Linen Collection</h2>
        <p style={{ color: 'var(--muted)' }}>Breathable, durable linen fabrics. Click a card to rotate.</p>
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              className="card rotator"
              style={{ display: 'grid', placeItems: 'center', padding: 24 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setRotatingIdx(i === rotatingIdx ? null : i)}
            >
              <AnimatePresence>
                <motion.div
                  key={`${i}-${rotatingIdx === i}`}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: rotatingIdx === i ? 360 : 0, backgroundColor: selectedShade }}
                  transition={{ duration: 0.8 }}
                  style={{
                    width: 160,
                    height: 100,
                    borderRadius: 12,
                    background: selectedShade,
                    boxShadow: '0 10px 30px rgba(0,0,0,.06)',
                  }}
                />
              </AnimatePresence>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <strong>Linen Fabric</strong>
                  <div style={{ color: 'var(--muted)' }}>Shade: {selectedShade.toUpperCase()}</div>
                </div>
                <button className="btn">Add</button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="custom" className="container" style={{ marginTop: 40 }}>
        <h2>Customize Your Lehenga</h2>
        <p style={{ color: 'var(--muted)' }}>Select any shade to visualize the lehenga design instantly.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
          <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
            <LehengaSVG color={selectedShade} />
          </div>
          <div>
            <h3>Pick color</h3>
            <div className="grid grid-4" style={{ marginTop: 8 }}>
              {shades.slice(0, 24).map((s) => (
                <button
                  key={s.name}
                  className={`shade-swatch ${selectedShade === s.hex ? 'selected' : ''}`}
                  style={{ background: s.hex }}
                  onClick={() => setSelectedShade(s.hex)}
                />
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <button className="btn">Save Design</button>
              <button className="btn">Add to Cart</button>
            </div>
          </div>
        </div>
      </section>

      <footer id="about" className="footer container">
        © {new Date().getFullYear()} Simran Boutique — Premium linen and bespoke couture.
      </footer>
    </div>
  )
}

export default App
