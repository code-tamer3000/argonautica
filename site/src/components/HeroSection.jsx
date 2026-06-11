import { useEffect, useRef } from 'react'
import { C, MEDIA, FadeSection, useParallax, scrollTo, btnPrimary, btnGhost } from './Shared'

// ─── SVG turbulence filter — animate baseFrequency via rAF ───────────────────
const SeaFilter = () => {
  const turbRef = useRef(null)

  useEffect(() => {
    let t = 0
    let raf
    const tick = () => {
      t += 0.0022
      if (turbRef.current) {
        const bx = (0.007 + Math.sin(t * 0.9)  * 0.004).toFixed(5)
        const by = (0.012 + Math.cos(t * 0.65) * 0.005).toFixed(5)
        turbRef.current.setAttribute('baseFrequency', `${bx} ${by}`)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="sea-filter" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="linearRGB">
          <feTurbulence
            ref={turbRef}
            type="turbulence"
            baseFrequency="0.007 0.012"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

// ─── Three scrolling wave layers ──────────────────────────────────────────────
// Each band is 200% wide so the translateX(-50%) loop is seamless.
const WaveOverlay = () => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
    pointerEvents: 'none', overflow: 'hidden',
  }}>
    {/* Wave 1 — back, slowest, teal */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0,
      width: '200%', height: 110,
      animation: 'waveScroll 22s linear infinite',
    }}>
      <svg width="100%" height="110" viewBox="0 0 2880 110" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,55 C160,18 320,92 480,55 C640,18 800,92 960,55
             C1120,18 1280,92 1440,55 C1600,18 1760,92 1920,55
             C2080,18 2240,92 2400,55 C2560,18 2720,92 2880,55
             L2880,110 L0,110 Z"
          fill="rgba(14,52,46,0.60)"
        />
      </svg>
    </div>

    {/* Wave 2 — mid, medium speed, reversed direction */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0,
      width: '200%', height: 80,
      animation: 'waveScroll 14s linear infinite reverse',
    }}>
      <svg width="100%" height="80" viewBox="0 0 2880 80" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,40 C220,8 440,72 660,40 C880,8 1100,72 1320,40
             C1540,8 1760,72 1980,40 C2200,8 2420,72 2640,40
             C2760,8 2880,72 2880,40
             L2880,80 L0,80 Z"
          fill="rgba(8,13,11,0.72)"
        />
      </svg>
    </div>

    {/* Wave 3 — front, fastest, almost black — hard edge at bottom */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0,
      width: '200%', height: 50,
      animation: 'waveScroll 9s linear infinite',
    }}>
      <svg width="100%" height="50" viewBox="0 0 2880 50" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,25 C280,4 560,46 840,25 C1120,4 1400,46 1680,25
             C1960,4 2240,46 2520,25 C2700,4 2880,46 2880,25
             L2880,50 L0,50 Z"
          fill="rgba(5,8,7,0.88)"
        />
      </svg>
    </div>

    {/* Solid base → blends into page background */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 10,
      background: '#0B100E',
    }} />
  </div>
)

// ─── Gold shimmer — simulates light catching wave crests ─────────────────────
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
  const [bgRef, bgOffset] = useParallax(0.18)

  return (
    <section id="hero" style={{
      position: 'relative', minHeight: '100svh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', background: C.tishina, paddingTop: 'clamp(56px,9vh,112px)',
    }}>
      <SeaFilter />

      {/* Sea photo — turbulence filter + parallax + opacity breathing */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute', inset: '-14% 0', zIndex: 0,
          backgroundImage: `url('${MEDIA.sea}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transform: `translateY(${bgOffset}px) scale(1.1)`,
          filter: 'url(#sea-filter)',
          animation: 'seaBreathe 8s ease-in-out infinite',
        }}
      />

      {/* Radial tone over sea */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse 80% 70% at 50% 42%, rgba(11,16,14,0) 0%, rgba(8,12,10,0.50) 60%, rgba(5,7,6,0.90) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top dark gradient (protects header) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(5,7,6,0.65) 0%, transparent 20%, transparent 55%, rgba(11,16,14,0.4) 80%)',
        pointerEvents: 'none',
      }} />

      {/* Gold shimmer on water surface */}
      <SeaShimmer />

      {/* Animated wave layers at the bottom */}
      <WaveOverlay />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 4, textAlign: 'center', padding: '0 24px', maxWidth: 880 }}>
        <FadeSection delay={120} y={16}>
          <div style={{
            fontFamily: "'Onest', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 3,
            textTransform: 'uppercase', color: C.kostDim,
            margin: '0 auto 56px', maxWidth: '34ch',
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
            textShadow: '0 2px 40px rgba(0,0,0,0.55)',
          }}>
            Пиратская<br />экспедиция.
          </h1>
        </FadeSection>

        <FadeSection delay={620} y={18}>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(16px,2vw,20px)', lineHeight: 1.7,
            color: C.kostDim, margin: '0 auto 62px', maxWidth: 520,
          }}>
            Аргонавты способны срезать углы и проходить сквозь стены системы.
          </p>
        </FadeSection>

        <FadeSection delay={860} y={14}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollTo('manifesto')}
              style={btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.background = C.kostYar }}
              onMouseLeave={e => { e.currentTarget.style.background = C.kost }}
            >Читать Манифест</button>
            <button
              onClick={() => scrollTo('about')}
              style={btnGhost}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.5)'; e.currentTarget.style.color = C.kostDim }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.frameDeep; e.currentTarget.style.color = C.kostMuted }}
            >О чём это</button>
          </div>
        </FadeSection>
      </div>

      {/* Scroll hint */}
      <FadeSection delay={1200} y={0} style={{ position: 'absolute', bottom: 48, left: 0, right: 0, zIndex: 5 }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          fontFamily: "'Onest', sans-serif", fontSize: 9.5, letterSpacing: 3.5,
          textTransform: 'uppercase', color: C.ghost,
        }}>
          <span>Спуститься</span>
          <span className="hero-arrow" style={{ fontSize: 14, lineHeight: 1 }}>↓</span>
        </div>
      </FadeSection>
    </section>
  )
}
