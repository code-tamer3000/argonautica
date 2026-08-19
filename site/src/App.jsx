import { useState, useEffect } from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import BalanceSection from './components/BalanceSection'
import KartaSection from './components/KartaSection'
import PlatformSection from './components/PlatformSection'
import ExpeditionSection from './components/ExpeditionSection'
import Footer from './components/Footer'
import { WordMark, StarSpark, C } from './components/Shared'

const SECTIONS = ['hero', 'about', 'balance', 'karta', 'platform', 'expedition']

function SplashScreen({ fading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
      opacity: fading ? 0 : 1,
      transition: fading ? 'opacity 0.9s cubic-bezier(.4,0,.2,1)' : 'none',
      pointerEvents: fading ? 'none' : 'all',
    }}>
      <div style={{ animation: 'splashPulse 2.2s ease-in-out infinite' }}>
        <StarSpark size={38} style={{ animation: 'splashTwinkle 1.3s ease-in-out infinite' }} />
      </div>
      <WordMark size={15} color={C.kostDim} gap={10} withStar={false}
        style={{ letterSpacing: 6 }} />
      <div style={{
        marginTop: 8,
        width: 40, height: 1,
        background: `linear-gradient(90deg, transparent, ${C.zoloto}, transparent)`,
        animation: 'splashLine 2.2s ease-in-out infinite',
      }} />
    </div>
  )
}

export default function App() {
  const [activeSection, setActiveSection] = useState('hero')
  const [splashFading, setSplashFading] = useState(false)
  const [splashGone, setSplashGone] = useState(false)

  useEffect(() => {
    let videoOk = false, mapOk = false
    const hide = () => {
      setSplashFading(true)
      setTimeout(() => setSplashGone(true), 950)
    }
    const onVideo = () => { videoOk = true; if (mapOk) hide() }
    const onMap   = () => { mapOk   = true; if (videoOk) hide() }
    document.addEventListener('videoReady', onVideo, { once: true })
    document.addEventListener('mapReady',   onMap,   { once: true })
    const fallback = setTimeout(hide, 6000)
    return () => {
      document.removeEventListener('videoReady', onVideo)
      document.removeEventListener('mapReady',   onMap)
      clearTimeout(fallback)
    }
  }, [])

  useEffect(() => {
    const observers = SECTIONS.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.001, rootMargin: '-45% 0px -45% 0px' }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)

    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <div style={{ background: '#0B100E', minHeight: '100vh' }}>
      {!splashGone && <SplashScreen fading={splashFading} />}
      <Header activeSection={activeSection} />
      <main>
        <HeroSection />
        <AboutSection />
        <BalanceSection />
        <KartaSection />
        <PlatformSection />
        <ExpeditionSection />
      </main>
      <Footer />
    </div>
  )
}
