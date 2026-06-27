import { useEffect, useState } from 'react'
import { C, FadeSection, MeanderRule, MEDIA, SecLabel, StarSpark } from './Shared'

// Кнопка ведёт сразу в Telegram-бота (сейчас — тест-бот; для прода поменять на боевого).
const BOT_DEEPLINK = 'https://t.me/temka123test_bot?start=expedition'

// ─── Экспедиция — формат и программа ─────────────────────────────────────────
const EXP_FACTS_BASE = [
  ['Старт', '1 июля'],
  ['Длительность', '28 дней'],
]
const PRICE_NOTE = 'растёт каждый раз, когда Аргат ходит купаться'
const DEFAULT_PRICE = '9000 ₽'   // фолбэк, пока цена грузится с сервера

const EXP_PROGRAM = [
  '5 миров — 5 онлайн-встреч',
  'Тензор-расчёт твоей карты блокировок, разбор замков',
  'Задания, практики, ежедневная работа, обратная связь',
]

// ─── ExpeditionSection ────────────────────────────────────────────────────────
export default function ExpeditionSection() {
  const [price, setPrice] = useState(DEFAULT_PRICE)

  // Цена задаётся из Telegram (/price) и хранится на сервере
  useEffect(() => {
    fetch('./price.php', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d && d.price) setPrice(d.price) })
      .catch(() => { })
  }, [])

  const facts = [...EXP_FACTS_BASE, ['Стоимость', price, PRICE_NOTE]]

  return (
    <section id="expedition" style={{
      background: C.tishina, position: 'relative', overflow: 'hidden',
      padding: 'clamp(88px,12vw,160px) clamp(22px,6vw,80px)',
      borderTop: '1px solid rgba(194,154,72,0.16)',
    }}>
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
          <div className="exp-card" style={{
            textAlign: 'left', maxWidth: 660, margin: '0 auto',
            padding: 'clamp(24px,3.5vw,36px)', borderRadius: 10,
            border: '1px solid rgba(194,154,72,0.18)',
            background: 'linear-gradient(160deg, rgba(194,154,72,0.06), rgba(194,154,72,0.01))',
          }}>
            <div className="exp-details" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)',
            }}>
              {/* Формат */}
              <div>
                {facts.map(([k, v, note], i) => (
                  <div key={i} style={{ marginBottom: i === facts.length - 1 ? 0 : 18 }}>
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

            {/* Запись — кнопка ведёт сразу в бота */}
            <div style={{
              marginTop: 'clamp(26px,3.5vw,36px)', paddingTop: 'clamp(26px,3.5vw,36px)',
              borderTop: '1px solid rgba(194,154,72,0.18)', textAlign: 'center',
            }}>
              <a
                href={BOT_DEEPLINK}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-block', fontFamily: "'Onest', sans-serif",
                  fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                  padding: '16px 40px', background: C.zoloto, color: '#0B0E0C',
                  borderRadius: 7, textDecoration: 'none', transition: 'background 220ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.zolotoYar }}
                onMouseLeave={e => { e.currentTarget.style.background = C.zoloto }}
              >Записаться в Telegram →</a>
              <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 10.5, letterSpacing: 1, color: C.stone, marginTop: 14 }}>
                Откроется бот — расскажешь о себе, и мы свяжемся.
              </div>
            </div>
          </div>
        </FadeSection>
      </div>
    </section>
  )
}
