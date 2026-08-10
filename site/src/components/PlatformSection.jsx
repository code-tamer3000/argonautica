import { useEffect, useState } from 'react'
import { C, FadeSection, MeanderRule, MEDIA, SecLabel, QuoteRail, QuoteList } from './Shared'

// label — крупный заголовок ряда (название раздела платформы).
// lead — короткая строка-подводка перед абзацем (раньше была заголовком).
const SCREENS = [
  {
    id: 'rubka',
    imgLight: MEDIA.platformRubkaLight,
    imgDark: MEDIA.platformRubkaDark,
    label: 'Рубка',
    lead: 'Вся динамика происходит внутри',
    text: 'Что там? Входи и узнаешь.',
  },
  {
    id: 'tasks',
    img: MEDIA.platformTasksLight,
    label: 'Задачи',
    lead: 'Путь Славы к своей Миссии',
    text: 'Геймификация. Ты — проснувшийся игрок. На пути появляются точные и чёткие задачи, способствующие твоему индивидуальному освобождению.',
  },
  {
    id: 'genes',
    img: MEDIA.platformGenesDark,
    label: 'Генные Замки',
    lead: 'На каждом этапе Аргонавт встречается с боссом',
    text: 'Это чудище охраняет твой персональный Замок, за которым заперта твоя сила. Аргонавт не пользуется готовыми матричными расчётами, подсовывающими человеку полуправду о себе, и зрит в корень.',
  },
  {
    id: 'knowledge',
    img: MEDIA.platformKnowledgeLight,
    label: 'База знаний',
    lead: 'Всё пройденное остаётся с тобой',
    text: 'Записи эфиров, разборы, практики — ничего не теряется в чате и не смывается лентой. Доступ к материалам сохраняется в удобном формате.',
  },
]

// Голоса прошлого потока — полный текст из карточек, согласие на публикацию
// с ником получено (survey_responses.publish_consent). На широких экранах
// всплывают у полей текста (QuoteRail), на узких — свайпаются одной лентой
// внизу (QuoteList) — те же данные, без side/top.
const FLOAT_QUOTES = [
  { side: 'left', top: 42, author: 'VeraaTara', text: 'Когда идёшь в плавание, отпусти весь свой накопленный опыт и знания и доверься капитану. За 25 лет плавания в одиночку я получила потрясающий опыт и взглянула на себя совершенно с другого ракурса. Классно быть той, кого ведут.' },
  { side: 'right', top: 40, author: 'Trubadur_pro', text: 'Смело вступайте на борт, оставив за ним всё, что устарело и требует уничтожения. Держите нос по ветру, ищите опору и с отвагой отсекайте всем чудищам головы)' },
  { side: 'left', top: 62, author: 'Seda_psy', text: 'Я бы сказала так — если не готовы менять что-то в реале, не стоит идти в командную игру. Тут не про теорию, тут про действия.' },
  { side: 'right', top: 74, author: 'a_bublii', text: 'Отправляйтесь в экспедицию даже если есть сомнения и непонятно чего ждать, походу дела разберётесь и поймёте, для чего это вам.' },
  { side: 'left', top: 45, author: 'DorogovaG', text: 'Никогда не вставайте на путь Аргонавта, ибо растеряете значимость, важность, серьёзность, деловитость. И станете живым человеком. А значит — простым и смертным. Оно вам надо?' },
  { side: 'right', top: 46, author: 'theodoreocampo', text: 'Живое учение не даст тебе чётких инструкций по прохождению сценария и гарантий безопасности. На корабле — команда, но у каждого своя история. Открыться потоку стихий — это возможность заглянуть прежде всего в себя и узреть внутри самого страшного врага. Не забывай, что встать на путь Аргонавта — это про быть готовым отсечь всё лишнее через личные страхи, боль и неприятности лишь для того, чтобы вернуться к собственному началу.' },
]

const SWIPE_QUOTES = FLOAT_QUOTES.map(({ author, text }) => ({ author, text }))

// Скрин экрана платформы. Переключатель темы — только у самого первого
// (Рубка); у остальных один фиксированный скрин без кнопки. Подсказка про
// переключение гаснет через пару секунд.
function ScreenFigure({ screen, hasToggle, showHint }) {
  const [dark, setDark] = useState(true)
  const [hintVisible, setHintVisible] = useState(showHint)
  const src = hasToggle ? (dark ? screen.imgDark : screen.imgLight) : screen.img

  useEffect(() => {
    if (!showHint) return
    const t = setTimeout(() => setHintVisible(false), 2600)
    return () => clearTimeout(t)
  }, [showHint])

  return (
    <figure style={{
      margin: 0, position: 'relative', borderRadius: 10, overflow: 'hidden',
      border: '1px solid rgba(194,154,72,0.22)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
    }}>
      <img src={src} alt={screen.label} style={{ width: '100%', display: 'block' }} />
      {hasToggle && (
        <button
          type="button"
          onClick={() => { setDark(v => !v); setHintVisible(false) }}
          aria-label="Переключить тему скриншота"
          style={{
            position: 'absolute', top: 12, right: 12,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 20,
            border: '1px solid rgba(194,154,72,0.4)',
            background: 'rgba(11,16,14,0.72)', backdropFilter: 'blur(4px)',
            color: C.zolotoYar, cursor: 'pointer',
            fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 600,
            letterSpacing: 1, textTransform: 'uppercase',
            transition: 'border-color 200ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.zolotoYar }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.4)' }}
        >{dark ? '☾ Тёмная' : '☀ Светлая'}</button>
      )}
      {hasToggle && showHint && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          transform: `translateX(calc(-100% - 12px))`,
          padding: '7px 12px', borderRadius: 20, whiteSpace: 'nowrap',
          border: '1px solid rgba(194,154,72,0.32)',
          background: 'rgba(11,16,14,0.86)',
          color: C.kostDim, fontFamily: "'Onest', sans-serif", fontSize: 11.5,
          opacity: hintVisible ? 1 : 0, pointerEvents: 'none',
          transition: 'opacity 500ms ease',
        }}>нажми — переключить тему</div>
      )}
    </figure>
  )
}

function ScreenRow({ screen, reverse, delay, hasToggle, showHint }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(28px,4vw,64px)',
      alignItems: 'center', direction: reverse ? 'rtl' : 'ltr',
    }} className="platform-row">
      <FadeSection delay={delay} y={26} style={{ direction: 'ltr' }}>
        <ScreenFigure screen={screen} hasToggle={hasToggle} showHint={showHint} />
      </FadeSection>

      <FadeSection delay={delay + 80} y={20} style={{ direction: 'ltr' }}>
        <h3 style={{
          fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(22px,2.6vw,29px)',
          color: C.kostYar, lineHeight: 1.2, margin: '0 0 10px',
        }}>{screen.label}</h3>
        <div style={{
          fontFamily: "'Onest', sans-serif", fontSize: 13, fontWeight: 500,
          color: C.zoloto, marginBottom: 14, lineHeight: 1.4,
        }}>{screen.lead}</div>
        <p style={{
          fontFamily: "'Lora', serif", fontSize: 15, lineHeight: 1.7, color: C.kostDim, margin: 0,
        }}>{screen.text}</p>
      </FadeSection>
    </div>
  )
}

export default function PlatformSection() {
  return (
    <section id="platform" style={{
      background: C.bezdna, position: 'relative', overflow: 'hidden',
      padding: 'clamp(88px,12vw,160px) clamp(22px,6vw,80px)',
      borderTop: '1px solid rgba(194,154,72,0.16)',
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '-8%', width: 420, height: 420, zIndex: 0,
        background: 'radial-gradient(circle, rgba(19,78,69,0.28), transparent 68%)',
        pointerEvents: 'none',
      }} />

      <QuoteRail {...FLOAT_QUOTES[0]} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto' }}>
        <FadeSection><MeanderRule opacity={0.5} style={{ marginBottom: 44 }} /></FadeSection>

        <div style={{ maxWidth: 680, margin: '0 auto 70px', textAlign: 'center' }}>
          <FadeSection delay={80}>
            <SecLabel num="04" text="Платформа" style={{ justifyContent: 'center' }} />
          </FadeSection>
          <FadeSection delay={140} y={22}>
            <h2 style={{
              fontFamily: "'Prata', serif", fontWeight: 400,
              fontSize: 'clamp(23px,3vw,34px)', lineHeight: 1.2, color: C.kostYar,
              letterSpacing: '-0.01em', margin: '0 0 20px',
            }}>Личное пространство, свободное от матричных уловок</h2>
          </FadeSection>
          <FadeSection delay={200}>
            <div style={{
              fontFamily: "'Lora', serif", fontSize: 15,
              lineHeight: 1.75, color: C.kostDim, textAlign: 'left',
            }}>
              <p style={{ margin: '0 0 16px' }}>
                Экспедиция проходит на закрытой Платформе Аргонавтов. Рабочая Платформа создана
                специально под задачи Аргонавтики. Там растёт твой заряд и там нет ничего лишнего.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                Это одновременно и игровая площадка, и алхимический тигель, в который ты
                попадаешь для выковки Духа.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                Нам было важно выйти из телеграм-среды, в которой сейчас проводится большинство
                мероприятий — чтобы выключить неизбежные автоматические отвлечения и мешанину.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                Альтернативные варианты вроде универсальных площадок для проведения курсов так
                же отошли в сторону из-за своей перегруженности, неповоротливости и царящего
                там фитобоярского духа.
              </p>
              <p style={{ margin: '0 0 16px', fontStyle: 'italic' }}>
                Платформа Аргонавтики заточена под <strong style={{ color: C.zolotoYar, fontStyle: 'normal' }}>Действие</strong>.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                Ты не просто размышляешь и получаешь знание. Платформа — это своего рода
                коннектор, связывающий твоё сознание и реальную жизнь. Платформа не принимает
                неживые ответы. Что это значит?
              </p>
              <p style={{ margin: 0 }}>
                Мы не будем это объяснять. Молча улыбнёмся и скажем, что «это магия».
              </p>
            </div>
          </FadeSection>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(56px,8vw,96px)' }}>
          <ScreenRow screen={SCREENS[0]} delay={220} hasToggle showHint />
          <QuoteRail {...FLOAT_QUOTES[1]} />

          <ScreenRow screen={SCREENS[1]} reverse delay={220} />
          <QuoteRail {...FLOAT_QUOTES[2]} />

          <ScreenRow screen={SCREENS[2]} delay={220} />
          <QuoteRail {...FLOAT_QUOTES[3]} />
          <QuoteRail {...FLOAT_QUOTES[4]} />

          <ScreenRow screen={SCREENS[3]} reverse delay={220} />
        </div>

        <FadeSection delay={280}>
          <div style={{ maxWidth: 680, margin: '80px auto 0', textAlign: 'center' }}>
            <figure style={{
              margin: '0 auto 28px', width: 'min(260px, 60vw)', borderRadius: 16,
              overflow: 'hidden', aspectRatio: '9 / 18.4',
              border: '1px solid rgba(194,154,72,0.22)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            }}>
              <video
                src={MEDIA.platformInstall}
                autoPlay muted loop playsInline
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center bottom' }}
              />
            </figure>
            <div style={{
              fontFamily: "'Onest', sans-serif", fontSize: 13.5, lineHeight: 1.75, color: C.kostMuted,
            }}>
              Платформу можно установить как веб-приложение на смартфон. Инструмент
              освобождения среди множества матричных декораций.
            </div>
          </div>
        </FadeSection>

        <QuoteList quotes={SWIPE_QUOTES} style={{ maxWidth: 480, margin: '56px auto 0' }} />
      </div>

      <QuoteRail {...FLOAT_QUOTES[5]} />

      <style>{`
        @media (max-width: 760px) {
          .platform-row { grid-template-columns: 1fr !important; direction: ltr !important; }
        }
      `}</style>
    </section>
  )
}
