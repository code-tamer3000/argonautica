import { C, MEDIA, FadeSection, SecLabel, StarSpark, useParallax, scrollTo, btnPrimary } from './Shared'

// ─── SVG helpers ──────────────────────────────────────────────────────────────
const PravRays = () => {
  const rays = []
  const n = 26
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const x = 60 + t * 1080
    rays.push(
      <line key={i} x1="600" y1="-60" x2={x} y2="320"
        stroke="url(#pravRay)" strokeWidth={i % 2 ? 0.8 : 1.4} />
    )
  }
  return (
    <svg viewBox="0 0 1200 320" preserveAspectRatio="xMidYMin slice" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="pravRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.zolotoYar} stopOpacity="0.55" />
          <stop offset="100%" stopColor={C.zolotoYar} stopOpacity="0" />
        </linearGradient>
      </defs>
      {rays}
    </svg>
  )
}

const MountainVeil = ({ flip, opacity = 1 }) => (
  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true"
    style={{
      position: 'absolute', left: 0, right: 0, width: '100%', height: 'clamp(70px,9vw,120px)',
      transform: flip ? 'scaleY(-1)' : 'none', opacity, pointerEvents: 'none',
    }}>
    <path d="M0,120 L0,70 L80,84 L160,46 L250,78 L340,30 L430,70 L520,40 L610,80 L700,34 L790,72 L880,44 L980,78 L1080,52 L1160,82 L1200,60 L1200,120 Z"
      fill="#10070A" stroke="rgba(194,154,72,0.22)" strokeWidth="1" />
    <path d="M0,120 L0,96 L120,104 L230,80 L340,100 L450,72 L560,98 L680,76 L800,100 L920,82 L1040,102 L1160,86 L1200,100 L1200,120 Z"
      fill="#060406" opacity="0.92" />
  </svg>
)

const YavSun = ({ size = 'clamp(150px,22vw,250px)' }) => (
  <svg viewBox="-130 -130 260 260" aria-hidden="true"
    style={{ width: size, height: 'auto', aspectRatio: '1/1', display: 'block', flexShrink: 0 }}>
    <defs>
      <radialGradient id="yavCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E9D9A6" />
        <stop offset="34%" stopColor={C.zolotoYar} />
        <stop offset="68%" stopColor="#1E7A56" />
        <stop offset="100%" stopColor="#0E342E" />
      </radialGradient>
      <radialGradient id="yavGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={C.zolotoYar} stopOpacity="0.4" />
        <stop offset="100%" stopColor={C.zolotoYar} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle r="125" fill="url(#yavGlow)" />
    <circle r="108" fill="none" stroke={C.zoloto} strokeWidth="0.8" opacity="0.45" />
    <circle r="84" fill="none" stroke={C.zoloto} strokeWidth="1" opacity="0.7" />
    <circle r="58" fill="url(#yavCore)" />
    <circle r="58" fill="none" stroke={C.zolotoYar} strokeWidth="1.4" />
    <path d="M0,-13 C2,-4 4,-2 13,0 C4,2 2,4 0,13 C-2,4 -4,2 -13,0 C-4,-2 -2,-4 0,-13 Z" fill="#F4F1E9" />
  </svg>
)

const NavPortal = ({ w = 'clamp(180px,26vw,300px)' }) => (
  <svg viewBox="0 0 300 280" aria-hidden="true" style={{ width: w, height: 'auto', display: 'block' }}>
    <defs>
      <linearGradient id="navThresh" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={C.krov} stopOpacity="0.55" />
        <stop offset="55%" stopColor="#3a0d0a" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#050806" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M44,280 L44,134 A106,106 0 0 1 256,134 L256,280 Z" fill="url(#navThresh)" />
    <path d="M44,280 L44,134 A106,106 0 0 1 256,134 L256,280"
      fill="none" stroke={C.krovYar} strokeWidth="1.4" opacity="0.75" />
    <path d="M74,280 L74,150 A76,76 0 0 1 226,150 L226,280"
      fill="none" stroke={C.krov} strokeWidth="1" opacity="0.5" />
  </svg>
)

const ZoneLabel = ({ pos, name, sub, desc, color }) => (
  <div style={{ textAlign: 'center', position: 'relative', zIndex: 3, padding: '0 24px', maxWidth: 560 }}>
    <div style={{
      fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 600, letterSpacing: 4,
      textTransform: 'uppercase', color: C.ghost, marginBottom: 12,
    }}>{pos}</div>
    <div style={{
      fontFamily: "'Prata', serif", fontSize: 'clamp(34px,5.5vw,64px)', lineHeight: 1,
      color, letterSpacing: '0.02em', marginBottom: 14,
      textShadow: '0 2px 30px rgba(0,0,0,0.6)',
    }}>{name}</div>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 9,
      fontFamily: "'Onest', sans-serif", fontSize: 11.5, fontWeight: 500, letterSpacing: 2.5,
      textTransform: 'uppercase', color: C.kostMuted, marginBottom: 16,
    }}>
      <StarSpark size={8} color={color} />{sub}
    </div>
    <p style={{
      fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 'clamp(14.5px,1.6vw,17px)',
      lineHeight: 1.65, color: C.kostDim, margin: '0 auto', maxWidth: '34ch',
    }}>{desc}</p>
  </div>
)

// ─── SECTION ──────────────────────────────────────────────────────────────────
export default function KartaSection() {
  const [atmosRef, atmosOffset] = useParallax(0.08)

  return (
    <section id="karta" style={{
      background: C.bezdna, position: 'relative', overflow: 'hidden',
      padding: 'clamp(98px,12vw,172px) 0 clamp(90px,11vw,150px)',
      borderTop: '1px solid rgba(194,154,72,0.08)',
    }}>
      {/* Section head */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(22px,6vw,80px)' }}>
        <FadeSection>
          <SecLabel num="03" text="Карта миров" />
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(28px,3.6vw,46px)',
            lineHeight: 1.16, color: C.kostYar, maxWidth: '15ch', marginBottom: 20,
          }}>Три мира по вертикали.</h2>
          <p style={{
            fontFamily: "'Lora', serif", fontSize: 17.5, lineHeight: 1.78, color: C.kostDim, maxWidth: '52ch',
          }}>
            Карта собирает твоё внимание, чтобы ты дошёл. Путь идёт по оси: вниз — за самой
            большой силой, в точку баланса, и оттуда — наверх, в проявленность.
            Золотое Руно — твоё скрытое Естество, которое, загораясь, меняет всё.
          </p>
        </FadeSection>
      </div>

      {/* Full-bleed vertical World Map */}
      <FadeSection delay={120} y={28}>
        <div style={{
          position: 'relative', width: '100%', minHeight: '100svh',
          margin: 'clamp(48px,7vw,88px) 0 clamp(40px,6vw,72px)',
          overflow: 'hidden',
          borderTop: '1px solid rgba(194,154,72,0.14)',
          borderBottom: '1px solid rgba(194,154,72,0.14)',
          display: 'flex', flexDirection: 'column',
          background: C.tishina,
        }}>
          {/* Atmosphere bg */}
          <div ref={atmosRef} style={{
            position: 'absolute', inset: '-8% 0', zIndex: 0,
            backgroundImage: `url('${MEDIA.worldsMap}')`,
            backgroundSize: 'cover', backgroundPosition: 'center top',
            transform: `translateY(${atmosOffset}px) scale(1.06)`,
            opacity: 0.5,
          }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(194,154,72,0.16) 0%, rgba(11,16,14,0.42) 20%, rgba(11,16,14,0.22) 44%, rgba(11,16,14,0.5) 62%, rgba(142,32,24,0.42) 82%, rgba(5,7,6,0.94) 100%)',
          }} />

          {/* ПРАВЬ */}
          <div style={{
            position: 'relative', zIndex: 2, flex: '1 1 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '33svh', padding: 'clamp(40px,7vw,80px) 0',
          }}>
            <PravRays />
            <ZoneLabel pos="Верх" name="ПРАВЬ" sub="Сияние · Проявленность" color={C.zolotoYar}
              desc="Свет, из которого ты исходишь. Дело — в мир. Полупрозрачная, золотая высота." />
          </div>

          <div style={{ position: 'relative', zIndex: 2, height: 'clamp(70px,9vw,120px)' }}>
            <MountainVeil opacity={0.85} />
          </div>

          {/* ЯВЬ */}
          <div style={{
            position: 'relative', zIndex: 2, flex: '1 1 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(20px,3vw,34px)', minHeight: '34svh', padding: 'clamp(30px,5vw,60px) 0',
          }}>
            <YavSun />
            <ZoneLabel pos="Центр" name="ЯВЬ" sub="Точка баланса" color={C.zolotoYar}
              desc="Солнце на оси. Здесь держишь Баланс — между светом и тенью рождается энергия действия." />
          </div>

          <div style={{ position: 'relative', zIndex: 2, height: 'clamp(70px,9vw,120px)' }}>
            <MountainVeil flip opacity={0.9} />
          </div>

          {/* НАВЬ */}
          <div style={{
            position: 'relative', zIndex: 2, flex: '1 1 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            gap: 'clamp(18px,2.5vw,28px)', minHeight: '33svh', padding: 'clamp(40px,6vw,70px) 0 0',
          }}>
            <ZoneLabel pos="Низ" name="НАВЬ" sub="Глубина · Портал" color={C.krovYar}
              desc="Погружение за самой большой силой. Тьма — строительный материал, а не враг." />
            <NavPortal />
          </div>
        </div>
      </FadeSection>

      {/* Video slot */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(22px,6vw,80px) 0' }}>
        <FadeSection>
          <div style={{
            textAlign: 'center', fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 600,
            letterSpacing: 3.5, textTransform: 'uppercase', color: C.latun,
            marginBottom: 'clamp(28px,4vw,44px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <span style={{ width: 28, height: 1, background: C.latun, opacity: 0.4 }} />
            Короткое погружение с Аргатом
            <span style={{ width: 28, height: 1, background: C.latun, opacity: 0.4 }} />
          </div>
        </FadeSection>

        <FadeSection delay={120} y={22}>
          <div style={{
            position: 'relative', width: '100%', aspectRatio: '16/9', display: 'block',
            borderRadius: 10, overflow: 'hidden',
            background: 'radial-gradient(ellipse at center, #0E1411 0%, #060908 78%)',
            border: '1px solid rgba(194,154,72,0.28)',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6), 0 30px 80px rgba(0,0,0,0.4)',
          }}>
            <span style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 'clamp(58px,8vw,80px)', height: 'clamp(58px,8vw,80px)', borderRadius: '50%',
              border: `1.5px solid ${C.zoloto}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(194,154,72,0.22), inset 0 0 24px rgba(194,154,72,0.1)',
              background: 'rgba(11,16,14,0.4)',
            }}>
              <span style={{
                width: 0, height: 0, marginLeft: 5,
                borderTop: 'clamp(9px,1.2vw,12px) solid transparent',
                borderBottom: 'clamp(9px,1.2vw,12px) solid transparent',
                borderLeft: `clamp(15px,2vw,20px) solid ${C.zolotoYar}`,
              }} />
            </span>
            <span style={{
              position: 'absolute', bottom: 16, left: 18,
              fontFamily: "'Onest', sans-serif", fontSize: 10, letterSpacing: 2,
              textTransform: 'uppercase', color: C.stone,
            }}>Видео-слот · 16:9</span>
          </div>
        </FadeSection>

        <FadeSection delay={200}>
          <figcaption style={{ textAlign: 'center', marginTop: 'clamp(26px,4vw,40px)' }}>
            <p style={{
              fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(19px,2.3vw,27px)',
              lineHeight: 1.32, color: C.kostYar, margin: '0 auto 18px', maxWidth: '24ch',
            }}>Как работают генные замки.</p>
            <p style={{
              fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 'clamp(16px,1.9vw,20px)',
              lineHeight: 1.6, color: C.kostDim, margin: '0 auto', maxWidth: '30ch',
            }}>«Я есть свет. Я есть сам ключ — этим ключом отпираю тень.»</p>
          </figcaption>
        </FadeSection>
      </div>

      {/* CTA */}
      <FadeSection delay={120}>
        <div style={{ textAlign: 'center', marginTop: 'clamp(64px,9vw,110px)', padding: '0 24px' }}>
          <button
            onClick={() => scrollTo('expedition')}
            style={{ ...btnPrimary, background: C.zoloto, color: '#0B0E0C' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.zolotoYar }}
            onMouseLeave={e => { e.currentTarget.style.background = C.zoloto }}
          >Записаться на борт</button>
        </div>
      </FadeSection>
    </section>
  )
}
