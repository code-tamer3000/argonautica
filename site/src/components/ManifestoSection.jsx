import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { C, FadeSection, Hairline, MEDIA, SecLabel, StarSpark } from './Shared'
import manifestoRaw from '../../public/media/manifesto.md?raw'

// ─── Parse manifesto.md into sections ────────────────────────────────────────
const parseManifesto = (text) => {
  const sections = []
  let current = { num: '●', title: 'Предисловие' }
  let paras = []
  let buf = []

  const pushBuf = () => { if (buf.length) { paras.push(buf.join('\n')); buf = [] } }
  const saveSec = () => {
    pushBuf()
    if (paras.length) { sections.push({ ...current, paragraphs: [...paras] }); paras = [] }
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    const m = line.match(/^(0|[IVXLC]+)\.\s+(.+)/i)
    if (m) {
      saveSec()
      current = { num: m[1].toUpperCase(), title: m[2] }
    } else if (line === 'ИССЛЕДОВАНИЕ.') {
      saveSec()
      current = { num: '∞', title: 'Исследование' }
    } else if (!line) {
      pushBuf()
    } else {
      buf.push(line)
    }
  }
  saveSec()
  return sections
}

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

// ─── Paragraph renderer — detects all-caps sub-headers ───────────────────────
const Para = ({ text }) => {
  const isSubHead = text === text.toUpperCase() && text.replace(/[^А-ЯЁA-Z]/g, '').length > 3 && text.length < 80
  if (isSubHead) {
    return (
      <p style={{
        fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase', color: C.latun,
        margin: '32px 0 12px', lineHeight: 1.6,
      }}>{text}</p>
    )
  }
  const lines = text.split('\n')
  return (
    <p style={{ fontFamily: "'Lora', serif", fontSize: 16, lineHeight: 1.9, color: C.kostDim, margin: '0 0 20px' }}>
      {lines.map((line, i) => (
        <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
      ))}
    </p>
  )
}

// ─── Full manifesto popup ─────────────────────────────────────────────────────
const ManifestoModal = ({ open, onClose }) => {
  const [active, setActive] = useState(0)
  const [chapters, setChapters] = useState(null)
  const containerRef = useRef(null)
  const chapterRefs = useRef([])
  const loadedRef = useRef(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Parse manifesto from bundled raw string — no HTTP request needed
  useEffect(() => {
    if (!open || loadedRef.current) return
    loadedRef.current = true
    setChapters(parseManifesto(manifestoRaw))
  }, [open])

  // IntersectionObserver for active chapter tracking
  useEffect(() => {
    if (!open || !chapters) return
    const container = containerRef.current
    if (!container) return
    const observers = chapters.map((_, i) => {
      const el = chapterRefs.current[i]
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i) },
        { root: container, threshold: 0.25 }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)
    return () => observers.forEach(o => o.disconnect())
  }, [open, chapters])

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
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 28px', borderBottom: '1px solid rgba(194,154,72,0.14)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StarSpark size={9} color={C.zoloto} />
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: C.latun }}>
              Аргонавтика · Манифест · XXIV главы
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

        {/* Body */}
        <div style={{ flex: 1, overflow: 'hidden', padding: 'clamp(20px,3vw,36px)' }}>
          {chapters === null ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, letterSpacing: 3, color: C.latun }}>
                Загрузка манифеста…
              </div>
            </div>
          ) : (
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
                  Главы
                </div>
                {chapters.map((ch, i) => (
                  <button key={i} onClick={() => scrollToChapter(i)} style={{
                    display: 'flex', alignItems: 'baseline', gap: 10, width: '100%',
                    background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                    padding: '9px 0', borderBottom: `1px solid rgba(194,154,72,${active === i ? 0.4 : 0.1})`,
                    transition: 'border-color 220ms ease',
                  }}>
                    <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 9.5, fontWeight: 600, letterSpacing: 1, color: active === i ? C.zolotoYar : C.stone, width: 28, flexShrink: 0, paddingTop: 1 }}>{ch.num}</span>
                    <span style={{ fontFamily: "'Prata', serif", fontSize: 12.5, lineHeight: 1.3, color: active === i ? C.kostYar : C.kostMuted, transition: 'color 220ms ease' }}>{ch.title}</span>
                  </button>
                ))}
              </nav>

              {/* Reading pane — full manifesto text */}
              <div ref={containerRef} className="manifesto-scroll" style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 6 }}>
                {chapters.map((ch, i) => (
                  <article key={i} ref={el => { chapterRefs.current[i] = el }}
                    style={{
                      maxWidth: '62ch',
                      paddingTop: i === 0 ? 4 : 44,
                      paddingBottom: 44,
                      borderBottom: i < chapters.length - 1 ? '1px solid rgba(194,154,72,0.12)' : 'none',
                    }}>
                    {ch.num !== '●' && (
                      <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: C.latun, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <StarSpark size={8} color={C.zoloto} />Глава {ch.num}
                      </div>
                    )}
                    <h3 style={{ fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(20px,2.4vw,28px)', lineHeight: 1.22, color: C.kostYar, marginBottom: 20 }}>
                      {ch.title}
                    </h3>
                    <Hairline strength="soft" style={{ marginBottom: 24 }} />
                    {ch.paragraphs.map((p, j) => (
                      <Para key={j} text={p} />
                    ))}
                  </article>
                ))}
                <div style={{ height: 40 }} />
              </div>
            </div>
          )}
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
