import { useState } from 'react'
import { C, MEDIA, FadeSection, SecLabel, StarSpark, MeanderRule, useParallax } from './Shared'

const SEND_URL = './send.php'

export default function ExpeditionSection() {
  const [contact, setContact] = useState('')
  const [about, setAbout] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [glowRef, glowOffset] = useParallax(0.08)

  const submit = async () => {
    const c = contact.trim()
    const a = about.trim()
    if (!c) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch(SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: c, about: a }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Что-то пошло не так. Попробуй позже.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Ошибка соединения. Попробуй позже.')
    }
  }

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) submit() }

  return (
    <section id="expedition" style={{
      background: C.tishina, position: 'relative', overflow: 'hidden',
      padding: 'clamp(88px,12vw,160px) clamp(22px,6vw,80px)',
      borderTop: '1px solid rgba(194,154,72,0.16)',
    }}>
      {/* Ambient gold light */}
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

        {/* Argo ship */}
        <FadeSection delay={140} y={22}>
          <figure
            ref={glowRef}
            style={{
              margin: '0 auto 40px', width: 'clamp(260px,40vw,420px)',
              transform: `translateY(${glowOffset}px)`,
              filter: 'drop-shadow(0 0 70px rgba(194,154,72,0.22))',
            }}
          >
            <img
              src={MEDIA.argoBoat} alt="Арго — корабль"
              style={{ width: '100%', display: 'block', aspectRatio: '3/2', objectFit: 'contain' }}
            />
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
          }}>
            Герой встречает чудище и посылает его нахер.
          </p>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 17, lineHeight: 1.7,
            color: C.kostMuted, margin: '0 auto 48px', maxWidth: '40ch',
          }}>
            Оставь заявку — кто ты и в какой точке находишься; мы свяжемся с тобой и
            сообщим как попасть на борт.
          </p>
        </FadeSection>

        <FadeSection delay={380}>
          {status === 'success' ? (
            /* ─── Success state ─── */
            <div style={{
              maxWidth: 480, margin: '0 auto', padding: '40px 32px', borderRadius: 8,
              border: '1px solid rgba(194,154,72,0.4)',
              background: 'linear-gradient(160deg, rgba(194,154,72,0.08), rgba(194,154,72,0.01))',
              boxShadow: 'inset 0 0 50px rgba(194,154,72,0.08)',
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
            /* ─── Form ─── */
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              {/* Contact */}
              <div className="exp-form" style={{ display: 'flex', gap: 0, marginBottom: 10 }}>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="e-mail / telegram"
                  disabled={status === 'loading'}
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
                  onClick={submit}
                  disabled={status === 'loading' || !contact.trim()}
                  style={{
                    fontFamily: "'Onest', sans-serif", fontSize: 12.5, fontWeight: 600, letterSpacing: 1,
                    textTransform: 'uppercase', padding: '15px 26px',
                    background: status === 'loading' ? C.latun : C.zoloto,
                    color: '#0B0E0C', border: 'none', borderRadius: '0 6px 6px 0',
                    cursor: status === 'loading' ? 'default' : 'pointer',
                    whiteSpace: 'nowrap', transition: 'background 220ms ease',
                    opacity: !contact.trim() ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (status !== 'loading' && contact.trim()) e.currentTarget.style.background = C.zolotoYar }}
                  onMouseLeave={e => { if (status !== 'loading') e.currentTarget.style.background = status === 'loading' ? C.latun : C.zoloto }}
                >
                  {status === 'loading' ? 'Отправка…' : 'Встать в строй'}
                </button>
              </div>

              {/* About — optional */}
              <textarea
                value={about}
                onChange={e => setAbout(e.target.value)}
                placeholder="Кто ты и в какой точке находишься (необязательно)"
                rows={3}
                disabled={status === 'loading'}
                style={{
                  width: '100%', fontFamily: "'Lora', serif", fontStyle: 'italic',
                  fontSize: 14, color: C.kostDim, lineHeight: 1.6,
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${C.frameDeep}`, borderRadius: 6,
                  padding: '12px 18px', outline: 'none', caretColor: C.zoloto,
                  resize: 'vertical', marginBottom: 10,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.35)' }}
                onBlur={e => { e.currentTarget.style.borderColor = C.frameDeep }}
              />

              {status === 'error' && (
                <p style={{
                  fontFamily: "'Onest', sans-serif", fontSize: 11.5, color: C.krovYar,
                  letterSpacing: 0.5, marginBottom: 10,
                }}>{errorMsg}</p>
              )}

              <div style={{
                fontFamily: "'Onest', sans-serif", fontSize: 10.5, letterSpacing: 1, color: C.stone,
              }}>Заявка = предварительный отбор. Не гарантирует участия.</div>
            </div>
          )}
        </FadeSection>
      </div>
    </section>
  )
}
