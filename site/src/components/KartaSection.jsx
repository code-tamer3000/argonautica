import { useEffect, useRef } from 'react'
import { C, FadeSection, SecLabel } from './Shared'

// ─── ЛЕГЕНДА — позиция в % от контейнера карты ───────────────────────────────
const LEGEND = {
  left: '0%',   // отступ от левого края
  top: '0%',   // отступ от верхнего края
  width: '100%',  // ширина SVG (высота пропорциональна: ~2272×5492)
}

// ─── ТУМАН — настройки эффекта ───────────────────────────────────────────────
const FOG = {
  color: '5, 7, 6',  // RGB цвета тумана
  healRate: 0.06,        // скорость восстановления (0.02 медленно → 0.15 быстро)
  revealR: 50,         // радиус рассеивания курсором (px)
}

// ─── Золотые ореолы ──────────────────────────────────────────────────────────
const HALOS = [
  { r: 10, a: 0.07, rgb: [140, 96, 22], pAmp: 0.42, pFreq: 0.00088 },
  { r: 60, a: 0.20, rgb: [175, 132, 40], pAmp: 0.33, pFreq: 0.00145 },
  { r: 80, a: 0.46, rgb: [214, 172, 64], pAmp: 0.24, pFreq: 0.00230 },
  { r: 120, a: 0.88, rgb: [252, 238, 155], pAmp: 0.15, pFreq: 0.00380 },
]

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

// ─── ПЯТНА СВЕТА — параметры эффекта скролла ────────────────────────────────
const BEAMS = {
  maxCount: 50,    // максимум пятен одновременно
  lifetime: 3500,  // мс жизни пятна
  scrollPx: 1,     // пикселей скролла на один спавн (мобайл)
  cursorStep: 0.1,
  jitter: 1.6,
  clusterSize: 1,  // блобов за один спавн
  sizeMin: 5,
  sizeMax: 22,
  stretchMin: 1.1,
  stretchMax: 2.4,
  petalMin: 3,
  petalMax: 6,
  waveMag: 0.30,
  // десктоп: реже и мельче
  scrollPxDesktop: 3,
  sizeMinDesktop: 2,
  sizeMaxDesktop: 22,
}

// ─── КОНТУР КАРТЫ — точки для спауна пятен (из SVG legend_fin.svg, viewBox 0 0 2272 5492) ──
// prettier-ignore
const CONTOUR_PTS = [{ x: 55.48, y: 0.41 }, { x: 59.02, y: 1.62 }, { x: 61.48, y: 2.83 }, { x: 64.61, y: 4.04 }, { x: 68.59, y: 6.1 }, { x: 72.93, y: 8.2 }, { x: 75.72, y: 10.19 }, { x: 77.16, y: 12.5 }, { x: 77.28, y: 15.09 }, { x: 75.7, y: 17.67 }, { x: 72.75, y: 19.63 }, { x: 67.13, y: 20.34 }, { x: 61.34, y: 20.37 }, { x: 54.77, y: 20.26 }, { x: 49.83, y: 19.55 }, { x: 47.75, y: 18.87 }, { x: 42.21, y: 16.66 }, { x: 37.94, y: 15.08 }, { x: 34.26, y: 13.74 }, { x: 30.06, y: 12.59 }, { x: 24.64, y: 11.25 }, { x: 20.03, y: 10.81 }, { x: 14.81, y: 11.33 }, { x: 10.93, y: 12.58 }, { x: 7.66, y: 14.23 }, { x: 6.23, y: 15.92 }, { x: 5.96, y: 18.15 }, { x: 5.96, y: 20.06 }, { x: 5.96, y: 21.63 }, { x: 7.11, y: 23.04 }, { x: 9.95, y: 24.89 }, { x: 13.22, y: 26.47 }, { x: 16.51, y: 27.88 }, { x: 19.7, y: 29.06 }, { x: 24.72, y: 30.16 }, { x: 29.46, y: 30.92 }, { x: 33.89, y: 31.64 }, { x: 37.6, y: 32.16 }, { x: 41.64, y: 32.77 }, { x: 48.25, y: 33.76 }, { x: 56.33, y: 35.04 }, { x: 61.41, y: 35.99 }, { x: 64.72, y: 36.9 }, { x: 68.45, y: 38.22 }, { x: 71.81, y: 39.57 }, { x: 74.49, y: 40.71 }, { x: 76.03, y: 41.96 }, { x: 77.35, y: 43.22 }, { x: 78.38, y: 45.24 }, { x: 78.52, y: 47.05 }, { x: 78.52, y: 49.28 }, { x: 78.44, y: 51.53 }, { x: 76.43, y: 53.17 }, { x: 72.43, y: 54.03 }, { x: 67.18, y: 54.25 }, { x: 61.03, y: 54.26 }, { x: 55.68, y: 53.95 }, { x: 51.81, y: 52.95 }, { x: 48.56, y: 51.22 }, { x: 44.78, y: 48.89 }, { x: 41.64, y: 46.24 }, { x: 39.3, y: 43.56 }, { x: 37.43, y: 40.91 }, { x: 35.42, y: 39.33 }, { x: 31.7, y: 37.49 }, { x: 27.12, y: 35.42 }, { x: 21.14, y: 33.98 }, { x: 16.54, y: 33.91 }, { x: 13.0, y: 35.21 }, { x: 10.23, y: 36.96 }, { x: 8.7, y: 38.67 }, { x: 8.31, y: 40.75 }, { x: 6.9, y: 43.03 }, { x: 6.58, y: 44.97 }, { x: 6.96, y: 46.79 }, { x: 8.62, y: 48.96 }, { x: 11.22, y: 51.16 }, { x: 16.01, y: 53.47 }, { x: 21.23, y: 55.27 }, { x: 25.3, y: 56.67 }, { x: 29.61, y: 57.87 }, { x: 35.16, y: 59.35 }, { x: 39.8, y: 60.32 }, { x: 44.33, y: 61.14 }, { x: 47.45, y: 61.87 }, { x: 50.61, y: 62.84 }, { x: 53.67, y: 63.94 }, { x: 56.9, y: 65.17 }, { x: 61.52, y: 66.47 }, { x: 64.66, y: 67.57 }, { x: 68.42, y: 68.91 }, { x: 72.34, y: 70.2 }, { x: 74.82, y: 71.51 }, { x: 76.3, y: 73.24 }, { x: 75.37, y: 74.53 }, { x: 72.12, y: 75.48 }, { x: 67.26, y: 75.73 }, { x: 61.44, y: 75.32 }, { x: 57.37, y: 74.47 }, { x: 53.04, y: 73.29 }, { x: 48.19, y: 71.87 }, { x: 43.74, y: 70.3 }, { x: 39.97, y: 68.13 }, { x: 36.97, y: 66.42 }, { x: 32.64, y: 64.38 }, { x: 26.46, y: 61.93 }, { x: 19.88, y: 60.75 }, { x: 14.7, y: 61.13 }, { x: 10.8, y: 62.52 }, { x: 8.7, y: 64.05 }, { x: 8.44, y: 66.19 }, { x: 8.46, y: 68.76 }, { x: 8.46, y: 70.69 }, { x: 9.02, y: 72.64 }, { x: 10.86, y: 74.42 }, { x: 14.38, y: 76.5 }, { x: 19.16, y: 78.52 }, { x: 22.24, y: 79.61 }, { x: 25.73, y: 80.7 }, { x: 30.79, y: 81.21 }, { x: 35.51, y: 81.54 }, { x: 40.83, y: 81.8 }, { x: 47.59, y: 81.84 }, { x: 53.64, y: 81.84 }, { x: 59.35, y: 81.81 }, { x: 65.74, y: 81.45 }, { x: 70.56, y: 81.11 }, { x: 75.91, y: 81.12 }, { x: 78.89, y: 81.59 }, { x: 79.39, y: 81.8 }, { x: 81.35, y: 83.32 }, { x: 82.38, y: 85.34 }, { x: 82.86, y: 87.78 }, { x: 80.86, y: 93.1 }, { x: 39.94, y: 97.6 }, { x: 38.51, y: 95.85 }, { x: 36.83, y: 94.29 }, { x: 33.94, y: 92.61 }, { x: 30.09, y: 91.02 }, { x: 25.47, y: 90.03 }, { x: 20.36, y: 90.1 }, { x: 16.93, y: 91.04 }, { x: 15.44, y: 92.98 }, { x: 16.02, y: 93.1 }, { x: 17.16, y: 91.34 }, { x: 20.5, y: 90.31 }, { x: 25.48, y: 90.17 }, { x: 29.18, y: 90.8 }, { x: 32.94, y: 92.35 }, { x: 35.98, y: 94.0 }, { x: 37.82, y: 95.57 }, { x: 39.27, y: 97.3 }, { x: 40.9, y: 99.89 }, { x: 80.99, y: 94.04 }, { x: 83.34, y: 88.44 }, { x: 83.04, y: 85.7 }, { x: 82.11, y: 83.63 }, { x: 80.28, y: 82.03 }, { x: 75.89, y: 81.02 }, { x: 70.56, y: 80.94 }, { x: 65.68, y: 81.25 }, { x: 59.47, y: 81.63 }, { x: 53.68, y: 81.68 }, { x: 47.67, y: 81.68 }, { x: 40.98, y: 81.65 }, { x: 35.52, y: 81.41 }, { x: 30.74, y: 81.09 }, { x: 25.71, y: 80.6 }, { x: 23.04, y: 79.78 }, { x: 20.04, y: 78.75 }, { x: 15.43, y: 76.81 }, { x: 11.69, y: 74.77 }, { x: 9.79, y: 72.94 }, { x: 9.03, y: 71.01 }, { x: 9.04, y: 69.08 }, { x: 9.02, y: 66.57 }, { x: 9.19, y: 64.39 }, { x: 11.06, y: 62.79 }, { x: 14.81, y: 61.39 }, { x: 19.86, y: 60.89 }, { x: 25.38, y: 61.68 }, { x: 31.45, y: 64.02 }, { x: 35.95, y: 66.1 }, { x: 39.12, y: 67.84 }, { x: 42.71, y: 70.0 }, { x: 47.09, y: 71.63 }, { x: 51.96, y: 73.04 }, { x: 56.34, y: 74.24 }, { x: 61.4, y: 75.4 }, { x: 67.19, y: 75.89 }, { x: 72.19, y: 75.68 }, { x: 75.67, y: 74.8 }, { x: 76.91, y: 73.51 }, { x: 75.64, y: 71.78 }, { x: 73.29, y: 70.4 }, { x: 69.42, y: 69.14 }, { x: 65.66, y: 67.79 }, { x: 62.45, y: 66.67 }, { x: 57.95, y: 65.41 }, { x: 54.57, y: 64.18 }, { x: 51.51, y: 63.06 }, { x: 48.4, y: 62.06 }, { x: 44.27, y: 61.05 }, { x: 39.75, y: 60.22 }, { x: 35.11, y: 59.28 }, { x: 30.66, y: 58.09 }, { x: 26.35, y: 56.89 }, { x: 22.22, y: 55.52 }, { x: 17.15, y: 53.74 }, { x: 12.19, y: 51.54 }, { x: 9.47, y: 49.29 }, { x: 7.69, y: 47.12 }, { x: 7.14, y: 45.28 }, { x: 7.41, y: 43.35 }, { x: 8.74, y: 41.1 }, { x: 9.2, y: 39.0 }, { x: 10.59, y: 37.26 }, { x: 13.26, y: 35.51 }, { x: 16.66, y: 34.15 }, { x: 21.2, y: 34.1 }, { x: 26.08, y: 35.14 }, { x: 30.69, y: 37.16 }, { x: 34.48, y: 39.03 }, { x: 36.67, y: 40.63 }, { x: 38.52, y: 43.18 }, { x: 40.76, y: 45.86 }, { x: 43.84, y: 48.53 }, { x: 47.56, y: 50.89 }, { x: 50.84, y: 52.7 }, { x: 55.66, y: 54.01 }, { x: 61.0, y: 54.43 }, { x: 67.09, y: 54.41 }, { x: 72.46, y: 54.24 }, { x: 76.63, y: 53.42 }, { x: 78.95, y: 51.85 }, { x: 79.09, y: 49.63 }, { x: 79.1, y: 47.4 }, { x: 79.0, y: 45.54 }, { x: 78.12, y: 43.53 }, { x: 76.74, y: 42.2 }, { x: 75.24, y: 40.95 }, { x: 72.65, y: 39.8 }, { x: 69.4, y: 38.46 }, { x: 65.73, y: 37.12 }, { x: 61.38, y: 35.91 }, { x: 56.33, y: 34.96 }, { x: 48.55, y: 33.71 }, { x: 41.78, y: 32.71 }, { x: 37.49, y: 32.06 }, { x: 33.74, y: 31.53 }, { x: 29.38, y: 30.84 }, { x: 24.66, y: 30.08 }, { x: 20.69, y: 29.26 }, { x: 17.39, y: 28.12 }, { x: 14.13, y: 26.73 }, { x: 10.82, y: 25.17 }, { x: 7.98, y: 23.34 }, { x: 6.58, y: 21.91 }, { x: 6.54, y: 20.34 }, { x: 6.54, y: 18.46 }, { x: 6.74, y: 16.27 }, { x: 8.04, y: 14.53 }, { x: 11.11, y: 12.87 }, { x: 14.94, y: 11.59 }, { x: 20.01, y: 10.97 }, { x: 24.71, y: 11.33 }, { x: 29.06, y: 12.35 }, { x: 33.24, y: 13.52 }, { x: 36.96, y: 14.85 }, { x: 41.21, y: 16.39 }, { x: 46.54, y: 18.58 }, { x: 54.34, y: 20.33 }, { x: 61.21, y: 20.53 }, { x: 67.08, y: 20.51 }, { x: 72.82, y: 19.93 }, { x: 76.07, y: 18.02 }, { x: 77.86, y: 15.48 }, { x: 77.77, y: 12.88 }, { x: 76.58, y: 10.51 }, { x: 73.92, y: 8.47 }, { x: 69.64, y: 6.41 }, { x: 65.64, y: 4.34 }, { x: 62.4, y: 3.05 }, { x: 59.87, y: 1.84 }, { x: 56.46, y: 0.62 }]

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

// ─── Карта с туманом (лучи света при скролле) ────────────────────────────────
const MapReveal = () => {
  const containerRef = useRef(null)
  const fogRef = useRef(null)
  const glowRef = useRef(null)
  const legendRef = useRef(null)
  const beamsRef = useRef([])
  const contourIdxRef = useRef(0)
  const scrollAccRef = useRef(0)
  const lastScrollRef = useRef(0)

  useEffect(() => {
    const fog = fogRef.current
    const glow = glowRef.current
    const el = containerRef.current
    if (!fog || !glow || !el) return
    const isDesk = window.matchMedia('(min-width: 768px) and (hover: hover)').matches

    const fillFog = () => {
      const ctx = fog.getContext('2d')
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(${FOG.color},1)`
      ctx.fillRect(0, 0, fog.width, fog.height)
    }

    const resize = () => {
      const W = el.offsetWidth, H = el.offsetHeight
      if (!W || !H) return
      fog.width = W; fog.height = H
      glow.width = W; glow.height = H
      fillFog()
    }

    const bgImg = el.querySelector('img')
    if (bgImg && bgImg.complete) resize()
    else if (bgImg) bgImg.addEventListener('load', resize, { once: true })
    else resize()

    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // Спавн кластера блобов — курсор сам двигается по контуру
    const spawnBeam = () => {
      const W = fog.width, H = fog.height
      if (!W || !H) return

      const n = CONTOUR_PTS.length
      contourIdxRef.current = (contourIdxRef.current + BEAMS.cursorStep) % n
      const i = Math.floor(contourIdxRef.current)
      const pt = CONTOUR_PTS[i]
      const prev = CONTOUR_PTS[(i - 1 + n) % n]
      const next = CONTOUR_PTS[(i + 1) % n]

      // Касательная к контуру — ориентируем блоб вдоль пути
      const tx = (next.x - prev.x) / 100 * W
      const ty = (next.y - prev.y) / 100 * H
      const tangentAngle = Math.atan2(ty, tx)

      const now = Date.now()
      beamsRef.current = beamsRef.current.filter(b => now - b.born < b.lifetime)

      for (let k = 0; k < BEAMS.clusterSize; k++) {
        if (beamsRef.current.length >= BEAMS.maxCount) beamsRef.current.shift()
        const jW = BEAMS.jitter / 100 * W
        const along = (Math.random() - 0.5) * jW * 2
        const across = (Math.random() - 0.5) * jW
        const ox = pt.x / 100 * W + Math.cos(tangentAngle) * along - Math.sin(tangentAngle) * across
        const oy = pt.y / 100 * H + Math.sin(tangentAngle) * along + Math.cos(tangentAngle) * across
        beamsRef.current.push({
          ox, oy,
          angle: tangentAngle + (Math.random() - 0.5) * 0.9,
          maxR: ((isDesk ? BEAMS.sizeMinDesktop : BEAMS.sizeMin) + Math.random() * ((isDesk ? BEAMS.sizeMaxDesktop : BEAMS.sizeMax) - (isDesk ? BEAMS.sizeMinDesktop : BEAMS.sizeMin))) / 100 * W,
          stretch: BEAMS.stretchMin + Math.random() * (BEAMS.stretchMax - BEAMS.stretchMin),
          petals: BEAMS.petalMin + Math.floor(Math.random() * (BEAMS.petalMax - BEAMS.petalMin + 1)),
          phase: Math.random() * Math.PI * 2,
          born: now + k * 70,
          lifetime: BEAMS.lifetime * (0.6 + Math.random() * 0.8),
        })
      }
    }


    const scrollPx = isDesk ? BEAMS.scrollPxDesktop : BEAMS.scrollPx
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return
      const dy = Math.abs(window.scrollY - lastScrollRef.current)
      lastScrollRef.current = window.scrollY
      scrollAccRef.current += dy
      while (scrollAccRef.current >= scrollPx) {
        scrollAccRef.current -= scrollPx
        spawnBeam()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        contourIdxRef.current = 0; scrollAccRef.current = 0
        lastScrollRef.current = window.scrollY
        spawnBeam(); spawnBeam()
      }
    }, { threshold: 0.05 })
    io.observe(el)

    const fCtx = fog.getContext('2d')
    const gCtx = glow.getContext('2d')

    let drawRaf, t = 0, frameN = 0
    let isVisible = false
    const visObs = new IntersectionObserver(
      entries => { isVisible = entries[0].isIntersecting },
      { threshold: 0 }
    )
    visObs.observe(el)

    const draw = () => {
      drawRaf = requestAnimationFrame(draw)
      if (!isVisible) return
      t += 0.016
      frameN++
      const W = fog.width, H = fog.height
      if (!W || !H) return

      fCtx.globalCompositeOperation = 'source-over'
      fCtx.fillStyle = `rgba(${FOG.color},${FOG.healRate})`
      fCtx.fillRect(0, 0, W, H)

      // Glow canvas — throttled to ~30fps
      if (frameN % 2 === 0) {
        gCtx.clearRect(0, 0, W, H)
        drawSun(gCtx, W, H, t)
        drawPillar(gCtx, W, H, t)
        drawPortal(gCtx, W, H, t)
      }

      // — Органические blob-формы идут последовательно по контуру карты ───────
      const now = Date.now()
      beamsRef.current = beamsRef.current.filter(b => now - b.born < b.lifetime)

      for (const beam of beamsRef.current) {
        const age = (now - beam.born) / beam.lifetime
        if (age < 0 || age >= 1) continue

        const grow = Math.min(age / 0.42, 1.0)
        const r = beam.maxR * (1 - Math.pow(1 - grow, 2.8))
        const alpha = age < 0.10
          ? age / 0.10
          : age > 0.58
            ? 1 - Math.pow((age - 0.58) / 0.42, 0.55)
            : 1.0

        if (r < 1 || alpha < 0.005) continue

        fCtx.save()
        fCtx.globalCompositeOperation = 'destination-out'
        fCtx.translate(beam.ox, beam.oy)
        fCtx.rotate(beam.angle)
        fCtx.scale(beam.stretch, 1 / Math.sqrt(beam.stretch))

        // shadowBlur создаёт мягкий Гауссов ореол вокруг органической формы
        fCtx.shadowBlur = r * 0.45
        fCtx.shadowColor = `rgba(0,0,0,${(alpha * 0.60).toFixed(3)})`
        fCtx.fillStyle = `rgba(0,0,0,${(alpha * 0.88).toFixed(3)})`

        // Волновая деформация: две гармоники дают асимметричный «амёбный» блоб
        const coreR = r * 0.52
        fCtx.beginPath()
        const steps = 52
        for (let j = 0; j <= steps; j++) {
          const a = (j / steps) * Math.PI * 2
          const w = 1
            + BEAMS.waveMag * Math.sin(beam.petals * a + beam.phase)
            + BEAMS.waveMag * 0.45 * Math.sin((beam.petals + 2) * a + beam.phase * 1.6)
          const rr = coreR * w
          if (j === 0) fCtx.moveTo(rr, 0)
          else fCtx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
        }
        fCtx.closePath()
        fCtx.fill()
        fCtx.restore()
      }
    }
    draw()

    return () => {
      cancelAnimationFrame(drawRaf)
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      ro.disconnect()
      visObs.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* z:0 — Фон */}
      <img src="./media/background.jpg" alt="Карта миров" draggable={false}
        onLoad={() => document.dispatchEvent(new CustomEvent('mapReady'))}
        style={{ width: '100%', height: 'auto', display: 'block' }} />

      {/* z:1 — Легенда под туманом: видна только где туман рассеян */}
      <img ref={legendRef} src="./media/legend_fin.svg" alt="" draggable={false}
        style={{
          position: 'absolute', left: LEGEND.left, top: LEGEND.top,
          width: LEGEND.width, height: 'auto',
          zIndex: 1, pointerEvents: 'none', userSelect: 'none',
        }} />

      {/* z:2 — Туман */}
      <canvas ref={fogRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* z:3 — Эффекты (screen blend) */}
      <canvas ref={glowRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        zIndex: 3, pointerEvents: 'none', mixBlendMode: 'screen',
      }} />

      {/* Подсказка скролла — появляется один раз и исчезает */}
      <div style={{
        position: 'absolute', bottom: 'clamp(16px,3vw,32px)', left: 0, right: 0,
        zIndex: 10, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        fontFamily: "'Onest', sans-serif", fontSize: 11, letterSpacing: 3,
        textTransform: 'uppercase', color: 'rgba(233,226,212,0.45)',
        opacity: 0, animation: 'scrollHint 5s 0.8s ease forwards',
      }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>↕</span>
        <span>скролл — исследуй карту миров</span>
      </div>
    </div>
  )
}


export default function KartaSection() {

  return (
    <section id="karta" style={{
      background: C.bezdna, position: 'relative',
      padding: 'clamp(98px,12vw,172px) 0 clamp(90px,11vw,150px)',
      borderTop: '1px solid rgba(194,154,72,0.08)',
    }}>
      {/* Заголовок */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(22px,6vw,80px)', marginBottom: 'clamp(48px,6vw,72px)' }}>
        <FadeSection>
          <SecLabel num="02" text="Карта миров" />
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

      <FadeSection delay={80} y={20}><MapReveal /></FadeSection>

      {/* Подпись */}
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
