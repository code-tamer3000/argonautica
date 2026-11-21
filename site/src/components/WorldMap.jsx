import { useEffect, useRef, useState } from 'react'
import SplashCursor from './SplashCursor'
import './WorldMap.css'

export const MAP_FOG_DEFAULTS = {
  colors: ['#ff943a', '#ffc25c', '#ffdc82'],
  colorSpeed: 0.25,
  intensity: 1.6,
  size: 0.5,
  force: 0.25,
  swirl: 4,
  trail: 4,
  momentum: 1.35,
  halo: 0.44,
  clickSplash: true,
}

export function MapHint() {
  return (
    <p className="world-map-hint">
      <span className="world-map-hint__mouse">Наведи курсор, чтобы увидеть карту.</span>
      <span className="world-map-hint__touch">Проведи пальцем, чтобы увидеть карту.</span>
    </p>
  )
}

// ─── ЛЕГЕНДА — позиция в % от контейнера карты ───────────────────────────────
const LEGEND = {
  left: '0%',   // отступ от левого края
  top: '0%',   // отступ от верхнего края
  width: '100%',  // ширина SVG (высота пропорциональна: ~2272×5492)
}

// ─── ЭФФЕКТЫ — настройки (позиции в % от контейнера карты) ──────────────────
const EFFECTS = {
  portal: {
    on: true,
    cx: 67,          // % от ширины — центр по X
    cy: 67,          // % от высоты — центр по Y
    r: 4.9,           // % от ширины — радиус кольца
    stretch: 1.0,        // вытянутость арки: 1 = круглая, 1.5 = широкая, 0.6 = узкая
    legH: 3.3,           // длина прямоугольных стоек (множитель от r): 0 = только арка, 3 = длинные
    frame: false,         // рамка арки: true = видна, false = скрыта
    opacity: 0.62,        // общая яркость
    speed: 0.15,        // угловая скорость вращения
    rgb: [80, 45, 210],  // цвет (фиолетово-синий)
  },
  pillar: {
    on: true,
    cx: 67,          // % от ширины — позиция столба
    top: 0,           // % от высоты — верхний край
    bottom: 41,          // % от высоты — нижний край
    width: 1.8,         // % от ширины — полуширина
    opacity: 0.52,        // яркость
    speed: 0.85,        // скорость переливания
    rgb: [194, 154, 72],  // золото
  },
  sun: {
    on: true,
    cx: 67,          // % от ширины
    cy: 48,          // % от высоты
    r: 17,         // % от ширины — радиус ядра
    rays: 30,          // количество лучей
    rayLen: 18,          // % от ширины — длина луча
    opacity: 0.16,        // яркость
    speed: 0.04,        // скорость вращения лучей
    rgb: [255, 232, 130],  // тёплый солнечный
  },
}

// ─── Портал: арка с частицами, затягивающимися внутрь ───────────────────────
const drawPortal = (ctx, W, H, t) => {
  if (!EFFECTS.portal.on) return
  const cx = EFFECTS.portal.cx / 100 * W
  const cy = EFFECTS.portal.cy / 100 * H
  const r = EFFECTS.portal.r / 100 * W
  const [cr, cg, cb] = EFFECTS.portal.rgb
  const op = EFFECTS.portal.opacity
  const sp = EFFECTS.portal.speed
  const pulse = 1 + Math.sin(t * 1.9) * 0.05

  // Геометрия: дуга centered at (cx,cy), стойки уходят вниз
  const hw = r * EFFECTS.portal.stretch
  const lh = r * EFFECTS.portal.legH
  const ymid = cy + lh * 0.5  // точка притяжения

  const arch = () => {
    ctx.beginPath()
    ctx.moveTo(cx - hw, cy + lh)
    ctx.lineTo(cx - hw, cy)
    ctx.arc(cx, cy, hw, Math.PI, 0)
    ctx.lineTo(cx + hw, cy + lh)
    ctx.closePath()
  }

  // Внешняя атмосфера
  const atm = ctx.createRadialGradient(cx, ymid, 0, cx, ymid, hw * 4.5)
  atm.addColorStop(0, `rgba(${cr},${cg},${cb},${(op * 0.22).toFixed(3)})`)
  atm.addColorStop(0.45, `rgba(${cr},${cg},${cb},${(op * 0.07).toFixed(3)})`)
  atm.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.beginPath(); ctx.arc(cx, ymid, hw * 4.5, 0, Math.PI * 2)
  ctx.fillStyle = atm; ctx.fill()

  // Внутренний объём + частицы (clip к форме арки)
  ctx.save()
  arch(); ctx.clip()

  const inner = ctx.createRadialGradient(cx, ymid, 0, cx, ymid, hw * 1.8)
  inner.addColorStop(0, `rgba(${cr},${cg},${cb},${(op * 0.30).toFixed(3)})`)
  inner.addColorStop(0.55, `rgba(${cr},${cg},${cb},${(op * 0.08).toFixed(3)})`)
  inner.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = inner
  ctx.fillRect(cx - hw * 1.1, cy - hw, hw * 2.2, hw + lh + 2)

  // Частицы движутся от стенок арки к центру (с ускорением)
  const N = 22
  for (let i = 0; i < N; i++) {
    const frac = i / N
    const phase = ((t * sp * 1.2 + frac) % 1)
    const eased = Math.pow(phase, 1.4)  // easing: ускорение к центру

    let sx, sy
    if (frac < 0.45) {                          // верхняя дуга
      const ang = Math.PI + (frac / 0.45) * Math.PI
      sx = cx + Math.cos(ang) * hw * 0.94
      sy = cy + Math.sin(ang) * hw * 0.94
    } else if (frac < 0.725) {                  // левая стойка
      sx = cx - hw * 0.95
      sy = cy + ((frac - 0.45) / 0.275) * lh * 0.92
    } else {                                     // правая стойка
      sx = cx + hw * 0.95
      sy = cy + ((frac - 0.725) / 0.275) * lh * 0.92
    }

    const px = sx + (cx - sx) * eased
    const py = sy + (ymid - sy) * eased
    const sz = Math.max(hw * 0.06 * (1 - eased * 0.65), 0.5)
    const a = Math.sin(phase * Math.PI) * op * 0.80
    ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${Math.min(cr + 110, 255)},${Math.min(cg + 85, 255)},${Math.min(cb + 30, 255)},${a.toFixed(3)})`
    ctx.fill()
  }
  ctx.restore()

  // Светящаяся рамка арки (frame: true/false в EFFECTS.portal)
  if (EFFECTS.portal.frame) {
    ctx.save()
    ctx.shadowColor = `rgba(${cr},${cg},${cb},${op})`
    ctx.shadowBlur = hw * 1.2
    arch()
    ctx.strokeStyle = `rgba(${Math.min(cr + 120, 255)},${Math.min(cg + 90, 255)},${Math.min(cb + 40, 255)},${(op * 0.88 * pulse).toFixed(3)})`
    ctx.lineWidth = hw * 0.07
    ctx.stroke()
    ctx.restore()
  }
}

// ─── Столб: вертикальный переливающийся луч ──────────────────────────────────
const drawPillar = (ctx, W, H, t) => {
  if (!EFFECTS.pillar.on) return
  const cx = EFFECTS.pillar.cx / 100 * W
  const hw = EFFECTS.pillar.width / 100 * W
  const y1 = EFFECTS.pillar.top / 100 * H
  const y2 = EFFECTS.pillar.bottom / 100 * H
  const [cr, cg, cb] = EFFECTS.pillar.rgb
  const op = EFFECTS.pillar.opacity
  const sp = EFFECTS.pillar.speed

  // Мягкое внешнее свечение
  const outerW = hw * 5
  const outer = ctx.createLinearGradient(cx - outerW, 0, cx + outerW, 0)
  outer.addColorStop(0, 'rgba(0,0,0,0)')
  outer.addColorStop(0.35, `rgba(${cr},${cg},${cb},${(op * 0.10).toFixed(3)})`)
  outer.addColorStop(0.5, `rgba(${cr},${cg},${cb},${(op * 0.20).toFixed(3)})`)
  outer.addColorStop(0.65, `rgba(${cr},${cg},${cb},${(op * 0.10).toFixed(3)})`)
  outer.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = outer; ctx.fillRect(cx - outerW, y1, outerW * 2, y2 - y1)

  // Ядро с переливанием
  const shimBright = 0.55 + Math.sin(t * sp) * 0.28 + Math.sin(t * sp * 1.63 + 1.1) * 0.17
  const core = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0)
  core.addColorStop(0, 'rgba(0,0,0,0)')
  core.addColorStop(0.2, `rgba(${cr},${cg},${cb},${(op * shimBright * 0.55).toFixed(3)})`)
  core.addColorStop(0.5, `rgba(255,248,200,${(op * shimBright).toFixed(3)})`)
  core.addColorStop(0.8, `rgba(${cr},${cg},${cb},${(op * shimBright * 0.55).toFixed(3)})`)
  core.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = core; ctx.fillRect(cx - hw, y1, hw * 2, y2 - y1)

  // Полосы блеска движутся вверх
  for (let b = 0; b < 3; b++) {
    const phase = ((t * sp * 0.38 + b / 3) % 1)
    const by = y2 - phase * (y2 - y1)
    const bh = (y2 - y1) * 0.14
    const ba = Math.sin(phase * Math.PI) * op * 0.45
    const bGrd = ctx.createLinearGradient(0, by - bh, 0, by + bh)
    bGrd.addColorStop(0, 'rgba(255,255,255,0)')
    bGrd.addColorStop(0.5, `rgba(255,248,200,${ba.toFixed(3)})`)
    bGrd.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = bGrd; ctx.fillRect(cx - hw * 0.75, by - bh, hw * 1.5, bh * 2)
  }
}

// ─── Солнечное свечение: ядро + лучи ─────────────────────────────────────────
const drawSun = (ctx, W, H, t) => {
  if (!EFFECTS.sun.on) return
  const cx = EFFECTS.sun.cx / 100 * W
  const cy = EFFECTS.sun.cy / 100 * H
  const r = EFFECTS.sun.r / 100 * W
  const rl = EFFECTS.sun.rayLen / 100 * W
  const [cr, cg, cb] = EFFECTS.sun.rgb
  const op = EFFECTS.sun.opacity
  const pulse = 1 + Math.sin(t * 1.9) * 0.06

  // Корона
  const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 5.5)
  corona.addColorStop(0, `rgba(${cr},${cg},${cb},${(op * 0.95).toFixed(3)})`)
  corona.addColorStop(0.18, `rgba(${cr},${cg},${cb},${(op * 0.60).toFixed(3)})`)
  corona.addColorStop(0.45, `rgba(${cr},${cg},${cb},${(op * 0.18).toFixed(3)})`)
  corona.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.beginPath(); ctx.arc(cx, cy, r * 5.5, 0, Math.PI * 2)
  ctx.fillStyle = corona; ctx.fill()

  // Лучи
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * EFFECTS.sun.speed)
  for (let i = 0; i < EFFECTS.sun.rays; i++) {
    ctx.save(); ctx.rotate((i / EFFECTS.sun.rays) * Math.PI * 2)
    const rp = pulse * (1 + Math.sin(t * 2.4 + i * 0.95) * 0.12)
    const len = rl * rp
    const w0 = r * 0.38
    const w1 = r * 0.04
    const grd = ctx.createLinearGradient(r, 0, r + len, 0)
    grd.addColorStop(0, `rgba(${cr},${cg},${cb},${(op * 0.88).toFixed(3)})`)
    grd.addColorStop(0.38, `rgba(${cr},${cg},${cb},${(op * 0.45).toFixed(3)})`)
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.beginPath()
    ctx.moveTo(r, -w0); ctx.lineTo(r + len, -w1)
    ctx.lineTo(r + len, w1); ctx.lineTo(r, w0); ctx.closePath()
    ctx.fillStyle = grd; ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

export function WorldMap({ fogSettings = MAP_FOG_DEFAULTS }) {
  const containerRef = useRef(null)
  const glowRef = useRef(null)
  const [splashMounted, setSplashMounted] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const glow = glowRef.current
    const ctx = glow.getContext('2d')
    let frame = 0
    let t = 0
    let lastDraw = 0

    const resize = () => {
      glow.width = container.offsetWidth
      glow.height = container.offsetHeight
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const draw = now => {
      frame = requestAnimationFrame(draw)
      if (now - lastDraw < 32 || !glow.width || !glow.height) return
      lastDraw = now
      t += 0.032
      ctx.clearRect(0, 0, glow.width, glow.height)
      drawSun(ctx, glow.width, glow.height, t)
      drawPillar(ctx, glow.width, glow.height, t)
      drawPortal(ctx, glow.width, glow.height, t)
    }

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.boundingClientRect.height > 0) {
        setSplashMounted(true)
        if (ctx && !frame) frame = requestAnimationFrame(draw)
      } else {
        cancelAnimationFrame(frame)
        frame = 0
      }
    })
    visibilityObserver.observe(container)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* z:0 — Фон */}
      <img src="./media/background.jpg" alt="Карта миров" width={2272} height={5492} draggable={false}
        onLoad={() => document.dispatchEvent(new CustomEvent('mapReady'))}
        style={{ width: '100%', height: 'auto', display: 'block' }} />

      {/* z:1 — Легенда карты */}
      <img src="./media/legend_fin.svg" alt="" draggable={false}
        style={{
          position: 'absolute', left: LEGEND.left, top: LEGEND.top,
          width: LEGEND.width, height: 'auto',
          zIndex: 1, pointerEvents: 'none', userSelect: 'none',
        }} />

      {/* z:3 — Эффекты (screen blend) */}
      <canvas ref={glowRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        zIndex: 3, pointerEvents: 'none', mixBlendMode: 'screen',
      }} />

      {splashMounted ? (
        <SplashCursor
          contained
          reveal
          intro={false}
          rainbow={false}
          {...fogSettings}
          shading={0}
          quality="low"
          zIndex={4}
        />
      ) : (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 4, background: '#000', pointerEvents: 'none' }} />
      )}
    </div>
  )
}
