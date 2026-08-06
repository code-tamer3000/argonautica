import { useEffect, useRef, useState } from 'react'
import { C, FadeSection, MeanderRule, MEDIA, SecLabel } from './Shared'

// Тарифы ведут в один и тот же Telegram-канал — сам тариф человек выбирает
// уже в боте. До готовности объединённого бота (ARG-61, блокирован Legal)
// это канал набора.
const TG_CHANNEL = 'https://t.me/argonautica_systems'
const RULES_DOC = './pravila.html'

const GLYPH = {
  earth: './media/glyphs/earth.png',
  water: './media/glyphs/water.png',
  fire: './media/glyphs/fire.png',
  air: './media/glyphs/air.png',
}

// Тёплые тона стихий (design_system/ui_kits/Glypsh) — едва заметное свечение
// за глифом, весь остальной акцент сайта остаётся золотым.
const GLOW = {
  earth: 'rgba(107,122,70,0.30)',
  water: 'rgba(35,90,104,0.32)',
  fire: 'rgba(180,71,42,0.30)',
  air: 'rgba(79,99,121,0.30)',
}

const TARIFFS = [
  {
    id: 'zemlya', glyph: 'earth', name: 'Земля', price: '10 000 ₽',
    tagline: 'Идёшь сам, в своём темпе',
    text: 'Базовый маршрут: 5 миров, тензор-расчёт твоей карты блокировок, задания и практики. Старт сразу после оплаты — в полностью собственном темпе.',
    included: [
      '5 миров — проходишь индивидуально',
      'Тензор-расчёт твоей карты блокировок',
      'Задания и практики в своём темпе',
    ],
    who: 'Для тех, кто ценит самостоятельность и собственный темп.',
  },
  {
    id: 'voda', glyph: 'water', name: 'Вода', price: '20 000 ₽',
    tagline: 'Идёшь с группой',
    text: 'Всё, что на Земле, вместе с командой: группа стартует одновременно, дневники открыты друг другу, куратор лично отвечает на каждое сданное задание.',
    included: [
      'Группа, которая идёт с тобой',
      'Ежедневная работа с обратной связью от куратора',
      'Открытые дневники и командные задания',
    ],
    who: 'Для тех, кому важны плечо рядом и общий ритм.',
  },
  {
    id: 'ogon', glyph: 'fire', name: 'Огонь', price: '40 000 ₽',
    tagline: 'Малый круг, автор внутри',
    text: 'Всё, что на Воде, в тесном кругу — группа 4–6 человек, где рядом с тобой сам Аргат, автор экспедиции.',
    included: [
      'Малая группа — 4–6 человек',
      'Аргат принимает участие в прохождении',
      'Плотный обмен через опыт каждого',
    ],
    who: 'Для тех, кто хочет тесный круг и личный обмен опытом.',
  },
  {
    id: 'vozduh', glyph: 'air', name: 'Воздух', price: '100 000 ₽',
    tagline: 'Только ты и автор',
    text: 'Всё содержание остальных тарифов в личном формате — весь маршрут один на один с Аргатом.',
    included: [
      'Полностью индивидуальный формат',
      'Темп и разбор строятся под тебя',
      'Прямой контакт с Аргатом на каждом этапе',
    ],
    who: 'Для тех, кто хочет идти в прямом диалоге один на один.',
  },
]

function TariffCard({ tariff, delay, cardRef }) {
  return (
    <FadeSection delay={delay} y={20}>
      <div ref={cardRef} className="tariff-card" style={{
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: 'clamp(26px,3vw,34px) clamp(20px,2.4vw,26px)', borderRadius: 12,
        border: '1px solid rgba(194,154,72,0.18)',
        background: 'linear-gradient(160deg, rgba(194,154,72,0.055), rgba(194,154,72,0.01))',
      }}>
        <div style={{ position: 'relative', width: 92, height: 92, marginBottom: 20 }}>
          <div style={{
            position: 'absolute', inset: -22, borderRadius: '50%',
            background: `radial-gradient(circle, ${GLOW[tariff.glyph]}, transparent 70%)`,
          }} />
          <img src={GLYPH[tariff.glyph]} alt="" aria-hidden="true"
            style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <h3 style={{ fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 23, color: C.kostYar, margin: '0 0 4px' }}>
          {tariff.name}
        </h3>
        <div style={{ fontFamily: "'Onest', sans-serif", fontSize: 17, fontWeight: 600, color: C.zolotoYar, marginBottom: 14 }}>
          {tariff.price}
        </div>

        <div style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 14.5, color: C.kostDim, marginBottom: 14 }}>
          {tariff.tagline}
        </div>

        <p style={{ fontFamily: "'Lora', serif", fontSize: 14.5, lineHeight: 1.65, color: C.kostDim, margin: '0 0 18px' }}>
          {tariff.text}
        </p>

        <ul style={{
          listStyle: 'none', margin: '0 0 18px', padding: 0, textAlign: 'left', width: '100%',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {tariff.included.map((line, i) => (
            <li key={i} style={{
              fontFamily: "'Onest', sans-serif", fontSize: 13, lineHeight: 1.5, color: C.kostMuted,
              display: 'flex', gap: 9,
            }}>
              <span style={{ color: C.zoloto, flexShrink: 0 }}>✦</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div style={{
          marginTop: 'auto', fontFamily: "'Onest', sans-serif", fontSize: 12.5, lineHeight: 1.55,
          color: C.kostMuted, paddingTop: 16, borderTop: '1px solid rgba(194,154,72,0.14)', width: '100%',
        }}>{tariff.who}</div>
      </div>
    </FadeSection>
  )
}

// ─── ExpeditionSection ────────────────────────────────────────────────────────
export default function ExpeditionSection() {
  const gridRef = useRef(null)
  const cardRefs = useRef([])
  const [activeIdx, setActiveIdx] = useState(0)

  // На мобиле карточки — горизонтальная карусель по одной в кадре; точки
  // снизу показывают, какая из четырёх сейчас открыта.
  useEffect(() => {
    const root = gridRef.current
    if (!root) return
    const ratios = new Array(TARIFFS.length).fill(0)
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = Number(entry.target.dataset.idx)
        ratios[idx] = entry.intersectionRatio
      })
      let best = 0
      ratios.forEach((r, i) => { if (r > ratios[best]) best = i })
      setActiveIdx(best)
    }, { root, threshold: [0, 0.25, 0.5, 0.75, 1] })
    cardRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto' }}>
        <FadeSection><MeanderRule opacity={0.55} style={{ marginBottom: 44 }} /></FadeSection>

        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <FadeSection delay={80}>
            <SecLabel num="05" text="Экспедиция" color={C.latun} accent={C.zoloto} style={{ justifyContent: 'center' }} />
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
              letterSpacing: '-0.01em', margin: '0 auto 22px', maxWidth: '16ch',
            }}>
              Экспедиция «Искусство посылания{' '}
              <span style={{ color: C.zolotoYar }}>на&nbsp;Хер</span>»
            </h2>
          </FadeSection>

          <FadeSection delay={280}>
            <p style={{
              fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 15,
              lineHeight: 1.65, color: C.kostDim, margin: '0 auto 56px', maxWidth: 520,
            }}>
              Маршрут один для всех. Тариф решает не что ты проходишь, а как —
              один или с командой, выбираешь сам.
            </p>
          </FadeSection>
        </div>

        <div className="tariff-viewport" style={{ position: 'relative' }}>
          <div className="tariff-grid" ref={gridRef} style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
            alignItems: 'stretch', marginBottom: 40,
          }}>
            {TARIFFS.map((t, i) => (
              <TariffCard
                key={t.id} tariff={t} delay={260 + i * 70}
                cardRef={el => { cardRefs.current[i] = el; if (el) el.dataset.idx = i }}
              />
            ))}
          </div>

          {/* Стрелки — только на мобиле, подсказка, что карточки листаются */}
          <button
            type="button" aria-label="Предыдущий тариф" className="tariff-arrow tariff-arrow-left"
            onClick={() => gridRef.current?.scrollBy({ left: -gridRef.current.clientWidth, behavior: 'smooth' })}
          >‹</button>
          <button
            type="button" aria-label="Следующий тариф" className="tariff-arrow tariff-arrow-right"
            onClick={() => gridRef.current?.scrollBy({ left: gridRef.current.clientWidth, behavior: 'smooth' })}
          >›</button>
        </div>

        <div className="tariff-dots" aria-hidden="true">
          {TARIFFS.map((t, i) => (
            <span
              key={t.id}
              style={{
                width: i === activeIdx ? 18 : 6, height: 6, borderRadius: 3,
                background: i === activeIdx ? C.zoloto : 'rgba(194,154,72,0.3)',
                transition: 'width 260ms ease, background 260ms ease',
              }}
            />
          ))}
        </div>

        <FadeSection delay={560}>
          <div style={{
            maxWidth: 640, margin: '0 auto 40px', textAlign: 'center',
            fontFamily: "'Onest', sans-serif", fontSize: 12.5, lineHeight: 1.7, color: C.kostMuted,
          }}>
            Земля начинается сразу после оплаты. Группы стартуют вместе — дату отплытия объявим
            в Telegram. Все детали по срокам и условиям — в{' '}
            <a href={RULES_DOC} target="_blank" rel="noopener noreferrer"
              style={{ color: C.kostDim, textDecoration: 'underline', textUnderlineOffset: 3 }}
            >правилах экспедиции</a>, бот расскажет о них ещё раз перед оплатой.
          </div>
        </FadeSection>

        <FadeSection delay={620}>
          <div style={{ textAlign: 'center' }}>
            <a
              href={TG_CHANNEL}
              target="_blank" rel="noopener noreferrer"
              onClick={() => { try { window.ym && window.ym(110223480, 'reachGoal', 'bot_click') } catch (e) { } }}
              style={{
                display: 'inline-block', fontFamily: "'Onest', sans-serif",
                fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                padding: '16px 44px', background: C.zoloto, color: '#0B0E0C',
                borderRadius: 7, textDecoration: 'none', transition: 'background 220ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.zolotoYar }}
              onMouseLeave={e => { e.currentTarget.style.background = C.zoloto }}
            >Записаться в Telegram →</a>
            <p style={{
              fontFamily: "'Onest', sans-serif", fontSize: 12, color: C.ghost,
              margin: '16px auto 0', maxWidth: 360,
            }}>Тариф выберешь внутри — второй раз ничего заполнять не придётся.</p>
          </div>
        </FadeSection>
      </div>
    </section>
  )
}
