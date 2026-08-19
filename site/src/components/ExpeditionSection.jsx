import { useRef, useState } from 'react'
import { C, FadeSection, MeanderRule, MEDIA, QuoteRail, SecLabel, StarSpark } from './Shared'

// Кнопка ведёт в Telegram-канал Аргонавтики (тот же, что в футере)
const TG_CHANNEL = 'https://t.me/argonautica_systems'
const RULES_DOC = './pravila.html'

// Оставшиеся голоса прошлого потока (первые 6 — в PlatformSection), полный
// текст из карточек. Согласие на публикацию с ником получено
// (survey_responses.publish_consent).
export const FLOAT_QUOTES = [
  { side: 'left', top: 24, author: 'daria_epi', text: 'Довериться хотя бы раз этому подходу и дать себе шанс встать на этот путь. Не ожидать чуда, но проходить его с вниманием и честностью — тогда перемены обязательно придут.' },
  { side: 'right', top: 52, author: 'yakov', text: 'Если ты настрадался, наискался, наигрался в медитации, психологию, аффирмации, йогу и всё это... То пора отправляться в экспедицию и встретить своих чудовищ.' },
  { side: 'left', top: 80, author: 'ivanartomov', text: 'Вступайте на путь и, по-любому, это вас зацепит: будь то ключи, стихии или знания Аргата.' },
]

// Позиции — от дешёвой к дорогой. Открывается по умолчанию на «Игрок»
// (см. ниже DEFAULT_IDX).
const POSITIONS = [
  {
    id: 'nabludatel', name: 'Наблюдатель', price: '8 000 ₽', image: MEDIA.positionNabludatel, mobileFocus: '13% 20%',
    tagline: 'Один в каноэ.',
    format: 'Самостоятельная работа. Сдаёшь отчёт по Генному Замку — идёшь дальше.',
    efirs: 'Эфиры в записи.',
    details: 'Можешь пользоваться Материалами Платформы для самостоятельного прохождения. Без дополнительных заданий и без групповой динамики.',
    access: ['Минимальные функции Платформы.'],
    who: 'Результат зависит исключительно от твоей включённости.',
  },
  {
    id: 'igrok', name: 'Игрок', price: '16 000 ₽', image: MEDIA.positionIgrok, mobileFocus: '31% 50%',
    tagline: 'Экипаж. Основной корпус.',
    format: 'Полноценное движение в составе группы аргонавтов.',
    efirs: 'Живой Эфир по каждой Стихии.',
    details: 'Направление Навигаторами, ранее прошедшими Экспедицию. Динамика через геймифицированную платформу Аргонавтики: настройся на ежедневную включённость в течение 28 дней. Ежедневно вести Бортовой Журнал. Выполнять задания: групповые, личные, парные. Усиление командой — другими участниками. Личная каюта и общее пространство: видно, кто где идёт и что выгружает. Возможность общаться и усиливать друг друга. Партнёрства.',
    access: ['Возможность пользоваться всеми функциями Платформы.', 'Количество мест ограничено.'],
    who: 'Самооживленческая база.',
  },
  {
    id: 'specotryad', name: 'Спецотряд', price: '37 000 ₽', image: MEDIA.positionSpecotryad, mobileFocus: '57% 50%',
    tagline: 'Малый круг.',
    format: 'Мини-группа морских ассасинов с личным наставничеством Аргата.',
    efirs: 'Живой Эфир по каждой Стихии.',
    details: 'Движение происходит в небольшой группе, которую направляет Аргат. На каждой Стихии, кроме — дополнительный созвон группы. Задания от Аргата, уточнения по динамике, разборы Генных Замков. Приоритет в отбор Навигаторов.',
    access: ['Возможность пользоваться всеми функциями Платформы.', 'Группа до десяти человек.'],
    who: 'Сконцентрированное и усиленное ежедневное движение по самооживлению.',
  },
  {
    id: 'oko', name: 'Око', price: '150 000 ₽', image: MEDIA.positionOko,
    tagline: 'С глазу на глаз.',
    format: null,
    exclusive: [
      'Личное сопровождение Аргатом.',
      'Дополнительный созвон на каждой Стихии.',
      'Индивидуальные задания под твою ситуацию.',
      'Персональный разбор Генных Замков с учётом условий и динамики прохождения.',
    ],
    efirs: 'Живой Эфир по каждой Стихии.',
    details: null,
    access: ['Возможность пользоваться всеми функциями Платформы.', 'Одно место в потоке.'],
    who: 'Для развития живости, силы и точности Геркулеса.',
  },
]

// Дефолтная карточка при открытии поп-апа — «Игрок» (основной тариф)
const DEFAULT_IDX = POSITIONS.findIndex(p => p.id === 'igrok')

function PositionCard({ pos, dir = 1 }) {
  return (
    <div className={`position-card ${dir > 0 ? 'slide-in-right' : 'slide-in-left'}`} style={{
      position: 'relative', borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(194,154,72,0.28)',
    }}>
      {/* Фреска фоном на всю карточку — лёгкий блюр и затемнение под текст.
          На мобиле кроп сдвинут на фокус позиции (подобрано вручную в Figma) — на десктопе центр не трогаем. */}
      <img src={pos.image} alt="" aria-hidden="true" className="pc-bg-image" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        filter: 'blur(1px)', transform: 'scale(1.03) translateZ(0)', backfaceVisibility: 'hidden',
        '--mobile-focus': pos.mobileFocus || '50% 50%',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(6,9,8,0.5) 0%, rgba(6,9,8,0.74) 40%, rgba(6,9,8,0.92) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        padding: 'clamp(28px,3.4vw,40px) clamp(24px,3vw,34px)',
      }}>
        <h3 style={{
          fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 24,
          color: C.kostYar, margin: '0 0 8px', textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}>{pos.name}</h3>

        <div style={{
          fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 16, color: C.kostDim,
          marginBottom: 24, textShadow: '0 2px 10px rgba(0,0,0,0.6)',
        }}>{pos.tagline}</div>

        {pos.exclusive && (
          <ul style={{
            listStyle: 'none', margin: '0 0 16px', padding: 0, textAlign: 'left',
            display: 'flex', flexDirection: 'column', gap: 7,
          }}>
            {pos.exclusive.map((line, i) => (
              <li key={i} style={{
                fontFamily: "'Onest', sans-serif", fontSize: 13.5, lineHeight: 1.55, color: C.kost,
                display: 'flex', gap: 9,
              }}>
                <StarSpark size={22} style={{ marginTop: -2 }} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}

        {pos.format && (
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 14 }}>
            <StarSpark size={22} style={{ marginTop: -1, flexShrink: 0 }} />
            <p style={{ fontFamily: "'Onest', sans-serif", fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: C.kost, margin: 0, textAlign: 'left' }}>
              {pos.format}
            </p>
          </div>
        )}

        <div style={{
          display: 'flex', gap: 9, alignItems: 'flex-start',
          fontFamily: "'Onest', sans-serif", fontSize: 12.5, fontWeight: 600, letterSpacing: 0.4,
          color: C.zolotoYar, marginBottom: 14, textAlign: 'left',
        }}>
          <StarSpark size={22} style={{ marginTop: -4 }} />
          <span>{pos.efirs}</span>
        </div>

        {pos.details && (
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 16 }}>
            <StarSpark size={22} style={{ marginTop: 0, flexShrink: 0 }} />
            <p style={{ fontFamily: "'Onest', sans-serif", fontWeight: 400, fontSize: 13.5, lineHeight: 1.65, color: C.kost, margin: 0, textAlign: 'left' }}>
              {pos.details}
            </p>
          </div>
        )}

        <ul style={{
          listStyle: 'none', margin: '0 0 20px', padding: 0, textAlign: 'left',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {pos.access.map((line, i) => (
            <li key={i} style={{
              fontFamily: "'Onest', sans-serif", fontSize: 12.5, lineHeight: 1.5, color: C.kostDim,
              display: 'flex', gap: 9,
            }}>
              <StarSpark size={22} style={{ marginTop: -3 }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* «Who» и цена — внизу карточки, оба отдельным акцентом */}
        <div style={{ paddingTop: 20, borderTop: '1px solid rgba(194,154,72,0.3)' }}>
          <div style={{
            fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: 'italic', fontSize: 16, lineHeight: 1.5,
            color: C.zolotoYar, marginBottom: 14,
          }}>{pos.who}</div>
          <div style={{
            fontFamily: "'Onest', sans-serif", fontSize: 24, fontWeight: 700, color: C.zolotoYar,
          }}>{pos.price}</div>
        </div>
      </div>
    </div>
  )
}

// ─── ExpeditionSection ────────────────────────────────────────────────────────
export default function ExpeditionSection() {
  const [activeIdx, setActiveIdx] = useState(DEFAULT_IDX)
  const [dir, setDir] = useState(1) // направление последнего переключения — куда влетает карточка
  const active = POSITIONS[activeIdx]

  const goPrev = () => { setDir(-1); setActiveIdx(i => Math.max(0, i - 1)) } // влево — дешевле
  const goNext = () => { setDir(1); setActiveIdx(i => Math.min(POSITIONS.length - 1, i + 1)) } // вправо — дороже
  const goTo = i => { setDir(i > activeIdx ? 1 : -1); setActiveIdx(i) }

  // Свайп по карточке на тачскринах — та же навигация, что у стрелок/точек.
  const touchStart = useRef(null)
  const onTouchStart = e => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = e => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext(); else goPrev()
    }
  }

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

      <QuoteRail {...FLOAT_QUOTES[0]} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto' }}>
        <FadeSection><MeanderRule opacity={0.55} style={{ marginBottom: 44 }} /></FadeSection>

        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <FadeSection delay={80}>
            <SecLabel num="06" text="Экспедиция" color={C.latun} accent={C.zoloto} style={{ justifyContent: 'center' }} />
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
              letterSpacing: '-0.01em', margin: '0 auto 40px', maxWidth: '16ch',
            }}>
              Экспедиция «Искусство посылания{' '}
              <span style={{ color: C.zolotoYar }}>на&nbsp;Хер</span>»
            </h2>
          </FadeSection>

          {/* Интро — отдельный оформленный блок: длительность, суть, даты */}
          <FadeSection delay={280}>
            <div style={{
              textAlign: 'center', maxWidth: 560, margin: '0 auto 56px',
              padding: 'clamp(24px,3.2vw,34px)', borderRadius: 10,
              border: '1px solid rgba(194,154,72,0.18)',
              background: 'linear-gradient(160deg, rgba(194,154,72,0.06), rgba(194,154,72,0.01))',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
                {[
                  '6 эфиров.',
                  'Целенаправленное движение по самооживлению в течение 28 дней.',
                  'Входя на борт корабля Аргонавтов ты оставляешь старые роли.',
                ].map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                    <StarSpark size={26} style={{ marginTop: -4, flexShrink: 0 }} />
                    <span style={{
                      fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 16,
                      lineHeight: 1.5, color: C.kostYar,
                    }}>{line}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 'clamp(22px,3vw,28px)', paddingTop: 'clamp(22px,3vw,28px)',
                borderTop: '1px solid rgba(194,154,72,0.18)',
                display: 'inline-flex', gap: 12, alignItems: 'center',
                fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase', color: C.zolotoYar,
              }}>
                <span>Старт 1.09</span>
                <span style={{ width: 16, height: 1, background: C.zoloto, opacity: 0.5 }} />
                <span>Финиш 28.09</span>
              </div>
            </div>
          </FadeSection>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <FadeSection delay={320}>
            <h3 style={{
              fontFamily: "'Prata', serif", fontWeight: 400,
              fontSize: 'clamp(22px,3vw,32px)', lineHeight: 1.15, color: C.kostYar,
              letterSpacing: '-0.01em', margin: '0 auto 18px',
            }}>Четыре позиции прохождения</h3>
            <p style={{
              fontFamily: "'Onest', sans-serif", fontWeight: 400, fontSize: 14.5, lineHeight: 1.65,
              color: C.kostDim, margin: '0 auto 48px', maxWidth: 620,
            }}>
              Каждая Позиция это уровень включённости в жизнь.
              Внимание — самая дорогая валюта. Каждая позиция это более высокий объём
              внимания, уровень пропускной способности участника.
            </p>
          </FadeSection>
        </div>

        {/* Поп-ап позиций: одна карточка в кадре, по умолчанию «Игрок».
            Влево — дешевле, вправо — дороже. */}
        <FadeSection delay={360} y={16}>
          <div
            className="position-viewport" style={{ position: 'relative', maxWidth: 460, margin: '0 auto', width: '100%' }}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          >
            <button
              type="button" aria-label="Дешевле" className="position-arrow position-arrow-left"
              onClick={goPrev} disabled={activeIdx === 0}
            >‹</button>

            <PositionCard key={active.id} pos={active} dir={dir} />

            <button
              type="button" aria-label="Дороже" className="position-arrow position-arrow-right"
              onClick={goNext} disabled={activeIdx === POSITIONS.length - 1}
            >›</button>
          </div>

          <div className="position-dots" aria-hidden="true">
            {POSITIONS.map((p, i) => (
              <button
                key={p.id} type="button" onClick={() => goTo(i)}
                aria-label={p.name}
                style={{
                  width: i === activeIdx ? 18 : 6, height: 6, borderRadius: 3, padding: 0, border: 'none',
                  background: i === activeIdx ? C.zoloto : 'rgba(194,154,72,0.3)',
                  cursor: 'pointer', transition: 'width 260ms ease, background 260ms ease',
                }}
              />
            ))}
          </div>
        </FadeSection>

        <QuoteRail {...FLOAT_QUOTES[1]} />

        <FadeSection delay={560}>
          <div style={{
            maxWidth: 640, margin: '0 auto 40px', textAlign: 'center',
            fontFamily: "'Onest', sans-serif", fontSize: 12.5, lineHeight: 1.7, color: C.kostMuted,
          }}>
            Цена растёт по мере приближения к отплытию. Все детали по срокам и условиям —
            в{' '}
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
            }}>Позицию выберешь внутри — второй раз ничего заполнять не придётся.</p>
          </div>
        </FadeSection>
      </div>

      <QuoteRail {...FLOAT_QUOTES[2]} />
    </section>
  )
}
