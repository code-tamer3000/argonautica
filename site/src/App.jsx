import { useState, useEffect } from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ManifestoSection from './components/ManifestoSection'
import KartaSection from './components/KartaSection'
import ExpeditionSection from './components/ExpeditionSection'
import Footer from './components/Footer'

const SECTIONS = ['hero', 'about', 'manifesto', 'karta', 'expedition']

export default function App() {
  const [activeSection, setActiveSection] = useState('hero')

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
      <Header activeSection={activeSection} />
      <main>
        <HeroSection />
        <AboutSection />
        <ManifestoSection />
        <KartaSection />
        <ExpeditionSection />
      </main>
      <Footer />
    </div>
  )
}
