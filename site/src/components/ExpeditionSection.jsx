import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { C, MEDIA, FadeSection, SecLabel, StarSpark, MeanderRule, useParallax } from './Shared'

const SEND_URL = './send.php'

// ─── Step-2 popup: расскажи о себе ───────────────────────────────────────────
const AboutModal = ({ contact, honeypot, onClose, onSuccess }) => {
  const [about,   setAbout]   = useState('')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const submit = async () => {
    setLoading(true); setErr('')
    try {
      const res = await fetch(SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, about: about.trim(), website: honeypot }),
      })
      const data = await res.json()
      if (data.ok) { onSuccess(); onClose() }
      else          { setErr(data.error || 'Что-то пошло не так. Попробуй позже.') }
    } catch {
      setErr('Ошибка соединения. Попробуй позже.')
    }
    setLoading(false)
  }

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 520,
        background: C.tishina, borderRadius: 8,
        border: '1px solid rgba(194,154,72,0.22)',
        padding: 'clamp(28px,4vw,48px)',
        animation: 'modalIn 0.28s cubic-bezier(.22,.61,.36,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: C.latun, marginBottom: 10 }}>
              Заявка · шаг 2
            </div>
            <h3 style={{ fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(22px,2.8vw,32px)', color: C.kostYar, lineHeight: 1.2 }}>
              Расскажи о себе.
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ghost, fontSize: 18, lineHeight: 1, padding: '4px 8px', transition: 'color 200ms ease', fontFamily: 'monospace' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.kost }}
            onMouseLeave={e => { e.currentTarget.style.color = C.ghost }}
          >✕</button>
        </div>

        <p style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.65, color: C.kostMuted, marginBottom: 24 }}>
          Кто ты, в какой точке находишься, что хочешь изменить.
          Это помогает понять, готов ли ты к Экспедиции.
        </p>

        <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, color: C.stone, letterSpacing: 0.5, marginBottom: 14 }}>
          Контакт: <span style={{ color: C.kostMuted }}>{contact}</span>
        </div>

        <textarea
          value={about}
          onChange={e => setAbout(e.target.value)}
          placeholder="Расскажи о себе..."
          rows={5}
          autoFocus
          style={{
            width: '100%', fontFamily: "'Lora', serif", fontStyle: 'italic',
            fontSize: 15, color: C.kostDim, lineHeight: 1.6,
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${C.frameDeep}`, borderRadius: 6,
            padding: '14px 18px', outline: 'none', caretColor: C.zoloto,
            resize: 'vertical', marginBottom: 8,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.45)' }}
          onBlur={e => { e.currentTarget.style.borderColor = C.frameDeep }}
        />

        {err && <p style={{ fontFamily: "'Onest', sans-serif", fontSize: 11.5, color: C.krovYar, letterSpacing: 0.5, marginBottom: 12 }}>{err}</p>}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: '100%', fontFamily: "'Onest', sans-serif", fontSize: 12.5, fontWeight: 600,
            letterSpacing: 1, textTransform: 'uppercase', padding: '16px',
            background: loading ? C.latun : C.zoloto, color: '#0B0E0C',
            border: 'none', borderRadius: 6, cursor: loading ? 'default' : 'pointer',
            transition: 'background 220ms ease', marginBottom: 10,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.zolotoYar }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? C.latun : C.zoloto }}
        >{loading ? 'Отправка…' : 'Встать в строй первых'}</button>

        <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 10, letterSpacing: 1, color: C.stone, textAlign: 'center' }}>
          Заявка = предварительный отбор. Не гарантирует участия.
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── ExpeditionSection ────────────────────────────────────────────────────────
export default function ExpeditionSection() {
  const [contact,   setContact]   = useState('')
  const [honeypot,  setHoneypot]  = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [sent,      setSent]      = useState(false)
  const [glowRef,   glowOffset]   = useParallax(0.08)

  const handleNext = () => {
    if (!contact.trim()) return
    setModalOpen(true)
  }

  const handleKey = e => { if (e.key === 'Enter') handleNext() }

  return (
    <section id="expedition" style={{
      background: C.tishina, position: 'relative', overflow: 'hidden',
      padding: 'clamp(88px,12vw,160px) clamp(22px,6vw,80px)',
      borderTop: '1px solid rgba(194,154,72,0.16)',
    }}>
      {modalOpen && (
        <AboutModal
          contact={contact}
          honeypot={honeypot}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setSent(true)}
        />
      )}

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: 'min(900px, 90vw)', height: 600, zIndex: 0,
        background: 'radial-gradient(ellipse at center, rgba(194,154,72,0.10), transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <FadeSection><MeanderRule opacity={0.55} style={{ marginBottom: 44 }} /></FadeSection>

        <FadeSection delay={80}>
          <SecLabel num="04" text="Экспедиция" color={C.latun} accent={C.zoloto} style={{ justifyContent: 'center' }} />
        </FadeSection>

        <FadeSection delay={140} y={22}>
          <figure ref={glowRef} style={{
            margin: '0 auto 40px', width: 'clamp(260px,40vw,420px)',
            transform: `translateY(${glowOffset}px)`,
            filter: 'drop-shadow(0 0 70px rgba(194,154,72,0.22))',
          }}>
            <img src={MEDIA.argoBoat} alt="Арго — корабль"
              style={{ width: '100%', display: 'block', aspectRatio: '3/2', objectFit: 'contain' }} />
          </figure>
        </FadeSection>

        <FadeSection delay={220}>
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(30px,4.6vw,56px)', lineHeight: 1.1, color: C.kostYar,
            letterSpacing: '-0.01em', margin: '0 auto 30px', maxWidth: '14ch',
          }}>
            Экспедиция посылания{' '}
            <span style={{ color: C.zolotoYar }}>на&nbsp;хер</span>.
          </h2>
        </FadeSection>

        <FadeSection delay={300}>
          <p style={{
            fontFamily: "'Lora', serif", fontSize: 'clamp(16px,1.9vw,19px)', lineHeight: 1.78,
            color: C.kostDim, margin: '0 auto 18px', maxWidth: '50ch',
          }}>Герой встречает чудище и посылает его нахер.</p>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 17, lineHeight: 1.7,
            color: C.kostMuted, margin: '0 auto 48px', maxWidth: '40ch',
          }}>
            Оставь контакт — мы свяжемся и расскажем как попасть на борт.
          </p>
        </FadeSection>

        <FadeSection delay={380}>
          {sent ? (
            <div style={{
              maxWidth: 480, margin: '0 auto', padding: '40px 32px', borderRadius: 8,
              border: '1px solid rgba(194,154,72,0.4)',
              background: 'linear-gradient(160deg, rgba(194,154,72,0.08), rgba(194,154,72,0.01))',
            }}>
              <StarSpark size={20} color={C.zolotoYar} style={{ marginBottom: 18 }} />
              <div style={{ fontFamily: "'Prata', serif", fontSize: 22, color: C.kostYar, marginBottom: 10 }}>
                Заявка принята.
              </div>
              <div style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 15.5, color: C.kostMuted, lineHeight: 1.6 }}>
                Свяжемся, когда Экспедиция откроется. Ты — среди Первых.
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              {/* Honeypot: скрыто от людей, боты заполняют — на сервере блокируем */}
              <input
                type="text"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
              />
              <div className="exp-form" style={{ display: 'flex', gap: 0 }}>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="e-mail / telegram"
                  style={{
                    flex: 1, fontFamily: "'Onest', sans-serif", fontSize: 14, color: C.kostYar,
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${C.frameDeep}`, borderRight: 'none',
                    borderRadius: '6px 0 0 6px', padding: '15px 18px',
                    outline: 'none', caretColor: C.zoloto,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.55)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = C.frameDeep }}
                />
                <button
                  onClick={handleNext}
                  disabled={!contact.trim()}
                  style={{
                    fontFamily: "'Onest', sans-serif", fontSize: 12.5, fontWeight: 600, letterSpacing: 1,
                    textTransform: 'uppercase', padding: '15px 26px',
                    background: C.zoloto, color: '#0B0E0C',
                    border: 'none', borderRadius: '0 6px 6px 0', cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: 'background 220ms ease',
                    opacity: !contact.trim() ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (contact.trim()) e.currentTarget.style.background = C.zolotoYar }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.zoloto }}
                >Встать в строй</button>
              </div>
              <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 10.5, letterSpacing: 1, color: C.stone, marginTop: 12 }}>
                Заявка = предварительный отбор. Не гарантирует участия.
              </div>
            </div>
          )}
        </FadeSection>
      </div>
    </section>
  )
}
