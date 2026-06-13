import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { C, FadeSection, SecLabel, StarSpark } from './Shared'

const MAP_SRC = './media/worlds_map_ru.jpg'

// ─── Canvas: draw brand star-spark shape ─────────────────────────────────────
const drawStarShape = (ctx, x, y, size, color) => {
  ctx.save()
  ctx.fillStyle = color
  ctx.translate(x, y)
  const s = size
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.bezierCurveTo(s * .15, -s * .3, s * .3, -s * .15, s, 0)
  ctx.bezierCurveTo(s * .3, s * .15, s * .15, s * .3, 0, s)
  ctx.bezierCurveTo(-s * .15, s * .3, -s * .3, s * .15, -s, 0)
  ctx.bezierCurveTo(-s * .3, -s * .15, -s * .15, -s * .3, 0, -s)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// ─── Four concentric gold halos (outer→inner order) ──────────────────────────
// Each has: radius, peak opacity, rgb color, pulse amplitude, pulse frequency
// Colors go from bronze (outer) to white-gold (inner) — classic gold gradient
const HALOS = [
  { r: 210, a: 0.07, rgb: [140, 96, 22], pAmp: 0.42, pFreq: 0.00088 }, // латунь-бронза
  { r: 105, a: 0.20, rgb: [175, 132, 40], pAmp: 0.33, pFreq: 0.00145 }, // тёмное золото
  { r: 50, a: 0.46, rgb: [214, 172, 64], pAmp: 0.24, pFreq: 0.00230 }, // золото
  { r: 19, a: 0.88, rgb: [252, 238, 155], pAmp: 0.15, pFreq: 0.00380 }, // белое золото, ядро
]

// ─── Star follower — portal into body to avoid fixed+transform ancestor bug ──
const StarFollower = ({ mountRef }) => createPortal(
  <div
    ref={mountRef}
    style={{
      position: 'fixed', top: 0, left: 0,
      transform: 'translate(-600px,-600px)',
      opacity: 0, transition: 'opacity 0.2s ease',
      pointerEvents: 'none', zIndex: 9999,
      width: 22, height: 22,
    }}
  >
    <svg width="22" height="22" viewBox="-11 -11 22 22"
      style={{
        display: 'block', position: 'relative', zIndex: 1,
        filter: 'drop-shadow(0 0 5px rgba(217,180,90,0.9)) drop-shadow(0 0 14px rgba(194,154,72,0.5))',
      }}
    >
      <path d="M0,-10 C1.5,-3 3,-1.5 10,0 C3,1.5 1.5,3 0,10 C-1.5,3 -3,1.5 -10,0 C-3,-1.5 -1.5,-3 0,-10 Z"
        fill="#D9B45A" />
      <path d="M0,-10 C1.5,-3 3,-1.5 10,0 C3,1.5 1.5,3 0,10 C-1.5,3 -3,1.5 -10,0 C-3,-1.5 -1.5,-3 0,-10 Z"
        fill="rgba(255,255,235,0.55)" transform="scale(0.32)" />
    </svg>
  </div>,
  document.body
)

// ─── Vertical gold scrollwork ornament ───────────────────────────────────────
const VerticalRule = ({ flip = false }) => (
  <div style={{
    width: 36, alignSelf: 'stretch', flexShrink: 0, position: 'relative',
    transform: flip ? 'scaleX(-1)' : 'none'
  }}>
    <div style={{
      position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1,
      background: `linear-gradient(to bottom, transparent 0%, ${C.zoloto} 8%, ${C.zoloto} 92%, transparent 100%)`,
      opacity: 0.33, transform: 'translateX(-50%)',
    }} />
    <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', width: 18, height: 1, background: C.zoloto, opacity: 0.34 }} />
    <svg width="36" height="100" viewBox="0 0 36 100" fill="none" stroke={C.zoloto} strokeWidth="0.8"
      style={{ position: 'absolute', top: 26, left: 0, opacity: 0.44 }}>
      <path d="M18,2 L18,24 Q18,34 9,34 Q2,34 2,27 Q2,20 9,20 Q16,20 16,27" />
      <path d="M18,48 L18,70 Q18,80 9,80 Q2,80 2,73 Q2,66 9,66 Q16,66 16,73" />
    </svg>
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
      <StarSpark size={8} color={C.zoloto} style={{ opacity: 0.50 }} />
    </div>
    <svg width="36" height="100" viewBox="0 0 36 100" fill="none" stroke={C.zoloto} strokeWidth="0.8"
      style={{ position: 'absolute', bottom: 26, left: 0, opacity: 0.44, transform: 'rotate(180deg)' }}>
      <path d="M18,2 L18,24 Q18,34 9,34 Q2,34 2,27 Q2,20 9,20 Q16,20 16,27" />
      <path d="M18,48 L18,70 Q18,80 9,80 Q2,80 2,73 Q2,66 9,66 Q16,66 16,73" />
    </svg>
    <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: 18, height: 1, background: C.zoloto, opacity: 0.34 }} />
  </div>
)

// ─── Configurable world circles ──────────────────────────────────────────────
// cx / cy  — позиция центра, % от ширины / высоты изображения (0–100)
// r        — радиус, % от ширины контейнера (0–100)
// strokeW  — толщина обводки в пикселях
// mode: 'erase'        → ЧЁРНЫЙ эффект: вырезает ореол по кольцу, создаёт тёмную окружность
// mode: 'color' + rgb  → ЦВЕТНОЙ: рисует цветное кольцо поверх ореола
const CIRCLES = [
]

// ─── Zone labels ──────────────────────────────────────────────────────────────
// top  — вертикальная позиция (% или px)
// left — горизонтальная позиция (% или px), по умолчанию '50%' (центр)
const ZONES = [
  {
    id: 'prav', top: '18%', left: '49%', name: 'ПРАВЬ', sub: 'Сияние · Проявленность', color: C.zolotoYar,
    desc: 'Свет, из которого ты исходишь. Дело — в мир.'
  },
  {
    id: 'yav', top: '48%', left: '47.5%', name: 'ЯВЬ', sub: 'Точка баланса', color: C.kostYar,
    desc: 'Баланс — между светом и тенью рождается энергия.'
  },
  {
    id: 'nav', top: '77%', left: '50%', name: 'НАВЬ', sub: 'Глубина · Портал', color: C.krovYar,
    desc: 'Тьма — строительный материал, а не враг.'
  },
]

// ─── Map + star-reveal ────────────────────────────────────────────────────────
const MapReveal = () => {
  const [activated, setActivated] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const containerRef = useRef(null)
  const overlayRef = useRef(null)
  const trailRef = useRef(null)
  const starRef = useRef(null)
  const posRef = useRef({ x: -200, y: -200 })
  const velRef = useRef({ x: 0, y: 0 })
  const activeRef = useRef(false)

  // Overlay is permanently dark — no starOverlay, no dynamic updates
  useEffect(() => {
    if (overlayRef.current) overlayRef.current.style.background = 'rgba(1,2,1,0.92)'
  }, [])

  // Trail canvas: 4 concentric gold halos + fading star trail
  useEffect(() => {
    const canvas = trailRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const el = containerRef.current
      if (!el) return
      canvas.width = el.offsetWidth
      canvas.height = el.offsetHeight
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf
    const draw = () => {
      const W = canvas.width, H = canvas.height

      // Fade trail → black (= transparent in screen blend)
      ctx.fillStyle = activeRef.current ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.045)'
      ctx.fillRect(0, 0, W, H)

      if (activeRef.current) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const lx = posRef.current.x - rect.left
          const ly = posRef.current.y - rect.top

          if (lx >= -20 && lx <= W + 20 && ly >= -20 && ly <= H + 20) {
            const { x: vx, y: vy } = velRef.current
            const speed = Math.sqrt(vx * vx + vy * vy)
            const angle = speed > 0.5 ? Math.atan2(vy, vx) : 0
            const stretch = Math.min(1 + speed * 0.05, 2.2)
            const squash = 1 / Math.sqrt(stretch)
            const now = Date.now()

            // Draw outer → inner so inner halos render on top
            for (let i = 0; i < HALOS.length; i++) {
              const h = HALOS[i]
              const pulse = 1 + Math.sin(now * h.pFreq + i * 1.45) * h.pAmp
              const r = h.r * pulse
              const [cr, cg, cb] = h.rgb

              ctx.save()
              ctx.translate(lx, ly)
              ctx.rotate(angle)
              ctx.scale(stretch, squash)

              const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
              grd.addColorStop(0, `rgba(${cr},${cg},${cb},${+(h.a * pulse).toFixed(3)})`)
              grd.addColorStop(0.42, `rgba(${cr},${cg},${cb},${+(h.a * pulse * 0.25).toFixed(3)})`)
              grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)

              ctx.beginPath()
              ctx.arc(0, 0, r, 0, Math.PI * 2)
              ctx.fillStyle = grd
              ctx.fill()
              ctx.restore()
            }

            // ── World circles: appear as cursor approaches ──────────────────
            // Max outer halo reach (with pulse amplitude)
            const outerReach = HALOS[0].r * (1 + HALOS[0].pAmp)  // ~298px
            for (const c of CIRCLES) {
              const cxPx = c.cx / 100 * W
              const cyPx = c.cy / 100 * H
              const dist = Math.sqrt((lx - cxPx) ** 2 + (ly - cyPx) ** 2)
              const vis = Math.max(0, 1 - dist / outerReach)
              if (vis < 0.01) continue

              const rPx = c.r / 100 * W
              ctx.save()
              ctx.beginPath()
              ctx.arc(cxPx, cyPx, rPx, 0, Math.PI * 2)
              ctx.lineWidth = c.strokeW

              if (c.mode === 'erase') {
                // Вырезаем кольцо из ореола → тёмное кольцо на золотом фоне
                ctx.globalCompositeOperation = 'destination-out'
                ctx.strokeStyle = `rgba(0,0,0,${(vis * 0.82).toFixed(3)})`
              } else {
                ctx.strokeStyle = `rgba(${c.rgb.join(',')},${(vis * 0.88).toFixed(3)})`
              }
              ctx.stroke()
              ctx.restore()
            }

            // Star-spark on top — no stretch, stays sharp
            drawStarShape(ctx, lx, ly, 7, 'rgba(245,215,105,0.93)')
            drawStarShape(ctx, lx, ly, 2.8, 'rgba(255,252,228,0.82)')
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // Mobile: auto-drift
  useEffect(() => {
    const mob = window.matchMedia('(hover: none)').matches
    setIsMobile(mob)
    if (!mob) return
    const timer = setTimeout(() => {
      setActivated(true)
      activeRef.current = true
      let t = 0, raf
      const tick = () => {
        t += 0.004
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          posRef.current = {
            x: rect.left + rect.width * (50 + Math.sin(t) * 28) / 100,
            y: rect.top + rect.height * (42 + Math.cos(t * 0.7) * 22) / 100,
          }
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const onMove = (e) => {
    if (!activated) return
    const cx = e.clientX, cy = e.clientY
    const dx = cx - posRef.current.x
    const dy = cy - posRef.current.y
    velRef.current = {
      x: velRef.current.x * 0.42 + dx * 0.58,
      y: velRef.current.y * 0.42 + dy * 0.58,
    }
    posRef.current = { x: cx, y: cy }
    if (starRef.current) {
      starRef.current.style.transform = `translate(${cx - 11}px, ${cy - 11}px)`
    }
  }

  const onEnter = () => {
    if (!activated) return
    activeRef.current = true
    if (starRef.current) starRef.current.style.opacity = '1'
  }

  const onLeave = () => {
    activeRef.current = false
    velRef.current = { x: 0, y: 0 }
    if (starRef.current) starRef.current.style.opacity = '0'
  }

  const onClick = () => {
    if (activated) return
    setActivated(true)
    activeRef.current = true
    if (starRef.current) starRef.current.style.opacity = '1'
  }

  return (
    <>
      <StarFollower mountRef={starRef} />

      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <VerticalRule />

        <div
          ref={containerRef}
          onMouseMove={onMove}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={onClick}
          style={{
            position: 'relative', flex: 1,
            cursor: activated ? 'none' : 'pointer',
            userSelect: 'none',
          }}
        >
          <img src={MAP_SRC} alt="Карта миров" style={{ width: '100%', height: 'auto', display: 'block' }} />

          {/* Dark overlay — permanently static — z:2 */}
          <div ref={overlayRef} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} />

          {/* Trail canvas — halos via screen blend — z:3 */}
          <canvas ref={trailRef} style={{
            position: 'absolute', inset: 0, zIndex: 3,
            width: '100%', height: '100%',
            pointerEvents: 'none', mixBlendMode: 'screen',
            display: activated ? 'block' : 'none',
          }} />

          {/*
            Zone labels — z:4, ABOVE the canvas, mixBlendMode: overlay.
            overlay blend formula: dark backdrop → text almost invisible;
            bright/gold backdrop (from halos) → text pops to full contrast.
            This makes labels readable only where the star illuminates them.
          */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 4,
            pointerEvents: 'none', mixBlendMode: 'overlay',
          }}>
            {ZONES.map(z => (
              <div key={z.id} style={{
                position: 'absolute', top: z.top, left: z.left ?? '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center', width: '90%',
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 600,
                  letterSpacing: 4, textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.95)', marginBottom: 10,
                }}>
                  <StarSpark size={7} color="rgba(255,255,255,0.95)" />{z.sub}
                </div>
                <div style={{
                  fontFamily: "'Prata', serif",
                  fontSize: 'clamp(40px,5.5vw,72px)',
                  lineHeight: 0.92, letterSpacing: '0.04em',
                  color: 'white',   // overlay blend handles the gold toning from halos
                  marginBottom: 12,
                }}>{z.name}</div>
                <p style={{
                  fontFamily: "'Lora', serif", fontStyle: 'italic',
                  fontSize: 'clamp(12px,1.3vw,15px)', lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.90)', margin: '0 auto', maxWidth: '26ch',
                }}>{z.desc}</p>
              </div>
            ))}
          </div>

          {/* Click prompt — z:5, no blend mode */}
          {!activated && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 5,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 20, pointerEvents: 'none',
            }}>
              <svg width="22" height="22" viewBox="-11 -11 22 22"
                style={{ filter: 'drop-shadow(0 0 8px rgba(194,154,72,0.75))', animation: 'starPulse 2.4s ease-in-out infinite', transformOrigin: 'center' }}>
                <path d="M0,-10 C1.5,-3 3,-1.5 10,0 C3,1.5 1.5,3 0,10 C-1.5,3 -3,1.5 -10,0 C-3,-1.5 -1.5,-3 0,-10 Z" fill="#D9B45A" />
              </svg>
              <span style={{
                fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 500,
                letterSpacing: 3.5, textTransform: 'uppercase', color: C.kostMuted,
              }}>Нажми — проведи звездой</span>
            </div>
          )}

          <div style={{
            position: 'absolute', inset: 0, zIndex: 6,
            border: '1px solid rgba(194,154,72,0.16)', pointerEvents: 'none'
          }} />
        </div>

        <VerticalRule flip />
      </div>
    </>
  )
}

export default function KartaSection() {
  return (
    <section id="karta" style={{
      background: C.bezdna, position: 'relative', overflow: 'hidden',
      padding: 'clamp(98px,12vw,172px) 0 clamp(90px,11vw,150px)',
      borderTop: '1px solid rgba(194,154,72,0.08)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(22px,6vw,80px)', marginBottom: 'clamp(48px,6vw,72px)' }}>
        <FadeSection>
          <SecLabel num="03" text="Карта миров" />
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(28px,3.6vw,46px)', lineHeight: 1.16,
            color: C.kostYar, maxWidth: '15ch', marginBottom: 20,
          }}>Три мира по вертикали.</h2>
          <p style={{
            fontFamily: "'Lora', serif", fontSize: 17.5, lineHeight: 1.78,
            color: C.kostDim, maxWidth: '52ch',
          }}>
            Карта собирает твоё внимание, чтобы ты дошёл. Путь идёт по оси: вниз — за самой
            большой силой, в точку баланса, и оттуда — наверх, в проявленность.
          </p>
        </FadeSection>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 clamp(16px,3vw,40px)' }}>
        <FadeSection delay={80} y={20}><MapReveal /></FadeSection>
      </div>

      <FadeSection delay={100}>
        <div style={{ maxWidth: 640, margin: 'clamp(56px,7vw,88px) auto 0', padding: '0 clamp(22px,6vw,80px)', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic',
            fontSize: 'clamp(15px,1.8vw,19px)', lineHeight: 1.75,
            color: C.kostDim,
          }}>
            Три мира. Один путь. Вниз — за самой большой силой.
            В точке баланса — аргонавт держит Ядро.
            Наверх — в проявленность, в Дело.
          </p>
        </div>
      </FadeSection>
    </section>
  )
}
