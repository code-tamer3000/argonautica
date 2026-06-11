import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { C, FadeSection, Hairline, MEDIA, SecLabel, StarSpark } from './Shared'

const CHAPTERS = [
  {
    num: 'I', title: 'Архитектура симуляции',
    body: 'Мы живём в цифровой симуляции. Это фундаментальная рабочая предпосылка — не метафора. Задача аргонавта — научиться различать живое от неживого. Различать за тысячу шагов: чувствовать, знать и быть готовым ещё до того, как неживое на тебя бросится.',
    pull: 'Различать живое от неживого. За тысячу шагов.'
  },
  {
    num: 'IV', title: 'Вертикаль и горизонтали',
    body: 'Пока Ядро не собрано — невозможно участвовать в собственных событийных рядах. Человек включается в чужие игры, созданные другими сценаристами. Первичная задача аргонавта — освободить внимание из внешних горизонтальных игр и сфокусироваться на уплотнении своего Ядра.',
    hard: 'Одиночество — титановая оболочка Ядра.'
  },
  {
    num: 'V', title: 'Вещество Матрицы',
    body: 'Матрица ни в коем случае не враг. Воевать с матрицей — сон безумца. Аргонавт понимает принципы её работы и лепит из неё свою великую действительность. Намерение → Сопротивление → Рождение — абсолютная закономерность, работающая как часы.',
    pull: 'Матрица — это пластилин в руках аргонавта.',
    hard: 'Бояться пиздеца — значит отказываться от великих дел.'
  },
  {
    num: 'VI', title: 'Мир — зеркало',
    body: 'Ты принял твёрдое решение, Матрица приняла его к исполнению. Но проходит время, ты смотришь в зеркало — а там всё как прежде, и бросаешь начатое на полпути. Физика инертна. Матрица материализует с задержкой; её инерцию нужно воспринимать как благо.',
    pull: 'Аргонавтика начинается, когда ты разбиваешь зеркало.'
  },
  {
    num: 'VIII', title: 'Ловушка окружения',
    body: 'Матрица не выключает тебя сразу — она действует через постепенное усыпление. Аргонавт видит вовлекающие ловушки и даже среди людей не теряет состояния трезвого одиночества. Самые сильные проверки часто приходят через близких.',
    hard: 'Отсутствие врагов — признак посредственности человека.'
  },
  {
    num: 'IX', title: 'Правило бинера',
    body: 'Энергия вырабатывается на разнице потенциалов. Свет и тьма, день и ночь, напряжение и расслабление. Чем глубже вхождение в тишину и недеяние — тем больше энергии действия черпается из бездонного источника. Аргонавт ловит и держит Баланс.',
    pull: 'Энергия вырабатывается на разнице потенциалов.'
  },
  {
    num: 'XIV', title: 'Необходимость действовать',
    body: 'Аргонавт идёт своим путём — он активирует Бездеятеля: того, кто создаёт импульс, из которого рождается действие. Мы встаём в точку, из которой возникает Намерение, и держимся там, пока оно не станет плотным. Намерение → Импульс → Действие.'
  },
  {
    num: 'XV', title: 'Оживление',
    body: 'Пробуждение и Просветление — не финал. За ними есть третий этап. Оживление — интеграция всех знаний в жизнь, разворачивание реальности из точки баланса. Аргонавт — человек, активирующий живые структуры.',
    pull: 'Пробуждение — не финал. Есть третий этап: Оживление.'
  },
  {
    num: 'XVIII', title: 'Перезагрузка системы 64-х',
    body: 'Здесь всё начинается с чистого импульса. После — всегда Проверка от системы, плодородная Тень. Именно здесь ты опускаешь руки. Ты не слабый — ты просто не знаешь механизма. Проходя плотность Тени, Ядро Намерения укрепляется, и ты обретаешь Дар.',
    pull: 'Сиддхи → Тень → Дар.'
  },
  {
    num: 'XXIII', title: 'Карта Аргонавтики',
    body: 'Карта собирает твоё внимание, чтобы ты дошёл. На ней — состояния, что держат тебя; этапы, открывающиеся по одному; и Золотое Руно как пламя, которое, загораясь, меняет всё.'
  },
]

// ─── Thread canvas particles ──────────────────────────────────────────────────
const ThreadParticles = () => {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth || 54
    const H = canvas.offsetHeight || 460
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    const particles = Array.from({ length: 24 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 12,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.2 + 0.15,
      alpha: Math.random() * 0.2 + 0.15,
      phase: Math.random() * Math.PI * 0.2,
      phaseSpeed: (Math.random() - 0.5) * 0.01,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.y -= p.speed; p.phase += p.phaseSpeed
        p.x += Math.sin(p.phase) * 0.35
        if (p.y < -4) { p.y = H + 4; p.x = W / 2 + (Math.random() - 0.5) * 12 }
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5)
        grd.addColorStop(0, `rgba(217,180,90,${p.alpha})`)
        grd.addColorStop(1, 'rgba(194,154,72,0)')
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = grd; ctx.fill()
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,220,140,${Math.min(p.alpha * 1.5, 1)})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'screen' }} />
}

// ─── Chapter body ─────────────────────────────────────────────────────────────
const ChapterBody = ({ ch }) => (
  <>
    <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: C.latun, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
      <StarSpark size={9} color={C.zoloto} />Глава {ch.num}
    </div>
    <h3 style={{ fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(22px,2.6vw,32px)', lineHeight: 1.22, color: C.kostYar, marginBottom: 22 }}>{ch.title}</h3>
    <Hairline strength="soft" style={{ marginBottom: 26 }} />
    <p style={{ fontFamily: "'Lora', serif", fontSize: 17, lineHeight: 1.85, color: C.kostDim, marginBottom: ch.pull || ch.hard ? 28 : 0 }}>{ch.body}</p>
    {ch.pull && (
      <blockquote style={{ margin: '0 0 28px', display: 'flex', gap: 14 }}>
        <StarSpark size={11} color={C.zoloto} style={{ marginTop: 12, flexShrink: 0 }} />
        <p style={{ fontFamily: "'Prata', serif", fontSize: 'clamp(18px,2.2vw,26px)', lineHeight: 1.34, color: C.kostYar, margin: 0 }}>{ch.pull}</p>
      </blockquote>
    )}
    {ch.hard && (
      <p style={{ fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 'clamp(13px,1.5vw,16px)', letterSpacing: 0.5, color: C.krovYar, lineHeight: 1.5, margin: '0 0 28px', paddingLeft: 16, borderLeft: `2px solid ${C.krov}` }}>{ch.hard}</p>
    )}
  </>
)

// ─── Full manifesto popup ─────────────────────────────────────────────────────
const ManifestoModal = ({ open, onClose }) => {
  const [active, setActive] = useState(0)
  const containerRef = useRef(null)
  const chapterRefs = useRef([])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const container = containerRef.current
    if (!container) return
    const observers = CHAPTERS.map((_, i) => {
      const el = chapterRefs.current[i]
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i) },
        { root: container, threshold: 0.35 }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)
    return () => observers.forEach(o => o.disconnect())
  }, [open])

  const scrollToChapter = (i) => {
    setActive(i)
    const el = chapterRefs.current[i]
    if (el && containerRef.current) containerRef.current.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
  }

  if (!open) return null

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(12px,3vw,48px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 1100, maxHeight: '92vh',
        background: C.tishina, borderRadius: 8,
        border: '1px solid rgba(194,154,72,0.22)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'modalIn 0.28s cubic-bezier(.22,.61,.36,1)',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 28px', borderBottom: '1px solid rgba(194,154,72,0.14)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StarSpark size={9} color={C.zoloto} />
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: C.latun }}>
              Манифест · XXIV главы
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.ghost, fontSize: 18, lineHeight: 1, padding: '4px 8px',
            transition: 'color 200ms ease', fontFamily: 'monospace',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.kost }}
            onMouseLeave={e => { e.currentTarget.style.color = C.ghost }}
          >✕</button>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflow: 'hidden', padding: 'clamp(20px,3vw,36px)' }}>
          <div className="manifesto-grid" style={{
            display: 'grid', gridTemplateColumns: '54px 200px 1fr',
            gap: 'clamp(20px,3vw,48px)', alignItems: 'start', height: '100%',
          }}>
            {/* Thread rail */}
            <div className="thread-rail" style={{
              height: '100%', borderRadius: 6, overflow: 'hidden',
              border: '1px solid rgba(194,154,72,0.18)', position: 'relative', minHeight: 400,
            }}>
              <img src={MEDIA.thread} alt="Нить Ариадны"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 30%, transparent 70%, rgba(0,0,0,0.45))' }} />
              <ThreadParticles />
            </div>

            {/* Chapter nav */}
            <nav className="ch-nav manifesto-nav-scroll" style={{ position: 'sticky', top: 0, maxHeight: '72vh', overflowY: 'auto' }}>
              <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: 3, textTransform: 'uppercase', color: C.ghost, marginBottom: 14 }}>
                I — XXIV · Главы
              </div>
              {CHAPTERS.map((c, i) => (
                <button key={i} onClick={() => scrollToChapter(i)} style={{
                  display: 'flex', alignItems: 'baseline', gap: 10, width: '100%',
                  background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                  padding: '10px 0', borderBottom: `1px solid rgba(194,154,72,${active === i ? 0.4 : 0.1})`,
                  transition: 'border-color 220ms ease',
                }}>
                  <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, color: active === i ? C.zolotoYar : C.stone, width: 32, flexShrink: 0 }}>{c.num}</span>
                  <span style={{ fontFamily: "'Prata', serif", fontSize: 13, lineHeight: 1.3, color: active === i ? C.kostYar : C.kostMuted, transition: 'color 220ms ease' }}>{c.title}</span>
                </button>
              ))}
              <div style={{ marginTop: 12, fontFamily: "'Onest', sans-serif", fontSize: 10, letterSpacing: 2, color: C.stone }}>· · · и далее до XXIV</div>
            </nav>

            {/* Reading pane */}
            <div ref={containerRef} className="manifesto-scroll" style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 6 }}>
              {CHAPTERS.map((ch, i) => (
                <article key={i} ref={el => { chapterRefs.current[i] = el }}
                  style={{ maxWidth: '62ch', paddingTop: i === 0 ? 4 : 40, paddingBottom: 40, borderBottom: i < CHAPTERS.length - 1 ? '1px solid rgba(194,154,72,0.12)' : 'none' }}>
                  <ChapterBody ch={ch} />
                </article>
              ))}
              <div style={{ paddingTop: 28, paddingBottom: 8, fontFamily: "'Onest', sans-serif", fontSize: 10.5, letterSpacing: 2, color: C.stone, textAlign: 'center' }}>
                · · · главы X — XXIV в полном Манифесте
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Three featured pull-quotes ───────────────────────────────────────────────
const FEATURED = [
  { num: 'I', text: 'Различать живое от неживого. За тысячу шагов.' },
  { num: 'V', text: 'Матрица — это пластилин в руках аргонавта.' },
  { num: 'XV', text: 'Пробуждение — не финал. Есть третий этап: Оживление.' },
]

// ─── ManifestoSection — compact ──────────────────────────────────────────────
export default function ManifestoSection() {
  const [open, setOpen] = useState(false)

  return (
    <section id="manifesto" style={{
      background: C.tishina,
      padding: 'clamp(98px,12vw,172px) clamp(22px,6vw,80px)',
      borderTop: '1px solid rgba(194,154,72,0.1)',
    }}>
      <ManifestoModal open={open} onClose={() => setOpen(false)} />

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <FadeSection>
          <SecLabel num="02" text="Манифест" />
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(26px,3.4vw,40px)', lineHeight: 1.2, color: C.kostYar,
            maxWidth: '16ch', marginBottom: 18,
          }}>Точка притяжения. Выжимка сути.</h2>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 17, lineHeight: 1.7,
            color: C.kostMuted, maxWidth: '54ch', marginBottom: 'clamp(36px,5vw,56px)',
          }}>
            Двадцать четыре главы о природе реальности, внимания и проявления.
            Ниже — три строки из айсберга.
          </p>
        </FadeSection>

        {/* Featured pull quotes */}
        <FadeSection delay={80}>
          <div style={{ marginBottom: 'clamp(40px,6vw,64px)' }}>
            {FEATURED.map((q, i) => (
              <div key={i} style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                padding: 'clamp(18px,2.5vw,26px) 0',
                borderBottom: '1px solid rgba(194,154,72,0.12)',
              }}>
                <span style={{
                  fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 600,
                  letterSpacing: 1.5, color: C.latun, paddingTop: 5, flexShrink: 0, width: 28,
                }}>{q.num}</span>
                <StarSpark size={10} color={C.zoloto} style={{ marginTop: 7, flexShrink: 0 }} />
                <p style={{
                  fontFamily: "'Prata', serif", fontWeight: 400,
                  fontSize: 'clamp(18px,2.4vw,26px)', lineHeight: 1.38,
                  color: C.kostYar, margin: 0,
                }}>{q.text}</p>
              </div>
            ))}
          </div>
        </FadeSection>

        <FadeSection delay={160}>
          <button
            onClick={() => setOpen(true)}
            style={{
              fontFamily: "'Onest', sans-serif", fontSize: 12, fontWeight: 600,
              letterSpacing: 1.5, textTransform: 'uppercase',
              padding: '14px 28px', borderRadius: 6, cursor: 'pointer',
              background: 'transparent', color: C.kostDim,
              border: '1px solid rgba(194,154,72,0.45)',
              transition: 'border-color 220ms ease, color 220ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.zoloto; e.currentTarget.style.color = C.kostYar }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.45)'; e.currentTarget.style.color = C.kostDim }}
          >Читать Манифест целиком →</button>
        </FadeSection>

        <FadeSection delay={240}>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic',
            fontSize: 'clamp(15px,1.8vw,18px)', lineHeight: 1.7,
            color: C.kostMuted, maxWidth: '48ch',
            marginTop: 'clamp(36px,5vw,56px)',
          }}>
            Если после Манифеста ты почувствовал ледяной огонь — ты готов идти дальше.
            <br />Если нет — найди себе другое сообщество.
          </p>
        </FadeSection>
      </div>
    </section>
  )
}
