import { useEffect, useState } from 'react'
import { C, FadeSection, MeanderRule, MEDIA, SecLabel } from './Shared'

const SCREENS = [
  {
    id: 'rubka',
    imgLight: MEDIA.platformRubkaLight,
    imgDark: MEDIA.platformRubkaDark,
    label: 'Рубка',
    title: 'Вся динамика происходит внутри',
    text: 'Что там? Входи и узнаешь.',
  },
  {
    id: 'tasks',
    imgLight: MEDIA.platformTasksLight,
    imgDark: MEDIA.platformTasksDark,
    label: 'Задачи',
    title: 'Путь Славы к своей Миссии',
    text: 'Геймификация. Ты — проснувшийся игрок. На пути появляются точные и чёткие задачи, способствующие твоему индивидуальному освобождению.',
  },
  {
    id: 'genes',
    imgLight: MEDIA.platformGenesLight,
    imgDark: MEDIA.platformGenesDark,
    label: 'Генные Замки',
    title: 'Своё колесо в каждом прохождении',
    text: 'На каждом этапе Аргонавт встречается с боссом. Это чудище охраняет твой персональный Замок, за которым заперта твоя сила. Аргонавт не пользуется готовыми матричными расчётами, подсовывающими человеку полуправду о себе, и зрит в корень.',
  },
  {
    id: 'knowledge',
    imgLight: MEDIA.platformKnowledgeLight,
    imgDark: MEDIA.platformKnowledgeDark,
    label: 'База знаний',
    title: 'Всё пройденное остаётся с тобой',
    text: 'Записи эфиров, разборы, практики — ничего не теряется в чате и не смывается лентой. Доступ к материалам сохраняется в удобном формате.',
  },
]

// Скрин экрана платформы. У Рубки и Задач есть светлая и тёмная версии —
// по умолчанию идут в шахматном порядке (тёмная/светлая/тёмная/светлая по
// рядам). Подсказка про переключатель показывается один раз, только на
// первом ряду с переключением, и гаснет через пару секунд.
function ScreenFigure({ screen, defaultDark, showHint }) {
  const [dark, setDark] = useState(defaultDark)
  const [hintVisible, setHintVisible] = useState(showHint)
  const hasToggle = Boolean(screen.imgLight && screen.imgDark)
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
      <img src={src} alt={screen.title} style={{ width: '100%', display: 'block' }} />
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

function ScreenRow({ screen, reverse, delay, defaultDark, showHint }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(28px,4vw,64px)',
      alignItems: 'center', direction: reverse ? 'rtl' : 'ltr',
    }} className="platform-row">
      <FadeSection delay={delay} y={26} style={{ direction: 'ltr' }}>
        <ScreenFigure screen={screen} defaultDark={defaultDark} showHint={showHint} />
      </FadeSection>

      <FadeSection delay={delay + 80} y={20} style={{ direction: 'ltr' }}>
        <div style={{
          fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2.5,
          textTransform: 'uppercase', color: C.zoloto, marginBottom: 10,
        }}>{screen.label}</div>
        <h3 style={{
          fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(21px,2.4vw,27px)',
          color: C.kostYar, lineHeight: 1.25, margin: '0 0 14px',
        }}>{screen.title}</h3>
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto' }}>
        <FadeSection><MeanderRule opacity={0.5} style={{ marginBottom: 44 }} /></FadeSection>

        <div style={{ maxWidth: 680, margin: '0 auto 70px', textAlign: 'center' }}>
          <FadeSection delay={80}>
            <SecLabel num="04" text="Платформа" style={{ justifyContent: 'center' }} />
          </FadeSection>
          <FadeSection delay={140} y={22}>
            <h2 style={{
              fontFamily: "'Prata', serif", fontWeight: 400,
              fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.15, color: C.kostYar,
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
          <ScreenRow screen={SCREENS[0]} delay={220} defaultDark={true} showHint />
          <ScreenRow screen={SCREENS[1]} reverse delay={220} defaultDark={false} />
          <ScreenRow screen={SCREENS[2]} delay={220} defaultDark={true} />
          <ScreenRow screen={SCREENS[3]} reverse delay={220} defaultDark={false} />
        </div>

        <FadeSection delay={280}>
          <div style={{ maxWidth: 680, margin: '80px auto 0', textAlign: 'center' }}>
            <figure style={{
              margin: '0 auto 28px', width: 'min(260px, 60vw)', borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(194,154,72,0.22)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            }}>
              <video
                src={MEDIA.platformInstall}
                autoPlay muted loop playsInline
                style={{ width: '100%', display: 'block' }}
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
      </div>

      <style>{`
        @media (max-width: 760px) {
          .platform-row { grid-template-columns: 1fr !important; direction: ltr !important; }
        }
      `}</style>
    </section>
  )
}
