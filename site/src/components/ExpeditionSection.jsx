import { C, FadeSection, MeanderRule, MEDIA, SecLabel } from './Shared'

// Кнопка ведёт в Telegram-канал Аргонавтики (тот же, что в футере)
const TG_CHANNEL = 'https://t.me/argonautica_systems'

// ─── ExpeditionSection ────────────────────────────────────────────────────────
export default function ExpeditionSection() {
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
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Prata', serif", fontSize: 'clamp(19px,2.4vw,24px)', color: C.kostYar,
              }}>Корабль аргонавтов уже отплыл и находится в экспедиции</div>
            </div>

            {/* О следующей экспедиции — объявление в Telegram-канале */}
            <div style={{
              marginTop: 'clamp(26px,3.5vw,36px)', paddingTop: 'clamp(26px,3.5vw,36px)',
              borderTop: '1px solid rgba(194,154,72,0.18)', textAlign: 'center',
            }}>
              <p style={{
                fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 14,
                lineHeight: 1.5, color: C.kostDim, margin: '0 auto 20px', maxWidth: 460,
              }}>О следующей экспедиции будет объявлено в Telegram-канале Аргонавтики</p>
              <a
                href={TG_CHANNEL}
                target="_blank" rel="noopener noreferrer"
                onClick={() => { try { window.ym && window.ym(110223480, 'reachGoal', 'bot_click') } catch (e) { } }}
                style={{
                  display: 'inline-block', fontFamily: "'Onest', sans-serif",
                  fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                  padding: '16px 40px', background: C.zoloto, color: '#0B0E0C',
                  borderRadius: 7, textDecoration: 'none', transition: 'background 220ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.zolotoYar }}
                onMouseLeave={e => { e.currentTarget.style.background = C.zoloto }}
              >Следить в Telegram →</a>
            </div>
          </div>
        </FadeSection>
      </div>
    </section>
  )
}
