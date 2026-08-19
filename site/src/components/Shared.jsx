import { useState, useEffect, useRef } from 'react'

// ─── COLOR TOKENS ─────────────────────────────────────────────────────────────
export const C = {
  bezdna:     '#0B100E',
  tishina:    '#000000',
  more:       '#134E45',
  moreGlub:   '#0E342E',
  kost:       '#E9E2D4',
  kostYar:    '#F4F1E9',
  kostDim:    '#C7C0B1',
  kostMuted:  '#9A9486',
  ghost:      '#6A665B',
  stone:      '#4F4B42',
  zoloto:     '#C29A48',
  zolotoYar:  '#D9B45A',
  latun:      '#9C7A33',
  krov:       '#8E2018',
  krovYar:    '#B23A2E',
  kamen:      '#6E6A5E',
  frame:      '#1C211E',
  frameDeep:  '#2C322E',
  surface:    '#0C100F',
}

// ─── MEDIA PATHS ──────────────────────────────────────────────────────────────
export const MEDIA = {
  sea:       './media/sea.jpg',
  seaVideo:  './media/waves_opt.mp4',
  seaVideoDesk: './media/waves_desk.mp4',
  seaPoster: './media/waves_poster.jpg',
  back:      './media/back.mp4',
  seaShip:   './media/sea_ship.jpg',
  argoLine:  './media/argo_lineart.jpg',
  monogram:  './media/monogram.png',
  argoShip:  './media/argo_ship.png',
  argoBoat:  './media/argo_boat.png',
  thread:    './media/thread.jpg',
  sword:     './media/sword.jpg',
  rings:     './media/rings.jpg',
  ascension: './media/ascension.jpg',
  helmet:    './media/helmet_meander.jpg',
  vase:      './media/argonaut_vase.jpg',
  worldsMap: './media/worlds_map.jpg',
  warrior:   './media/warrior_against_matrix.jpg',
  platformCalendar: './media/platform_calendar.png',
  platformRubkaLight:     './media/platform_rubka_light.png',
  platformRubkaDark:      './media/platform_rubka_dark.png',
  platformTasksLight:     './media/platform_tasks_light.png',
  platformTasksDark:      './media/platform_tasks_dark.png',
  platformGenesLight:     './media/platform_genes_light.png',
  platformGenesDark:      './media/platform_genes_dark.png',
  platformKnowledgeLight: './media/platform_knowledge_light.png',
  platformKnowledgeDark:  './media/platform_knowledge_dark.png',
  platformInstall:        './media/platform_install.mp4',
  positionNabludatel: './media/positions/position_nabludatel.jpg',
  positionIgrok:      './media/positions/position_igrok.jpg',
  positionSpecotryad: './media/positions/position_specotryad.jpg',
  positionOko:        './media/positions/position_oko.jpg',
}

// ─── STAR SPARK ───────────────────────────────────────────────────────────────
export const StarSpark = ({ size = 12, color = C.zoloto, style }) => (
  <svg
    width={size} height={size}
    viewBox="-11 -11 22 22"
    style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', ...style }}
    aria-hidden="true"
  >
    <path
      d="M0,-10 C1.5,-3 3,-1.5 10,0 C3,1.5 1.5,3 0,10 C-1.5,3 -3,1.5 -10,0 C-3,-1.5 -1.5,-3 0,-10 Z"
      fill={color}
    />
  </svg>
)

// ─── THREE MOVEMENT GLYPHS ────────────────────────────────────────────────────
export const MovementGlyph = ({ kind = 'yav', size = 40, color = C.kost }) => {
  const s = { display: 'block' }
  if (kind === 'yav') {
    return (
      <svg width={size} height={size} viewBox="-24 -24 48 48" style={s} fill="none" stroke={color} strokeWidth="1.1" aria-hidden="true">
        <circle cx="0" cy="0" r="17" opacity="0.75" />
        <line x1="-22" y1="0" x2="22" y2="0" opacity="0.55" />
        <line x1="0" y1="-22" x2="0" y2="22" opacity="0.55" />
        <circle cx="0" cy="0" r="2.4" fill={color} stroke="none" />
      </svg>
    )
  }
  if (kind === 'nav') {
    return (
      <svg width={size} height={size} viewBox="-24 -24 48 48" style={s} fill="none" stroke={color} strokeWidth="1.1" aria-hidden="true">
        <circle cx="0" cy="-3" r="14" opacity="0.85" />
        <path d="M0,-3 C5,-3 5,3 0,3 C-5,3 -5,-3 0,-3 Z" fill={color} stroke="none" opacity="0.9" />
        <line x1="0" y1="11" x2="0" y2="20" opacity="0.6" />
        <circle cx="0" cy="20" r="1.6" fill={color} stroke="none" />
      </svg>
    )
  }
  // prav
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48" style={s} fill="none" stroke={color} strokeWidth="1.1" aria-hidden="true">
      {[0,45,90,135,180,225,270,315].map(a => {
        const r = a % 90 === 0 ? 21 : 14
        const rad = a * Math.PI / 180
        return <line key={a} x1={Math.cos(rad)*5} y1={Math.sin(rad)*5} x2={Math.cos(rad)*r} y2={Math.sin(rad)*r} opacity={a%90===0?0.85:0.4} />
      })}
      <path d="M0,-7 C1,-2 2,-1 7,0 C2,1 1,2 0,7 C-1,2 -2,1 -7,0 C-2,-1 -1,-2 0,-7 Z" fill={color} stroke="none" />
    </svg>
  )
}

// ─── WORDMARK ─────────────────────────────────────────────────────────────────
export const WordMark = ({ text = 'АРГОНАВТИКА', size = 13, color = C.kostDim, gap = 6, withStar = true, starColor = C.zoloto, style }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap,
    fontFamily: "'Prata', serif",
    fontSize: size, letterSpacing: Math.max(2, size * 0.32),
    textTransform: 'uppercase', color, lineHeight: 1.4, ...style,
  }}>
    {withStar && <StarSpark size={size * 0.72} color={starColor} />}
    {text}
  </span>
)

// ─── FADE ON SCROLL ───────────────────────────────────────────────────────────
export const FadeSection = ({ children, delay = 0, y = 28, style, className }) => {
  const ref = useRef(null)
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [visible, setVisible] = useState(reduceMotion)

  useEffect(() => {
    if (reduceMotion) { setVisible(true); return }
    const el = ref.current
    if (!el) return
    let revealed = false
    let timer = null

    const reveal = () => {
      if (revealed) return
      revealed = true
      cleanup()
      timer = setTimeout(() => setVisible(true), delay)
    }
    const vh = () => window.innerHeight || 800
    const inView = () => {
      const r = el.getBoundingClientRect()
      return r.top < vh() * 0.94 && r.bottom > 0
    }
    const onScroll = () => { if (inView()) reveal() }
    function cleanup() {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }

    if (inView()) {
      reveal()
    } else {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      requestAnimationFrame(() => { if (!revealed && inView()) reveal() })
      setTimeout(() => { if (!revealed && inView()) reveal() }, 250)
    }
    const fallback = setTimeout(reveal, 1500 + delay)

    return () => { cleanup(); if (timer) clearTimeout(timer); clearTimeout(fallback) }
  }, [delay, reduceMotion])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: 'opacity 1.1s cubic-bezier(.22,.61,.36,1), transform 1.1s cubic-bezier(.22,.61,.36,1)',
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── PARALLAX HOOK ────────────────────────────────────────────────────────────
export const useParallax = (speed = 0.12) => {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = null
    const update = () => {
      raf = null
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh
      setOffset(progress * speed * vh)
    }
    const onScroll = () => { if (raf == null) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed])

  return [ref, offset]
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
export const SecLabel = ({ num, text, color = C.ghost, accent = C.latun, style }) => (
  <div style={{
    fontFamily: "'Onest', sans-serif",
    fontSize: 11, fontWeight: 500, letterSpacing: 3.5,
    textTransform: 'uppercase', color, marginBottom: 30,
    display: 'flex', alignItems: 'center', gap: 12, ...style,
  }}>
    <span style={{ color: accent }}>{num}</span>
    <span style={{ width: 22, height: 1, background: accent, opacity: 0.5 }} />
    <span>{text}</span>
  </div>
)

// ─── GOLD HAIRLINE ────────────────────────────────────────────────────────────
export const Hairline = ({ strength = 'soft', style }) => (
  <div style={{
    borderTop: `1px solid rgba(194,154,72,${strength === 'strong' ? 0.42 : strength === 'faint' ? 0.1 : 0.2})`,
    ...style,
  }} />
)

// ─── MEANDER RULE ─────────────────────────────────────────────────────────────
export const MeanderRule = ({ color = C.zoloto, opacity = 0.5, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, ...style }}>
    <div style={{ flex: 1, borderTop: `1px solid ${color}`, opacity: opacity * 0.5 }} />
    <svg width="78" height="12" viewBox="0 0 78 12" style={{ opacity, flexShrink: 0 }} fill="none" stroke={color} strokeWidth="1" aria-hidden="true">
      <path d="M1,11 V4 H8 V8 H5 V6 M14,11 V4 H21 V8 H18 V6 M27,11 V4 H34 V8 H31 V6 M40,11 V4 H47 V8 H44 V6 M53,11 V4 H60 V8 H57 V6 M66,11 V4 H73 V8 H70 V6" />
    </svg>
    <div style={{ flex: 1, borderTop: `1px solid ${color}`, opacity: opacity * 0.5 }} />
  </div>
)

// ─── FLOATING QUOTE (scroll-linked) ───────────────────────────────────────────
// Голоса участников прошлого потока. Просто текст, без карточки и рамки —
// всплывает снизу вверх по ходу скролла: пока анкер ещё ниже центра экрана,
// реплика мельче и смещена вниз, к центру наливается и уплотняется, нарочно
// наезжая на текст под ней, дальше — истончается и уходит выше. Если человек
// перестаёт скроллить, реплика гаснет, но прогресс не сбрасывается — стоит
// продолжить скролл, и она подхватывается с того же места.
export const QuoteRail = ({ text, author, side = 'left', top = 50 }) => {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)
  const [rise, setRise] = useState(40)
  const [idle, setIdle] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const idleTimer = useRef(null)

  // На узких экранах нет полей сбоку контента — цитата не прячется,
  // а центрируется и всплывает поверх текста, как и было задумано.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    setNarrow(mq.matches)
    const h = e => setNarrow(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  useEffect(() => {
    let raf = null
    const update = () => {
      raf = null
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      const signed = (rect.top + rect.height / 2) - vh / 2
      setProgress(Math.max(0, 1 - Math.abs(signed) / (vh * 0.95)))
      setRise(Math.max(-46, Math.min(46, signed * 0.14)))
    }
    const onScroll = () => {
      setIdle(false)
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setIdle(true), 1100)
      if (raf == null) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      clearTimeout(idleTimer.current)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const scale = 0.68 + progress * 0.6 // 0.68 → 1.28
  const baseOpacity = progress        // 0 → 1.0, полностью гаснет вдали от анкера
  const opacity = idle ? baseOpacity * 0.16 : baseOpacity

  // На узких экранах полей сбоку контента нет, а перекрывать текст здесь
  // ни к чему — вместо этого цитаты идут отдельным блоком напутствий
  // (см. QuoteList ниже). Overlay-механика — только на широких экранах.
  if (narrow) return null

  return (
    <div ref={ref} style={{ position: 'relative', height: 1 }}>
      <figure
        className="quote-rail"
        style={{
          position: 'fixed', top: `${top}%`, margin: 0, zIndex: 20, pointerEvents: 'none',
          [side]: 'clamp(6px, 2.6vw, 54px)', width: 'min(250px, 18vw)',
          textAlign: side === 'left' ? 'left' : 'right',
          opacity,
          transform: `translateY(calc(-50% + ${rise}px)) scale(${scale})`,
          transformOrigin: side === 'left' ? 'left center' : 'right center',
          transition: 'opacity 0.7s ease, transform 0.35s ease-out',
          willChange: 'transform, opacity',
        }}
      >
        <span aria-hidden="true" style={{
          display: 'block', fontFamily: "'Prata', serif", fontSize: 28, lineHeight: 0.6,
          color: C.zoloto, opacity: 0.65, marginBottom: 9,
          textShadow: '0 2px 10px rgba(0,0,0,0.7)',
        }}>{side === 'left' ? '“' : '”'}</span>
        <blockquote style={{
          margin: 0, fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 13.5,
          lineHeight: 1.55, color: C.kostYar,
          textShadow: '0 2px 14px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)',
        }}>{text}</blockquote>
        <figcaption style={{
          marginTop: 10, fontFamily: "'Onest', sans-serif", fontSize: 10, letterSpacing: 1,
          textTransform: 'uppercase', color: C.zoloto,
          textShadow: '0 2px 10px rgba(0,0,0,0.7)',
        }}>— {author}</figcaption>
      </figure>
    </div>
  )
}

// ─── QUOTE LIST (mobile) ──────────────────────────────────────────────────────
// На узких экранах QuoteRail ничего не рендерит — вместо всплывающей
// механики те же голоса участников идут горизонтальной каруселью, одна
// реплика в кадре, листается свайпом. Показывается только на мобиле через CSS.
// Точки внизу — навигация: показывают, где ты в ленте, и кликабельны.
export const QuoteList = ({ quotes, style }) => {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let raf = null
    const onScroll = () => {
      if (raf != null) return
      raf = requestAnimationFrame(() => {
        raf = null
        const i = Math.round(el.scrollLeft / el.clientWidth)
        setActive(Math.max(0, Math.min(quotes.length - 1, i)))
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => { el.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [quotes.length])

  const goTo = i => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div style={{ display: 'none', ...style }} className="quote-list-wrap">
      <div ref={trackRef} className="quote-list">
        {quotes.map(q => (
          <figure key={q.author} className="quote-list-item" style={{
            margin: 0, textAlign: 'center', flex: '0 0 100%',
            scrollSnapAlign: 'center', padding: '0 30px',
          }}>
            <blockquote style={{
              margin: 0, fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 15,
              lineHeight: 1.6, color: C.kostDim,
            }}>{q.text}</blockquote>
            <figcaption style={{
              marginTop: 10, fontFamily: "'Onest', sans-serif", fontSize: 10.5, letterSpacing: 1,
              textTransform: 'uppercase', color: C.zoloto,
            }}>— {q.author}</figcaption>
          </figure>
        ))}
      </div>
      <div className="quote-list-dots" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 22 }}>
        {quotes.map((q, i) => (
          <button
            key={q.author} type="button" onClick={() => goTo(i)}
            aria-label={`Отзыв ${i + 1} из ${quotes.length}`}
            style={{
              width: 7, height: 7, borderRadius: '50%', padding: 0, border: 'none',
              background: i === active ? C.zoloto : 'rgba(194,154,72,0.28)',
              cursor: 'pointer', transition: 'background 200ms ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── SCROLL HELPER ────────────────────────────────────────────────────────────
export const scrollTo = (id, offset = 64) => {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

// ─── SHARED BUTTON STYLES ─────────────────────────────────────────────────────
export const btnPrimary = {
  fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 1,
  textTransform: 'uppercase', padding: '14px 30px', borderRadius: 6,
  background: C.kost, color: '#0B0E0C', border: 'none', cursor: 'pointer',
  transition: 'background 220ms ease',
}

export const btnGhost = {
  fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: 1,
  textTransform: 'uppercase', padding: '14px 30px', borderRadius: 6,
  background: 'transparent', color: C.kostMuted,
  border: `1px solid ${C.frameDeep}`, cursor: 'pointer',
  transition: 'border-color 220ms ease, color 220ms ease',
}
