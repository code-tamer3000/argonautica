import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { C, FadeSection, Hairline, MEDIA, SecLabel, StarSpark } from './Shared'
import manifestoRaw from '../../public/media/manifesto.md?raw'

// ─── Parse manifesto.md into sections ────────────────────────────────────────
const parseManifesto = (text) => {
  const sections = []
  let current = { num: '●', title: 'Предисловие' }
  let bodyLines = []

  const saveSec = () => {
    const body = bodyLines.join('\n').trimEnd()
    if (body.trim()) sections.push({ ...current, body })
    bodyLines = []
  }

  for (const raw of text.split('\n')) {
    const trimmed = raw.trim()
    const m = trimmed.match(/^(0|[IVXLC]+)\.\s+(.+)/i)
    if (m) {
      saveSec()
      current = { num: m[1].toUpperCase(), title: m[2] }
    } else if (trimmed === 'ИССЛЕДОВАНИЕ.') {
      saveSec()
      current = { num: '∞', title: 'Исследование' }
    } else {
      bodyLines.push(raw)
    }
  }
  saveSec()
  return sections
}

// ─── Inline markdown: **bold**, *italic* ─────────────────────────────────────
const parseInline = (text) => {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|_[^_\n]+_)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: C.kostYar, fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    if (/^(\*|_)[^*_]+(\*|_)$/.test(part))
      return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>
    return part
  })
}

// ─── Block markdown renderer ──────────────────────────────────────────────────
const MarkdownBody = ({ text }) => (
  <>
    {text.split(/\n\n+/).map((block, i) => {
      const t = block.trim()
      if (!t) return null
      if (t.startsWith('> ')) {
        return (
          <blockquote key={i} style={{ borderLeft: `2px solid ${C.latun}`, paddingLeft: 16, margin: '8px 0 20px', opacity: 0.9 }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: 16, lineHeight: 1.9, color: C.kostDim, margin: 0 }}>
              {parseInline(t.replace(/^> /gm, ''))}
            </p>
          </blockquote>
        )
      }
      return (
        <p key={i} style={{ fontFamily: "'Lora', serif", fontSize: 16, lineHeight: 1.9, color: C.kostDim, margin: '0 0 20px' }}>
          {parseInline(t.replace(/\n/g, ' '))}
        </p>
      )
    })}
  </>
)

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

// ─── Full manifesto popup ─────────────────────────────────────────────────────
const ManifestoModal = ({ open, onClose }) => {
  const [active, setActive] = useState(0)
  const [chapters, setChapters] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const containerRef = useRef(null)
  const chapterRefs = useRef([])
  const loadedRef = useRef(false)
  const scrollingRef = useRef(false)
  const scrollTimerRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const h = e => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

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
    if (!open || loadedRef.current) return
    loadedRef.current = true
    setChapters(parseManifesto(manifestoRaw))
  }, [open])

  useEffect(() => {
    if (!open || !chapters) return
    const container = containerRef.current
    if (!container) return
    const observers = chapters.map((_, i) => {
      const el = chapterRefs.current[i]
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting && !scrollingRef.current) setActive(i) },
        { root: container, threshold: 0, rootMargin: '0px 0px -70% 0px' }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)
    return () => observers.forEach(o => o.disconnect())
  }, [open, chapters])

  const scrollToChapter = (i) => {
    setActive(i)
    setTocOpen(false)
    scrollingRef.current = true
    clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => {
      const el = chapterRefs.current[i]
      const container = containerRef.current
      if (el && container) {
        const containerRect = container.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        const newTop = container.scrollTop + (elRect.top - containerRect.top) - 8
        container.scrollTo({ top: newTop, behavior: 'smooth' })
        scrollTimerRef.current = setTimeout(() => { scrollingRef.current = false }, 700)
      } else {
        scrollingRef.current = false
      }
    }, 50)
  }

  if (!open) return null

  const chapterLabel = chapters
    ? (chapters[active].num !== '●' ? `Глава ${chapters[active].num}` : '●')
    : ''

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? 0 : 'clamp(12px,3vw,48px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 1100,
        height: isMobile ? '100%' : undefined,
        maxHeight: isMobile ? '100%' : '92vh',
        background: C.tishina,
        borderRadius: isMobile ? 0 : 8,
        border: isMobile ? 'none' : '1px solid rgba(194,154,72,0.22)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'modalIn 0.28s cubic-bezier(.22,.61,.36,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '14px 16px' : '18px 28px',
          borderBottom: '1px solid rgba(194,154,72,0.14)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StarSpark size={9} color={C.zoloto} />
            <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: C.latun }}>
              {isMobile ? 'Манифест' : 'Аргонавтика · Манифест · XXIV главы'}
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

        {/* Mobile: current chapter bar */}
        {isMobile && chapters && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', flexShrink: 0,
            borderBottom: '1px solid rgba(194,154,72,0.12)',
            background: tocOpen ? C.surface : C.tishina,
            transition: 'background 200ms ease',
          }}>
            <div style={{ minWidth: 0, marginRight: 12 }}>
              <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: C.latun, marginBottom: 2 }}>
                {chapterLabel}
              </div>
              <div style={{ fontFamily: "'Prata', serif", fontSize: 13, color: C.kostDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chapters[active].title}
              </div>
            </div>
            <button
              onClick={() => setTocOpen(o => !o)}
              style={{
                flexShrink: 0,
                background: 'none',
                border: `1px solid ${tocOpen ? 'rgba(194,154,72,0.55)' : 'rgba(194,154,72,0.28)'}`,
                borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
                fontFamily: "'Onest', sans-serif", fontSize: 9, fontWeight: 600,
                letterSpacing: 2, textTransform: 'uppercase',
                color: tocOpen ? C.kostYar : C.ghost,
                transition: 'color 180ms ease, border-color 180ms ease',
              }}
            >
              {tocOpen ? '✕' : 'Главы'}
            </button>
          </div>
        )}

        {/* Mobile: TOC panel (replaces body when open) */}
        {isMobile && tocOpen && chapters && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 40px' }}>
            <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: 3, textTransform: 'uppercase', color: C.ghost, marginBottom: 16 }}>
              Главы
            </div>
            {chapters.map((ch, i) => (
              <button key={i} onClick={() => scrollToChapter(i)} style={{
                display: 'flex', alignItems: 'baseline', gap: 12, width: '100%',
                background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                padding: '11px 0', borderBottom: `1px solid rgba(194,154,72,${active === i ? 0.4 : 0.1})`,
              }}>
                <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 9.5, fontWeight: 600, letterSpacing: 1, color: active === i ? C.zolotoYar : C.stone, width: 28, flexShrink: 0 }}>
                  {ch.num}
                </span>
                <span style={{ fontFamily: "'Prata', serif", fontSize: 15, lineHeight: 1.3, color: active === i ? C.kostYar : C.kostMuted }}>
                  {ch.title}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Body (скрыт на мобильном когда открыт TOC) */}
        <div style={{
          flex: 1, overflow: 'hidden',
          padding: isMobile ? '16px' : 'clamp(20px,3vw,36px)',
          display: isMobile && tocOpen ? 'none' : undefined,
        }}>
          {chapters === null ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, letterSpacing: 3, color: C.latun }}>
                Загрузка манифеста…
              </div>
            </div>
          ) : (
            <div className="manifesto-grid" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '54px 200px 1fr',
              gap: 'clamp(20px,3vw,48px)', alignItems: 'start', height: '100%',
            }}>
              {/* Thread rail — только десктоп */}
              {!isMobile && (
                <div className="thread-rail" style={{
                  height: '100%', borderRadius: 6, overflow: 'hidden',
                  border: '1px solid rgba(194,154,72,0.18)', position: 'relative', minHeight: 400,
                }}>
                  <img src={MEDIA.thread} alt="Нить Ариадны"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 30%, transparent 70%, rgba(0,0,0,0.45))' }} />
                  <ThreadParticles />
                </div>
              )}

              {/* Chapter nav — только десктоп */}
              {!isMobile && (
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
              )}

              {/* Reading pane */}
              <div ref={containerRef} className="manifesto-scroll" style={{ maxHeight: isMobile ? 'calc(92vh - 120px)' : '72vh', overflowY: 'auto', paddingRight: isMobile ? 0 : 6 }}>
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
                    <MarkdownBody text={ch.body} />
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
          <SecLabel num="03" text="Манифест" />
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
