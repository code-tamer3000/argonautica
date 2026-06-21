import { useEffect, useRef, useState } from 'react'
import { C, MEDIA, scrollTo } from './Shared'

const NAV_ITEMS = [
  { id: 'about', label: 'О ЧЁМ' },
  { id: 'balance', label: 'БАЛАНС' },
  { id: 'karta', label: 'КАРТА' },
  { id: 'manifesto', label: 'МАНИФЕСТ' },
]

// ─── Music equalizer bars animation ──────────────────────────────────────────
const EqBars = ({ playing }) => (
  <svg width="16" height="14" viewBox="0 0 16 14" style={{ display: 'block' }}>
    {[0, 1, 2, 3].map((i) => {
      const heights = [6, 12, 8, 10]
      const delays = ['0s', '0.2s', '0.1s', '0.3s']
      const h = playing ? heights[i] : 3
      return (
        <rect
          key={i}
          x={i * 4}
          y={14 - h}
          width={2.5}
          height={h}
          rx={1}
          fill="currentColor"
          style={{
            transformOrigin: `${i * 4 + 1.25}px 14px`,
            animation: playing
              ? `eqBar 0.7s ease-in-out ${delays[i]} infinite alternate`
              : 'none',
            transition: 'height 0.3s ease, y 0.3s ease',
          }}
        />
      )
    })}
  </svg>
)

export default function Header({ activeSection }) {
  const [scrolled, setScrolled] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const h = e => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Autoplay on first valid user gesture (scroll is NOT a valid gesture for audio on mobile)
  useEffect(() => {
    const removeListeners = () => {
      window.removeEventListener('click', start)
      window.removeEventListener('touchend', start)
      window.removeEventListener('keydown', start)
    }
    const start = () => {
      const audio = audioRef.current
      if (!audio) return
      audio.volume = 0.55
      audio.play()
        .then(() => { setPlaying(true); removeListeners() })
        .catch(() => { }) // keep listeners alive if play was blocked
    }
    window.addEventListener('click', start, { passive: true })
    window.addEventListener('touchend', start, { passive: true })
    window.addEventListener('keydown', start)
    return removeListeners
  }, [])

  useEffect(() => {
    const show = setTimeout(() => setShowHint(true), 3000)
    const hide = setTimeout(() => setShowHint(false), 11000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  useEffect(() => { if (playing) setShowHint(false) }, [playing])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.volume = 0.55
      audio.play().then(() => setPlaying(true)).catch(() => { })
    }
  }

  return (
    <>
      {/* Глобальный стиль для eq-bar анимации */}
      <style>{`
        @keyframes eqBar {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1); }
        }
        @keyframes hintIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hintOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(10px); }
        }
      `}</style>

      <audio ref={audioRef} src="./media/music_web.m4a" loop preload="auto" />

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 clamp(20px,4vw,44px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(7,11,9,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(194,154,72,0.14)' : '1px solid transparent',
        transition: 'background 0.5s ease, border-color 0.5s ease',
      }}>
        {/* Logo */}
        <button onClick={() => scrollTo('hero', 0)} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 11,
        }}>
          <img
            src={MEDIA.monogram} alt="Аргонавтика"
            style={{ height: 26, width: 'auto', filter: 'invert(1)', display: 'block', opacity: 0.92 }}
          />
          <span style={{
            fontFamily: "'Prata', serif", fontSize: 12, letterSpacing: 3.5,
            textTransform: 'uppercase', color: C.kostDim,
          }}>Аргонавтика</span>
        </button>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 'clamp(12px,2vw,24px)', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'clamp(14px,2vw,26px)' }} className="hdr-links">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                  fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: 2.5,
                  textTransform: 'uppercase',
                  color: activeSection === item.id ? C.kostDim : C.ghost,
                  borderBottom: `1px solid ${activeSection === item.id ? 'rgba(194,154,72,0.5)' : 'transparent'}`,
                  transition: 'color 220ms ease, border-color 220ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.kostDim }}
                onMouseLeave={e => { e.currentTarget.style.color = activeSection === item.id ? C.kostDim : C.ghost }}
              >{item.label}</button>
            ))}
          </div>

          {/* Music toggle + hint */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={toggleMusic}
              title={playing ? 'Выключить музыку' : 'Включить музыку'}
              style={{
                background: 'none', border: '1px solid',
                borderColor: playing ? 'rgba(194,154,72,0.55)' : 'rgba(194,154,72,0.22)',
                borderRadius: 6, width: 36, height: 36, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: playing ? C.zolotoYar : C.stone,
                transition: 'color 280ms ease, border-color 280ms ease, background 280ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(194,154,72,0.6)'
                e.currentTarget.style.color = C.zoloto
                e.currentTarget.style.background = 'rgba(194,154,72,0.07)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = playing ? 'rgba(194,154,72,0.55)' : 'rgba(194,154,72,0.22)'
                e.currentTarget.style.color = playing ? C.zolotoYar : C.stone
                e.currentTarget.style.background = 'none'
              }}
            >
              <EqBars playing={playing} />
            </button>

            {showHint && !playing && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                whiteSpace: 'nowrap',
                background: 'rgba(7,11,9,0.82)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(194,154,72,0.2)',
                borderRadius: 6,
                padding: isMobile ? '5px 8px' : '7px 11px',
                pointerEvents: 'none',
                animation: 'hintIn 0.5s cubic-bezier(.22,.61,.36,1) forwards',
              }}>
                <div style={{
                  position: 'absolute', top: -5, right: 13,
                  width: 8, height: 8,
                  background: 'rgba(7,11,9,0.82)',
                  border: '1px solid rgba(194,154,72,0.2)',
                  borderRight: 'none', borderBottom: 'none',
                  transform: 'rotate(45deg)',
                }} />
                <span style={{
                  fontFamily: "'Lora', serif", fontStyle: 'italic',
                  fontSize: isMobile ? 9 : 11, color: C.ghost, letterSpacing: 0.3,
                }}>{isMobile ? 'нажми · для атмосферы' : 'нажми · для погружения в атмосферу'}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => scrollTo('expedition')}
            style={{
              background: C.zoloto, color: '#0B0E0C', border: 'none', borderRadius: 6,
              fontFamily: "'Onest', sans-serif", fontSize: 11.5, fontWeight: 600, letterSpacing: 1.5,
              textTransform: 'uppercase', padding: '9px 17px', cursor: 'pointer',
              transition: 'background 220ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.zolotoYar }}
            onMouseLeave={e => { e.currentTarget.style.background = C.zoloto }}
          >Записаться на борт</button>
        </nav>
      </header>
    </>
  )
}
