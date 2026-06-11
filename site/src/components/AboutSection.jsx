import { useEffect, useRef } from 'react'
import { C, FadeSection, MeanderRule, MEDIA, MovementGlyph, SecLabel, StarSpark } from './Shared'

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

const ARC = [
  { k: 'Чужие сценарии', s: 'где ты сейчас' },
  { k: 'Своя опора', s: 'плотное Ядро' },
  { k: 'Призвание', s: 'твоё Дело' },
  { k: 'Легендарность', s: 'наследие' },
]

const MOVES = [
  { glyph: 'yav', big: 'Внутрь', label: 'ЯВЬ', color: C.kost, desc: 'Освобождение внимания. Опора.' },
  { glyph: 'nav', big: 'Вглубь', label: 'НАВЬ', color: C.krovYar, desc: 'Погружение за самой большой силой.' },
  { glyph: 'prav', big: 'Наверх', label: 'ПРАВЬ', color: C.zoloto, desc: 'Проявленность. Дело — в мир.' },
]

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

        {/* Arc */}
        <FadeSection delay={120}>
          <div style={{
            fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 500, letterSpacing: 3,
            textTransform: 'uppercase', color: C.ghost, marginBottom: 26,
          }}>Дуга превращения</div>
        </FadeSection>
        <FadeSection delay={180}>
          <div className="arc-row" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
            position: 'relative', marginBottom: 'clamp(56px,8vw,96px)',
          }}>
            <div style={{
              position: 'absolute', top: 5, left: '12.5%', right: '12.5%', height: 1,
              background: `linear-gradient(to right, ${C.stone}, ${C.zoloto})`, opacity: 0.55,
            }} />
            {ARC.map((a, i) => (
              <div key={i} style={{ position: 'relative', paddingTop: 24, paddingRight: 16 }}>
                <div style={{ position: 'absolute', top: 0, left: 0 }}>
                  <StarSpark
                    size={i === ARC.length - 1 ? 12 : 9}
                    color={i === ARC.length - 1 ? C.zolotoYar : (i === 0 ? C.stone : C.latun)}
                  />
                </div>
                <div style={{
                  fontFamily: "'Prata', serif", fontSize: 'clamp(15px,1.7vw,20px)',
                  color: i === ARC.length - 1 ? C.zolotoYar : C.kost, marginBottom: 6, lineHeight: 1.2,
                }}>{a.k}</div>
                <div style={{
                  fontFamily: "'Onest', sans-serif", fontSize: 10, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: C.ghost,
                }}>{a.s}</div>
              </div>
            ))}
          </div>
        </FadeSection>

        {/* Three movements */}
        <FadeSection delay={120}><MeanderRule style={{ marginBottom: 48 }} opacity={0.35} /></FadeSection>
        <div className="moves-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: C.frame }}>
          {MOVES.map((m, i) => (
            <FadeSection key={i} delay={140 + i * 120} style={{ background: C.bezdna }}>
              <div style={{ padding: 'clamp(28px,4vw,40px) clamp(20px,3vw,34px)' }}>
                <MovementGlyph kind={m.glyph} size={44} color={m.color} />
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: "'Prata', serif", fontSize: 'clamp(22px,2.6vw,30px)', color: C.kostYar }}>{m.big}</span>
                  <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: m.color }}>{m.label}</span>
                </div>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 15.5, lineHeight: 1.65, color: C.kostMuted, marginTop: 12 }}>{m.desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>

        <FadeSection delay={200}>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 'clamp(16px,1.7vw,19px)',
            lineHeight: 1.65, color: C.kostDim, maxWidth: '44ch',
            margin: 'clamp(56px,8vw,90px) auto 0', textAlign: 'center',
          }}>
            Идти сразу наверх — духовная ловушка, так люди отлетают и становятся репликаторами
            эгрегоров.<br />Настоящая реализация происходит через углубление и проявление
            глубины в&nbsp;мир.
          </p>
        </FadeSection>
      </div>
    </section>
  )
}
