import { useState, useEffect } from 'react'
import { C, MEDIA, scrollTo } from './Shared'

const NAV_ITEMS = [
  { id: 'about',     label: 'О ЧЁМ' },
  { id: 'manifesto', label: 'МАНИФЕСТ' },
  { id: 'karta',     label: 'КАРТА' },
]

export default function Header({ activeSection }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
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
      <nav style={{ display: 'flex', gap: 'clamp(16px,2.5vw,30px)', alignItems: 'center' }}>
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
  )
}
