import { useEffect, useRef, useState } from 'react'
import { C, FadeSection, MeanderRule, MEDIA, QuoteRail, SecLabel, StarSpark } from './Shared'

// Кнопка ведёт в Telegram-канал Аргонавтики (тот же, что в футере)
const TG_CHANNEL = 'https://t.me/argonautica_systems'

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
// points — единый список буллетов карточки, строго по порядку: 1) формат
// позиции, 2) эфиры (без отдельного выделения — просто второй пункт),
// 3+) остальные детали, каждая своим пунктом, а не одним абзацем.
const POSITIONS = [
  {
    id: 'nabludatel', name: 'Наблюдатель', price: '8 000 ₽', image: MEDIA.positionNabludatel, mobileFocus: '13% 20%',
    tagline: 'Один в каноэ.',
    points: [
      'Самостоятельная работа. Сдаёшь отчёт по Генному Замку — идёшь дальше.',
      'Эфиры в записи.',
      'Можешь пользоваться Материалами Платформы для самостоятельного прохождения. Без дополнительных заданий и без групповой динамики.',
    ],
    access: ['Минимальные функции Платформы.'],
    who: 'Результат зависит исключительно от твоей включённости.',
  },
  {
    id: 'igrok', name: 'Игрок', price: '16 000 ₽', image: MEDIA.positionIgrok, mobileFocus: '31% 50%',
    tagline: 'Экипаж. Основной корпус.',
    points: [
      'Полноценное движение в составе группы аргонавтов.',
      'Живой Эфир по каждой Стихии.',
      'Направление Навигаторами, ранее прошедшими Экспедицию.',
      'Геймифицированная платформа Аргонавтики.',
      'Ежедневную включённость в течение 28 дней.',
      'Бортовой Журнал.',
      'Задания по самооживлению: групповые, личные, парные.',
      'Личная каюта и общее пространство: видно, кто где идёт и что выгружает.',
      'Усиление командой — другими участниками.',
      'Партнёрства.',
      'Возможность пользоваться всеми функциями Платформы.',
    ],
    access: ['Количество мест ограничено.'],
    who: 'Самооживленческая база.',
  },
  {
    id: 'specotryad', name: 'Спецотряд', price: '37 000 ₽', image: MEDIA.positionSpecotryad, mobileFocus: '57% 50%',
    tagline: 'Малый круг.',
    points: [
      'Мини-группа морских ассасинов с личным наставничеством Аргата.',
      'Живой Эфир по каждой Стихии.',
      'Движение происходит в небольшой группе, которую направляет Аргат.',
      'На каждой Стихии — дополнительный созвон группы.',
      'Задания от Аргата, уточнения по динамике, разборы Генных Замков.',
      'Приоритет в отбор Навигаторов.',
      'А также все возможности позиции «Игрок».',
      'Возможность пользоваться всеми функциями Платформы.',
    ],
    access: [],
    who: 'Сконцентрированное и усиленное ежедневное движение по самооживлению.',
  },
  {
    id: 'oko', name: 'Око', price: '150 000 ₽', image: MEDIA.positionOko,
    tagline: 'С глазу на глаз.',
    points: [
      'Дополнительный индивидуальный созвон на каждой Стихии.',
      'Живой Эфир по каждой Стихии.',
      'Персональные задания.',
      'Подробный разбор Генных Замков с учётом условий и динамики прохождения.',
      'Все возможности предыдущих позиций.',
      'Возможность пользоваться всеми функциями Платформы.',
      'Одно место в потоке.',
    ],
    access: [],
    who: 'Для развития живости, силы и точности Геркулеса.',
  },
]

// Дефолтная карточка при открытии поп-апа — «Игрок» (основной тариф)
const DEFAULT_IDX = POSITIONS.findIndex(p => p.id === 'igrok')

function PositionCard({ pos }) {
  return (
    <div className="position-card" style={{
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

        <ul style={{
          listStyle: 'none', margin: '0 0 20px', padding: 0, textAlign: 'left',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {pos.points.map((line, i) => (
            <li key={i} style={{
              fontFamily: "'Onest', sans-serif", fontSize: 13.5, lineHeight: 1.55, color: C.kost,
              display: 'flex', gap: 9,
            }}>
              <StarSpark size={22} style={{ marginTop: -2, flexShrink: 0 }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {pos.access.length > 0 && (
          <ul style={{
            listStyle: 'none', margin: '0 0 20px', padding: 0, textAlign: 'left',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {pos.access.map((line, i) => (
              <li key={i} style={{
                fontFamily: "'Onest', sans-serif", fontSize: 12.5, lineHeight: 1.5, color: C.kostDim,
              }}>
                {line}
              </li>
            ))}
          </ul>
        )}

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
  const trackRef = useRef(null)
  const trackWrapRef = useRef(null)
  const dragInfo = useRef(null)

  const EASE = 'transform 380ms cubic-bezier(.22,.61,.36,1)'

  // Трек двигаем напрямую через ref, а не через setState на transform/
  // transition в JSX — иначе на каждый touchmove (десятки раз в секунду)
  // перерендерилось бы всё дерево карточки с её blur-фильтром фрески и
  // текстом, и на слабых мобильных GPU это мигает/пропадает на кадр.
  // React знает только activeIdx — для точек и disabled на стрелках.
  const setTrackTransform = (px, animate) => {
    const track = trackRef.current
    if (!track) return
    track.style.transition = animate ? EASE : 'none'
    track.style.transform = `translate3d(${px}px, 0, 0)`
  }

  const goToIdx = idx => {
    const clamped = Math.max(0, Math.min(POSITIONS.length - 1, idx))
    setTrackTransform(-clamped * (trackWrapRef.current?.offsetWidth || 0), true)
    setActiveIdx(clamped)
  }
  const goPrev = () => goToIdx(activeIdx - 1) // влево — дешевле
  const goNext = () => goToIdx(activeIdx + 1) // вправо — дороже
  const goTo = i => goToIdx(i)

  useEffect(() => {
    setTrackTransform(-DEFAULT_IDX * (trackWrapRef.current?.offsetWidth || 0), false)
  }, [])

  // Пересчёт позиции трека при смене ширины окна — держим ссылку на актуальный
  // activeIdx, чтобы не переслушивать resize на каждое переключение карточки.
  const activeIdxRef = useRef(activeIdx)
  activeIdxRef.current = activeIdx
  useEffect(() => {
    const onResize = () => setTrackTransform(-activeIdxRef.current * (trackWrapRef.current?.offsetWidth || 0), false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Карточка тянется за пальцем в реальном времени, а не просто дискретно
  // щёлкает по свайпу — на отпускании либо доезжает до соседней, либо
  // пружинит назад.
  const onTouchStart = e => {
    const t = e.touches[0]
    dragInfo.current = {
      startX: t.clientX, startY: t.clientY,
      width: trackWrapRef.current?.offsetWidth || 1,
      axis: null, lastDx: 0,
    }
  }
  const onTouchMove = e => {
    const info = dragInfo.current
    if (!info) return
    const t = e.touches[0]
    const dx = t.clientX - info.startX
    const dy = t.clientY - info.startY
    if (info.axis == null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      info.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      // На iOS Safari blur-фильтр фрески в связке с transform, меняющимся
      // каждый кадр драга, мигает и дёргает (репейнт зафильтрованного слоя
      // конфликтует с композитингом) — на время активного горизонтального
      // драга снимаем фильтр классом, возвращаем на отпускании.
      if (info.axis === 'x') trackRef.current?.classList.add('dragging')
    }
    if (info.axis !== 'x') return
    // Лёгкое сопротивление на краях — тянуть можно, но с усилием
    const resisted = (activeIdx === 0 && dx > 0) || (activeIdx === POSITIONS.length - 1 && dx < 0)
      ? dx * 0.35 : dx
    info.lastDx = resisted
    setTrackTransform(-activeIdx * info.width + resisted, false)
  }
  const onTouchEnd = () => {
    const info = dragInfo.current
    dragInfo.current = null
    trackRef.current?.classList.remove('dragging')
    if (!info || info.axis !== 'x') { goToIdx(activeIdx); return }
    const threshold = info.width * 0.22
    if (info.lastDx <= -threshold) goToIdx(activeIdx + 1)
    else if (info.lastDx >= threshold) goToIdx(activeIdx - 1)
    else goToIdx(activeIdx)
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
                  'Доступ к Манифесту Аргонавтики.',
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

        {/* Карусель позиций: все 4 карточки в одном треке, по умолчанию
            «Игрок». Трек тянется за пальцем и доезжает/пружинит на отпускании —
            все карточки всегда в DOM, поэтому высота блока не скачет при
            переключении (не зависит от того, какая карточка сейчас в кадре). */}
        <FadeSection delay={360} y={16}>
          <div className="position-viewport" style={{ position: 'relative', maxWidth: 460, margin: '0 auto', width: '100%' }}>
            <button
              type="button" aria-label="Дешевле" className="position-arrow position-arrow-left"
              onClick={goPrev} disabled={activeIdx === 0}
            >‹</button>

            <div className="position-track-wrap" ref={trackWrapRef}>
              <div
                className="position-track" ref={trackRef}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
              >
                {POSITIONS.map(pos => (
                  <div key={pos.id} style={{ flex: '0 0 100%', minWidth: 0, padding: '0 8px', boxSizing: 'border-box' }}>
                    <PositionCard pos={pos} />
                  </div>
                ))}
              </div>
            </div>

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
            Цена растёт по мере приближения к отплытию. Все детали по срокам и условиям
            раскроем после одобрения заявки в telegram.
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
