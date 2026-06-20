import { useEffect, useRef } from 'react'
import { C, FadeSection, MEDIA, SecLabel } from './Shared'

// ─── Sword sparks canvas ──────────────────────────────────────────────────────
const SwordSparks = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth || 300
    const H = canvas.offsetHeight || 400
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const sparks = []
    let t = 0, raf

    const newSpark = () => ({
      x: W * 0.50 + (Math.random() - 0.5) * W * 0.24,
      y: H * 0.90 + (Math.random() - 0.5) * H * 0.64,
      vx: (Math.random() - 0.5) * 0.6,      // мягкий горизонтальный разброс
      vy: -(Math.random() * 0.0006 + 0.4),     // плавный старт вверх
      size: Math.random() * 2.2 + 0.5,
      life: 1,
      decay: 0.00005 + Math.random() * 0.01, // долгая жизнь → высокий полёт
    })

    const draw = () => {
      t++
      // Sparse: 1-2 sparks per ~10 frames, occasional burst
      if (t % 50 === 0) {
        sparks.push(newSpark())
        if (Math.random() > 0.55) sparks.push(newSpark())
        if (Math.random() > 0.82) sparks.push(newSpark())
      }

      ctx.clearRect(0, 0, W, H)

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.000001
        s.vx *= 0.988
        s.life -= s.decay
        if (s.life <= 0) { sparks.splice(i, 1); continue }

        const a = s.life
        const size = s.size * (0.3 + s.life * 0.3)
        const col = a > 0.9 ? `rgba(255,240,110,${a})`
          : a > 0.35 ? `rgba(255,160,30,${a})`
            : `rgba(220,70,10,${a})`

        // Glow
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, size * 3.5)
        grd.addColorStop(0, a > 0.5 ? `rgba(255,220,80,${a * 0.42})` : `rgba(255,110,20,${a * 0.28})`)
        grd.addColorStop(1, 'rgba(255,60,0,0)')
        ctx.beginPath()
        ctx.arc(s.x, s.y, size * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      mixBlendMode: 'screen',
    }} />
  )
}

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

// ─── Точка баланса: звезда + 4 ореола, дрейфующая ambient-анимация ────────────
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
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, W, H)
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
    <div ref={containerRef} style={{
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

export default function AboutSection() {
  return (
    <section id="about" style={{
      background: C.bezdna, position: 'relative',
      padding: 'clamp(98px,12vw,172px) clamp(22px,7vw,96px)',
      borderTop: '1px solid rgba(194,154,72,0.08)',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <FadeSection><SecLabel num="01" text="О чём" /></FadeSection>

        {/* Definition + sword */}
        <div className="about-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr clamp(220px,26vw,300px)',
          gap: 'clamp(32px,5vw,64px)', alignItems: 'center',
          marginBottom: 'clamp(56px,8vw,96px)',
        }}>
          <div>
            <FadeSection delay={80}>
              <h2 style={{
                fontFamily: "'Prata', serif", fontWeight: 400,
                fontSize: 'clamp(28px,4vw,50px)', lineHeight: 1.16, color: C.kostYar,
                letterSpacing: '-0.01em', marginBottom: 28, maxWidth: '13em',
              }}>
                Аргонавтика — это искусство{' '}
                <span style={{ color: C.zolotoYar }}>отсечения лишнего</span>.
              </h2>
            </FadeSection>
            <FadeSection delay={180}>
              <p style={{
                fontFamily: "'Lora', serif", fontSize: 18, lineHeight: 1.78, color: C.kostDim,
                maxWidth: '52ch', marginBottom: 18,
              }}>
                Всё лучшее в тебе существует изначально. Убери лишнее и оно расцветет.
                <br /><br />
                Племя тех, кто различает живое от неживого. Для аргонавтов тьма — не враг,
                а строительный материал. Через негатив происходит настоящее проявление,
                а не попытки проявиться.
                <br /><br />
                Аргонавты создают канву Эпохи Перемен. Это проводники и лидеры своих стай.
                <br /><br />
                Каждый аргонавт в душе знает, что пришёл сюда делать своё дело.
                Аргонавтика создана, чтобы отсечь всё наносное и проявить Дело согласно твоему Призванию.
              </p>
            </FadeSection>
          </div>

          <FadeSection delay={260} y={20}>
            <figure style={{
              margin: 0, position: 'relative', borderRadius: 8, overflow: 'hidden',
              border: '1px solid rgba(194,154,72,0.28)',
              boxShadow: 'inset 0 0 60px rgba(194,154,72,0.07)',
            }}>
              <img
                src={MEDIA.sword} alt="Меч — отсечение"
                style={{ width: '100%', display: 'block', aspectRatio: '4/5', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(8,12,10,0.55))' }} />
              <SwordSparks />
            </figure>
          </FadeSection>
        </div>

        {/* Точка баланса — текст + ambient-анимация (звезда + 4 ореола) */}
        <div className="balance-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr clamp(240px,34vw,420px)',
          gap: 'clamp(32px,5vw,64px)', alignItems: 'center',
        }}>
          <div>
            <FadeSection delay={80}>
              <h2 style={{
                fontFamily: "'Prata', serif", fontWeight: 400,
                fontSize: 'clamp(26px,3.4vw,42px)', lineHeight: 1.16, color: C.kostYar,
                letterSpacing: '-0.01em', marginBottom: 24, maxWidth: '14ch',
              }}>
                Точка <span style={{ color: C.zolotoYar }}>баланса</span>.
              </h2>
            </FadeSection>
            <FadeSection delay={180}>
              <p style={{
                fontFamily: "'Lora', serif", fontSize: 18, lineHeight: 1.78, color: C.kostDim,
                maxWidth: '52ch',
              }}>
                Исходное явление Аргонавтики — Точка Баланса. Аргонавт — носитель баланса,
                самой большой силы в&nbsp;мире.
                <br /><br />
                Сейчас ситуация такова, что в&nbsp;результате выливания в&nbsp;мир множества знаний
                появилось большое количество «пробуждённых» и&nbsp;«просветлённых», не&nbsp;заземливших
                понимание в&nbsp;теле. Это душнота, мающаяся в&nbsp;концепциях и&nbsp;не&nbsp;переходящая
                к&nbsp;делу. Фитобоярство.
                <br /><br />
                Аргонавт не&nbsp;ведётся на&nbsp;лень и&nbsp;малодушие внутреннего фитобоярина, когда тот
                начинает петь свою однообразную песню&nbsp;— поэтому обретает свободу от&nbsp;внешней
                душноты, оживляя пространство, в&nbsp;котором находится.
              </p>
            </FadeSection>
          </div>

          <FadeSection delay={260} y={20}>
            <BalanceHalos />
          </FadeSection>
        </div>
      </div>
    </section>
  )
}
