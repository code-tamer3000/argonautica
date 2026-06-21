import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { C, MEDIA, FadeSection, SecLabel, StarSpark, MeanderRule } from './Shared'

const SEND_URL = './send.php'

// ─── Экспедиция — формат и программа ─────────────────────────────────────────
const EXP_FACTS = [
  ['Старт', '1 июля'],
  ['Длительность', '28 дней'],
  ['Стоимость', '9000 ₽', 'растёт каждый раз, когда Аргат ходит купаться'],
]

const EXP_PROGRAM = [
  '5 миров — 5 онлайн-встреч',
  'Тензор-расчёт твоей карты блокировок, разбор замков',
  'Задания, практики, ежедневная работа, обратная связь',
]

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
          <figure style={{
            margin: '0 auto 40px', width: 'clamp(240px,34vw,360px)',
            filter: 'drop-shadow(0 0 70px rgba(194,154,72,0.22))',
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(194,154,72,0.28)',
          }}>
            <img src={MEDIA.warrior} alt="Воин против Матрицы"
              style={{ width: '100%', display: 'block', aspectRatio: '3/4', objectFit: 'cover' }} />
          </figure>
        </FadeSection>

        <FadeSection delay={220}>
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(28px,4.2vw,50px)', lineHeight: 1.1, color: C.kostYar,
            letterSpacing: '-0.01em', margin: '0 auto 30px', maxWidth: '16ch',
          }}>
            Экспедиция «Искусство посылания{' '}
            <span style={{ color: C.zolotoYar }}>на&nbsp;Хер</span>»
          </h2>
        </FadeSection>

        <FadeSection delay={300}>
          <div className="exp-details" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)',
            textAlign: 'left', maxWidth: 660, margin: '0 auto clamp(36px,5vw,52px)',
            padding: 'clamp(24px,3.5vw,36px)', borderRadius: 10,
            border: '1px solid rgba(194,154,72,0.18)',
            background: 'linear-gradient(160deg, rgba(194,154,72,0.06), rgba(194,154,72,0.01))',
          }}>
            {/* Формат */}
            <div>
              {EXP_FACTS.map(([k, v, note], i) => (
                <div key={i} style={{ marginBottom: i === EXP_FACTS.length - 1 ? 0 : 18 }}>
                  <div style={{
                    fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2,
                    textTransform: 'uppercase', color: C.latun, marginBottom: 4,
                  }}>{k}</div>
                  <div style={{ fontFamily: "'Prata', serif", fontSize: 'clamp(17px,2vw,21px)', color: C.kostYar }}>{v}</div>
                  {note && (
                    <div style={{
                      fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 12.5,
                      lineHeight: 1.4, color: C.stone, marginTop: 4,
                    }}>{note}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Что внутри */}
            <div>
              {EXP_PROGRAM.map((line, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  marginBottom: i === EXP_PROGRAM.length - 1 ? 0 : 14,
                }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', flexShrink: 0,
                    height: '1.55em', fontSize: 'clamp(14.5px,1.7vw,16px)',
                  }}><StarSpark size={7} color={C.latun} /></span>
                  <span style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(14.5px,1.7vw,16px)', lineHeight: 1.55, color: C.kostDim }}>{line}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 17, lineHeight: 1.7,
            color: C.kostMuted, margin: '0 auto 32px', maxWidth: '40ch',
          }}>
            Оставь контакт — мы свяжемся и расскажем, как попасть на борт.
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
                >Записаться</button>
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
