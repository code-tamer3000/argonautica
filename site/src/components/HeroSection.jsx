import { useEffect, useRef, useState } from 'react'
import { btnGhost, btnPrimary, C, FadeSection, MEDIA, scrollTo } from './Shared'

// ─── Настройки видео ──────────────────────────────────────────────────────────
const VIDEO_SPEED = 1  // замедлить: 0.5 = вдвое медленнее, 0.25 = вчетверо

// ─── Video preload hint — fires as soon as component module loads ─────────────
const preloadLink = typeof document !== 'undefined' && (() => {
  const isMob = window.matchMedia('(hover: none)').matches
  const link = document.createElement('link')
  link.rel = 'preload'; link.as = 'video'
  link.href = isMob ? MEDIA.seaVideo : MEDIA.seaVideoDesk
  document.head.appendChild(link)
})()

// ─── Three scrolling wave layers ──────────────────────────────────────────────
const WaveOverlay = () => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
    pointerEvents: 'none', overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', bottom: 0, left: 0, width: '200%', height: 120,
      animation: 'waveScroll 11s linear infinite'
    }}>
      <svg width="100%" height="120" viewBox="0 0 2880 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,60 C160,20 320,100 480,60 C640,20 800,100 960,60
                 C1120,20 1280,100 1440,60 C1600,20 1760,100 1920,60
                 C2080,20 2240,100 2400,60 C2560,20 2720,100 2880,60
                 L2880,120 L0,120 Z" fill="rgba(14,52,46,0.62)" />
      </svg>
    </div>

    <div style={{
      position: 'absolute', bottom: 0, left: 0, width: '200%', height: 84,
      animation: 'waveScroll 7s linear infinite reverse'
    }}>
      <svg width="100%" height="84" viewBox="0 0 2880 84" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,42 C220,10 440,74 660,42 C880,10 1100,74 1320,42
                 C1540,10 1760,74 1980,42 C2200,10 2420,74 2640,42
                 C2760,10 2880,74 2880,42 L2880,84 L0,84 Z"
          fill="rgba(8,13,11,0.74)" />
      </svg>
    </div>

    <div style={{
      position: 'absolute', bottom: 0, left: 0, width: '200%', height: 52,
      animation: 'waveScroll 4.5s linear infinite'
    }}>
      <svg width="100%" height="52" viewBox="0 0 2880 52" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,26 C280,4 560,48 840,26 C1120,4 1400,48 1680,26
                 C1960,4 2240,48 2520,26 C2700,4 2880,48 2880,26
                 L2880,52 L0,52 Z" fill="rgba(5,8,7,0.90)" />
      </svg>
    </div>

    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 8,
      background: '#0B100E'
    }} />
  </div>
)

// ─── Gold shimmer — light on wave crests ─────────────────────────────────────
const SeaShimmer = () => (
  <div style={{
    position: 'absolute', inset: '20% 0 30% 0', zIndex: 2,
    background: 'radial-gradient(ellipse 60% 30% at 50% 50%, rgba(194,154,72,0.08), transparent 70%)',
    animation: 'seaShimmer 7s ease-in-out infinite',
    pointerEvents: 'none',
  }} />
)

// ─── HeroSection ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  const videoRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(hover: none)').matches : false
  )

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = VIDEO_SPEED
  }, [])

  return (
    <section id="hero" style={{
      position: 'relative', minHeight: '100svh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', background: C.tishina, paddingTop: 'clamp(56px,9vh,112px)',
    }}>
      {/* Sea video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={MEDIA.seaPoster}
        onCanPlay={() => document.dispatchEvent(new CustomEvent('videoReady'))}
        style={{
          position: 'absolute', inset: '-6% 0', zIndex: 0,
          width: '100%', height: '112%',
          objectFit: 'cover', objectPosition: 'center',
          filter: 'blur(0.8px)',
        }}
      >
        <source src={isMobile ? MEDIA.seaVideo : MEDIA.seaVideoDesk} type="video/mp4" />
      </video>

      {/* Тёмные края */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse 80% 70% at 50% 42%, rgba(11,16,14,0) 0%, rgba(8,12,10,0.50) 60%, rgba(5,7,6,0.90) 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(5,7,6,0.65) 0%, transparent 20%, transparent 55%, rgba(11,16,14,0.4) 80%)',
        pointerEvents: 'none',
      }} />
      {/* Тёмный центральный вуаль — контраст под текст */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'radial-gradient(ellipse 62% 52% at 50% 44%, rgba(5,7,6,0.55) 0%, rgba(5,7,6,0.22) 55%, transparent 80%)',
        pointerEvents: 'none',
      }} />

      <SeaShimmer />
      <WaveOverlay />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 4, textAlign: 'center', padding: '0 24px', maxWidth: 880 }}>
        <FadeSection delay={120} y={16}>
          <div style={{
            fontFamily: "'Onest', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 3,
            textTransform: 'uppercase', color: C.kostDim, margin: '0 auto 56px', maxWidth: '34ch',
            textShadow: '0 0 18px rgba(194,154,72,0.5), 0 0 40px rgba(194,154,72,0.2)',
          }}>
            СИСТЕМА ПРОЯВЛЕНИЯ ДЛЯ ЛЮДЕЙ С МИССИЕЙ
          </div>
        </FadeSection>

        <FadeSection delay={360} y={22}>
          <h1 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(40px, 7.5vw, 86px)', lineHeight: 1.04,
            color: C.kostYar, letterSpacing: '-0.01em',
            margin: '0 auto 42px', maxWidth: '13em',
            textShadow: '0 0 24px rgba(194,154,72,0.45), 0 0 60px rgba(194,154,72,0.2), 0 2px 8px rgba(0,0,0,0.4)',
          }}>
            Пиратская<br />экспедиция.
          </h1>
        </FadeSection>

        <FadeSection delay={620} y={18}>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic',
            fontSize: 'clamp(16px,2vw,20px)', lineHeight: 1.7,
            color: C.kostDim, margin: '0 auto 62px', maxWidth: 520,
            textShadow: '0 0 20px rgba(194,154,72,0.35), 0 1px 6px rgba(0,0,0,0.35)',
          }}>
            Аргонавты способны срезать углы и проходить сквозь стены системы.
          </p>
        </FadeSection>

        <FadeSection delay={860} y={14}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => scrollTo('manifesto')} style={btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.background = C.kostYar }}
              onMouseLeave={e => { e.currentTarget.style.background = C.kost }}
            >Читать Манифест</button>
            <button onClick={() => scrollTo('about')} style={btnGhost}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.5)'; e.currentTarget.style.color = C.kostDim }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.frameDeep; e.currentTarget.style.color = C.kostMuted }}
            >О чём это</button>
          </div>
        </FadeSection>
      </div>

    </section>
  )
}
