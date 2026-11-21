import { useState } from 'react'
import { C, FadeSection, MeanderRule, MovementGlyph, SecLabel, StarSpark } from './Shared'
import { MapHint, WorldMap } from './WorldMap'

// ─── Дуга превращения — Путь Аргонавта · путь Славы ──────────────────────────
const ARC = [
  { stage: 'точка сейчас', k: 'Чужие сценарии', note: 'Фитобоярство' },
  { stage: 'I этап', k: 'Искусство посылания на хер', result: 'Своя опора', trans: 'от чужих сценариев к своей опоре' },
  { stage: 'II этап', k: 'Исчезнуть, чтобы появиться', result: 'Призвание', trans: 'от опоры к призванию' },
  { stage: 'III этап', k: 'Легендарность', result: 'Наследие', trans: 'от призвания к легендарности' },
]

// ─── Три мира — движения по вертикали ────────────────────────────────────────
const MOVES = [
  {
    glyph: 'yav', big: 'Внутрь', label: 'ЯВЬ', stage: 'I этап', color: C.kost,
    title: 'Искусство отсечения лишнего',
    desc: 'На первом этапе Аргонавтики мы знакомимся с алгоритмом «посылания на Хер» и превращаем его в физический инструмент, с этого момента позволяющий идти по жизни точно. На первом этапе Экспедиции мы отсекаем 4 главные матричные подключки, через которые утекает твоя энергия. Ты устанавливаешь прямой контакт с четырьмя стихиями — 4 строительными элементами, из которых строится вся материальная действительность. Находя силу и опору внутри, у тебя пропадает необходимость замещать свой Дух матричными суррогатами — начинают отваливаться лишние связи, привычки, действия, мнения других людей о тебе. Снятие четырёх блокировок освобождает большой объём жизненной силы, которая раньше уходила матрице — поэтому после прохождения первого этапа аргонавту требуется небольшой перерыв, направленный на то, чтобы сдержать и грамотно направить свой слишком интенсивный рост.',
  },
  {
    glyph: 'nav', big: 'Вглубь', label: 'НАВЬ', stage: 'II этап', color: C.krovYar,
    title: 'Исчезнуть, чтобы появиться',
    desc: 'Настоящее проявление — результат трансформации негатива. Пытаясь проявиться без глубокого нырка в свою силу, ты всегда будешь влезать в чужие маски. В мире, где всё кричит о том, что нужно быть проявленным и успешным, только смелый человек может сознательно сделать шаг в сторону от массовой истерии — к честному себе. Второй этап Экспедиции Аргонавтов называется «Исчезнуть, чтобы появиться». Это глубокая работа с негативом. Её задача — докопаться до сути: чем ты НА САМОМ ДЕЛЕ занимаешься, когда занимаешься чем угодно. Искомое, Золотое Руно, за которым отправляются в экспедицию аргонавты, — твоё уникальное Призвание. То, что кроме тебя не сможет сделать ни один человек на планете.',
    more: 'Доступ ко второму этапу открывается только после прохождения первого. Идти во второй этап сразу — опасно. Внутри лежит огромное сокровище — но и испытания там подобающие. У тебя должна сформироваться опора, и ты физически должен знать, как работает принцип отсечения лишнего. Сперва надо послать на хер основные затыки и обрести внутреннюю опору.',
  },
  {
    glyph: 'prav', big: 'Наверх', label: 'ПРАВЬ', stage: 'III этап', color: C.zoloto,
    title: 'Легендарность',
    desc: 'Путь Аргонавта — путь Славы. Третий этап Экспедиции Аргонавтов посвящён реализации своего Дела в мире. Это проявленность, чтобы обогатить мир найденным Призванием, найти своё племя и оставить след в истории — то, что будет жить с тобой и после тебя.',
    more: 'Все люди хотят сразу перейти к третьему этапу. Выйти в мир со звездой в руках, прославиться, оставить наследие. Но 99,9% оставляют крутиться Легендарность как идею в голове. Аргонавт же знает, что путь к Славе лежит через дно. Поэтому отбрасывает пустые фантазии и приступает к реализации своего потенциала в действительности. Путь аргонавта начинается с того, что есть — с момента, когда ты принимаешь неопровержимое внутреннее решение дойти до конца. На третий этап нельзя попасть сразу — это награда за преданность Пути.',
  },
]

// ─── Карточка мира: клик раскрывает дополнительный текст ──────────────────────
const MoveCard = ({ m, delay }) => {
  const [open, setOpen] = useState(false)
  const hasMore = !!m.more
  return (
    <FadeSection delay={delay} style={{ background: C.bezdna }}>
      <div
        onClick={hasMore ? () => setOpen(o => !o) : undefined}
        style={{
          padding: 'clamp(28px,4vw,40px) clamp(20px,3vw,34px)', height: '100%',
          cursor: hasMore ? 'pointer' : 'default',
        }}
      >
        <MovementGlyph kind={m.glyph} size={44} color={m.color} />
        <div style={{
          marginTop: 22, fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 600,
          letterSpacing: 2.5, textTransform: 'uppercase', color: m.color,
        }}>{m.stage}</div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: "'Prata', serif", fontSize: 'clamp(22px,2.6vw,30px)', color: C.kostYar }}>{m.big}</span>
          <span style={{ fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: m.color }}>{m.label}</span>
        </div>
        <div style={{
          fontFamily: "'Prata', serif", fontSize: 'clamp(16px,1.9vw,20px)', lineHeight: 1.3,
          color: C.kostYar, marginTop: 16,
        }}>{m.title}</div>
        <p style={{ fontFamily: "'Lora', serif", fontSize: 15, lineHeight: 1.7, color: C.kostMuted, marginTop: 12 }}>{m.desc}</p>

        {hasMore && (
          <div style={{
            display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
            transition: 'grid-template-rows 420ms cubic-bezier(.4,0,.2,1)',
          }}>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                fontFamily: "'Lora', serif", fontSize: 15, lineHeight: 1.7, color: C.kostDim,
                marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.frame}`,
              }}>{m.more}</p>
            </div>
          </div>
        )}

        {hasMore && (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
            style={{
              marginTop: 18, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 600, letterSpacing: 2,
              textTransform: 'uppercase', color: m.color,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            {open ? 'Свернуть' : 'Подробнее'}
            <span style={{
              fontSize: 14, lineHeight: 1, transform: open ? 'rotate(45deg)' : 'none',
              transition: 'transform 320ms ease', display: 'inline-block',
            }}>+</span>
          </button>
        )}
      </div>
    </FadeSection>
  )
}

export default function KartaSection() {

  return (
    <section id="karta" style={{
      background: C.bezdna, position: 'relative',
      padding: 'clamp(98px,12vw,172px) 0 clamp(90px,11vw,150px)',
      borderTop: '1px solid rgba(194,154,72,0.08)',
    }}>
      {/* Заголовок + описание (перед картой) */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(22px,6vw,80px)', marginBottom: 'clamp(48px,6vw,72px)' }}>
        <FadeSection>
          <SecLabel num="03" text="Карта миров" />
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(28px,3.6vw,46px)', lineHeight: 1.16, color: C.kostYar,
            letterSpacing: '-0.01em', maxWidth: '15ch', marginBottom: 18,
          }}>
            Карта <span style={{ color: C.zolotoYar }}>12&nbsp;мiров</span> Аргонавтики
          </h2>
          <p style={{
            fontFamily: "'Lora', serif", fontSize: 'clamp(16px,1.8vw,18.5px)', lineHeight: 1.7,
            color: C.kostDim, maxWidth: '46ch', marginBottom: 24,
          }}>
            Карта помогает держать твоё внимание, чтобы ты дошёл до&nbsp;конца.
          </p>
        </FadeSection>
        <FadeSection delay={100}>
          <p style={{
            fontFamily: "'Lora', serif",
            fontSize: 'clamp(16px,1.8vw,18.5px)', lineHeight: 1.78,
            color: C.kostDim, maxWidth: '64ch',
          }}>
            12&nbsp;мiров — это 12&nbsp;частотных диапазонов на&nbsp;пути
            аргонавта к&nbsp;Славе. Их не&nbsp;5, не&nbsp;7, не&nbsp;8. Именно 12&nbsp;запрограммированных
            Матрицей сфер жизни, каждый из&nbsp;которых аргонавт освобождает шаг за&nbsp;шагом. Оживая
            и&nbsp;укрепляясь в&nbsp;своём уникальном и&nbsp;неповторимом стиле жизни. Искусство посылания
            на&nbsp;Хер. Это основа и&nbsp;база, с&nbsp;которой начинается путь аргонавта к&nbsp;Славе.
            С&nbsp;самого начала мы&nbsp;попадаем в&nbsp;точку ноль, Хер&nbsp;— Точку Баланса, шаг
            за&nbsp;шагом расширяя её на&nbsp;12&nbsp;миров. Принести баланс в&nbsp;каждый мир — значит
            послать на&nbsp;Хер программу-искажение, через которую Матрица съедает твою энергию.
          </p>
        </FadeSection>
      </div>

      <FadeSection delay={80} y={20}>
        <MapHint />
        <WorldMap />
      </FadeSection>

      {/* Три мира — движения по вертикали */}
      <div style={{ maxWidth: 1080, margin: 'clamp(56px,8vw,96px) auto 0', padding: '0 clamp(22px,6vw,80px)' }}>
        <FadeSection delay={120}><MeanderRule style={{ marginBottom: 48 }} opacity={0.35} /></FadeSection>
        <div className="moves-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: C.frame, alignItems: 'stretch' }}>
          {MOVES.map((m, i) => (
            <MoveCard key={i} m={m} delay={140 + i * 120} />
          ))}
        </div>

        <FadeSection delay={200}>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 'clamp(16px,1.7vw,19px)',
            lineHeight: 1.65, color: C.kostDim, maxWidth: '44ch',
            margin: 'clamp(56px,8vw,90px) auto clamp(56px,8vw,96px)', textAlign: 'center',
          }}>
            Идти сразу наверх — духовная ловушка, так люди отлетают и влипают в сети
            эгрегоров.<br />Настоящая реализация происходит через углубление и проявление
            глубины в&nbsp;мир.
          </p>
        </FadeSection>

        {/* Дуга превращения — Путь Аргонавта · путь Славы */}
        <FadeSection delay={120}>
          <div style={{
            fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 500, letterSpacing: 3,
            textTransform: 'uppercase', color: C.ghost, marginBottom: 14,
          }}>Дуга превращения</div>
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(26px,3.6vw,44px)', lineHeight: 1.12, color: C.kostYar,
            letterSpacing: '-0.01em', marginBottom: 'clamp(38px,5vw,56px)',
          }}>
            Путь Аргонавта&nbsp;—{' '}
            <span style={{ color: C.zolotoYar, textShadow: '0 0 24px rgba(214,172,64,0.45)' }}>путь Славы</span>.
          </h2>
        </FadeSection>
        <FadeSection delay={180}>
          <div className="arc-row" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -15, left: '0%', right: '12.5%', height: 1,
              background: `linear-gradient(to right, ${C.stone}, ${C.zoloto})`, opacity: 0.55,
            }} />
            {ARC.map((a, i) => {
              const last = i === ARC.length - 1
              const accent = last ? C.zolotoYar : (i === 0 ? C.stone : C.latun)
              return (
                <div key={i} style={{ position: 'relative', paddingRight: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span
                      className={i === 0 ? undefined : 'arc-star'}
                      style={{
                        display: 'inline-flex', flexShrink: 0,
                        ...(i === 0 ? {} : { '--glow': accent, '--gb': `${6 + i * 3.5}px`, animationDelay: `${i * 0.5}s` }),
                      }}
                    >
                      <StarSpark size={last ? 18 : 14} style={{ opacity: last ? 1 : i === 0 ? 0.45 : 0.75 }} />
                    </span>
                    <span style={{
                      fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1.8,
                      textTransform: 'uppercase', color: accent,
                    }}>{a.stage}</span>
                  </div>
                  <div style={{
                    fontFamily: "'Prata', serif", fontSize: 'clamp(15px,1.7vw,20px)',
                    color: last ? C.zolotoYar : C.kost, marginBottom: 6, lineHeight: 1.25,
                  }}>{a.k}</div>
                  {a.note && (
                    <div style={{
                      fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 13.5,
                      color: C.kostMuted, marginBottom: 6,
                    }}>{a.note}</div>
                  )}
                  {a.result && (
                    <div style={{
                      fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1.2,
                      textTransform: 'uppercase', color: C.kostDim, marginTop: 8, marginBottom: 6,
                    }}>{a.result}</div>
                  )}
                  {a.trans && (
                    <div style={{
                      fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 13,
                      lineHeight: 1.4, color: C.ghost,
                    }}>{a.trans}</div>
                  )}
                </div>
              )
            })}
          </div>
        </FadeSection>
      </div>
    </section>
  )
}
