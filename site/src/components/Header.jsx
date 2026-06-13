import { useState, useEffect, useRef } from 'react'
import { C, MEDIA, scrollTo } from './Shared'

const NAV_ITEMS = [
  { id: 'about',     label: 'О ЧЁМ' },
  { id: 'manifesto', label: 'МАНИФЕСТ' },
  { id: 'karta',     label: 'КАРТА' },
]

// ─── Music equalizer bars animation ──────────────────────────────────────────
const EqBars = ({ playing }) => (
  <svg width="16" height="14" viewBox="0 0 16 14" style={{ display: 'block' }}>
    {[0, 1, 2, 3].map((i) => {
      const heights = [6, 12, 8, 10]
      const delays  = ['0s', '0.2s', '0.1s', '0.3s']
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
  const audioRef = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Autoplay on first valid user gesture (scroll is NOT a valid gesture for audio on mobile)
  useEffect(() => {
    const removeListeners = () => {
      window.removeEventListener('click',    start)
      window.removeEventListener('touchend', start)
      window.removeEventListener('keydown',  start)
    }
    const start = () => {
      const audio = audioRef.current
      if (!audio) return
      audio.volume = 0.55
      audio.play()
        .then(() => { setPlaying(true); removeListeners() })
        .catch(() => {}) // keep listeners alive if play was blocked
    }
    window.addEventListener('click',    start, { passive: true })
    window.addEventListener('touchend', start, { passive: true })
    window.addEventListener('keydown',  start)
    return removeListeners
  }, [])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.volume = 0.55
      audio.play().then(() => setPlaying(true)).catch(() => {})
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

          {/* Music toggle */}
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
              flexShrink: 0,
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
