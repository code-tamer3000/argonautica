import { useEffect, useRef } from 'react'
import { C, FadeSection, SecLabel } from './Shared'

// ─── Brand star-spark shape (canvas) ─────────────────────────────────────────
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

// ─── Четыре концентрических золотых ореола (внешний→внутренний) ───────────────
// Бронза (внешний) → белое золото (ядро). Каждый: радиус, пик прозрачности,
// цвет, амплитуда пульсации, частота пульсации.
const BALANCE_HALOS = [
  { r: 196, a: 0.07, rgb: [140, 96, 22], pAmp: 0.42, pFreq: 0.00088 }, // латунь-бронза
  { r: 102, a: 0.20, rgb: [175, 132, 40], pAmp: 0.33, pFreq: 0.00145 }, // тёмное золото
  { r: 50, a: 0.46, rgb: [214, 172, 64], pAmp: 0.24, pFreq: 0.00230 }, // золото
  { r: 20, a: 0.88, rgb: [252, 238, 155], pAmp: 0.15, pFreq: 0.00380 }, // белое золото, ядро
]

// ─── Точка баланса: звезда + 4 ореола, стоит на месте и пульсирует ────────────
const BalanceHalos = () => {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const el = containerRef.current
    if (!canvas || !el) return
    const ctx = canvas.getContext('2d')
    let W = 0, H = 0

    const resize = () => {
      W = el.offsetWidth; H = el.offsetHeight
      if (!W || !H) return
      canvas.width = W; canvas.height = H
      ctx.clearRect(0, 0, W, H)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let isVisible = true
    const visObs = new IntersectionObserver(
      entries => { isVisible = entries[0].isIntersecting },
      { threshold: 0 }
    )
    visObs.observe(el)

    let raf

    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (!isVisible || !W || !H) return

      // Звезда стоит в центре и пульсирует — никакого дрейфа
      ctx.clearRect(0, 0, W, H)
      const px = W / 2, py = H / 2
      const now = Date.now()

      // Внешний → внутренний, чтобы ядро рисовалось поверх
      for (let i = 0; i < BALANCE_HALOS.length; i++) {
        const h = BALANCE_HALOS[i]
        const pulse = 1 + Math.sin(now * h.pFreq + i * 1.45) * h.pAmp
        const r = h.r * pulse
        const [cr, cg, cb] = h.rgb

        const grd = ctx.createRadialGradient(px, py, 0, px, py, r)
        grd.addColorStop(0, `rgba(${cr},${cg},${cb},${+(h.a * pulse).toFixed(3)})`)
        grd.addColorStop(0.42, `rgba(${cr},${cg},${cb},${+(h.a * pulse * 0.25).toFixed(3)})`)
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)

        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Звезда-искра поверх — мягко дышит вместе с ядром
      const starPulse = 1 + Math.sin(now * 0.0026) * 0.16
      drawStarShape(ctx, px, py, 7 * starPulse, 'rgba(245,215,105,0.93)')
      drawStarShape(ctx, px, py, 2.8 * starPulse, 'rgba(255,252,228,0.82)')
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      visObs.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="balance-anim" style={{
      position: 'relative', width: '100%', aspectRatio: '4 / 5',
    }}>
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', mixBlendMode: 'screen',
      }} />
    </div>
  )
}

const emph = { color: C.kostYar, fontWeight: 600 }

export default function BalanceSection() {
  return (
    <section id="balance" style={{
      background: C.bezdna, position: 'relative',
      padding: 'clamp(98px,12vw,172px) clamp(22px,7vw,96px)',
      borderTop: '1px solid rgba(194,154,72,0.08)',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <FadeSection><SecLabel num="02" text="Точка баланса" /></FadeSection>

        {/* Десктоп: текст слева, анимация справа. Мобила: анимация между заголовком и текстом */}
        <div className="balance-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr clamp(240px,34vw,420px)',
          gridTemplateAreas: '"head anim" "body anim"',
          columnGap: 'clamp(32px,5vw,64px)', rowGap: 'clamp(18px,2.4vw,26px)',
          alignItems: 'center',
        }}>
          <FadeSection delay={80} style={{ gridArea: 'head' }}>
            <h2 style={{
              fontFamily: "'Prata', serif", fontWeight: 400,
              fontSize: 'clamp(26px,3.4vw,42px)', lineHeight: 1.16, color: C.kostYar,
              letterSpacing: '-0.01em', maxWidth: '16ch',
            }}>
              Исходное явление Аргонавтики — <span style={{ color: C.zolotoYar }}>Точка Баланса</span>.
            </h2>
          </FadeSection>

          <FadeSection delay={140} y={20} style={{ gridArea: 'anim' }}>
            <BalanceHalos />
          </FadeSection>

          <FadeSection delay={180} style={{ gridArea: 'body' }}>
            <p style={{
              fontFamily: "'Lora', serif", fontSize: 18, lineHeight: 1.78, color: C.kostDim,
              maxWidth: '52ch',
            }}>
              Точка Баланса — это Хер (буквица, обозначающая мировое равновесие
              и&nbsp;космический порядок). <strong style={emph}>Послать на&nbsp;Хер</strong> —
              значит направить силы Баланса на&nbsp;корректировку посылаемой сущности.
              <br /><br />
              Аргонавт — носитель Баланса, самой большой силы в&nbsp;мире. Сейчас ситуация
              такова, что в&nbsp;результате выливания в&nbsp;мир множества знаний появилось большое
              количество «пробуждённых» и&nbsp;«просветлённых», не&nbsp;заземливших понимание
              в&nbsp;теле. Это душнота, мающаяся в&nbsp;концепциях и&nbsp;не&nbsp;переходящая
              к&nbsp;делу. <strong style={emph}>Фитобоярство</strong>. Аргонавт не&nbsp;ведётся
              на&nbsp;лень и&nbsp;малодушие внутреннего фитобоярина, когда тот начинает петь свою
              однообразную песню&nbsp;— поэтому обретает свободу от&nbsp;внешней душноты, оживляя
              пространство, в&nbsp;котором находится.
            </p>
          </FadeSection>
        </div>
      </div>
    </section>
  )
}
