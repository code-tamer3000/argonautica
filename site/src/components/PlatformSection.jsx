import { C, FadeSection, MeanderRule, MEDIA, SecLabel, QuoteRail, QuoteList } from './Shared'

// Три экрана в логике пути, а не меню: сперва встаёшь на маршрут (карта),
// потом открываешь свой генный замок на нём, потом возвращаешься
// разобраться — в базу знаний. Дневник и Рубка описаны текстом: скриншотов
// пока нет, но они часть того же пути, а не отдельные «фичи».
const SCREENS = [
  {
    id: 'calendar',
    img: MEDIA.platformCalendar,
    label: 'Карта-календарь',
    title: 'Один экран — весь твой путь',
    text: 'Никакой ленты и оповещений ради оповещений. Каждый день на маршруте виден заранее: что открыто, что впереди, когда следующий эфир — и больше ничего лишнего.',
  },
  {
    id: 'genes',
    img: MEDIA.platformGenes,
    label: 'Генные Замки',
    title: 'Своё колесо в каждом прохождении',
    text: 'Интерактивная система генных замков твоей карты — не абстрактная теория, а инструмент, через который досконально разбираешься со своими внутренними чудовищами.',
  },
  {
    id: 'knowledge',
    img: MEDIA.platformKnowledge,
    label: 'База знаний',
    title: 'Всё пройденное остаётся с тобой',
    text: 'Записи эфиров, разборы, практики — ничего не теряется в чате и не смывается лентой. Доступ к материалам сохраняется в удобном формате.',
  },
]

// Цитаты прошлого потока — согласие на публикацию с именем получено
// (survey_responses.publish_consent). Расставлены вдоль всей секции: у входа
// в поток, между экранами и на выходе к тарифам — не блок «отзывы», а голоса
// сбоку от чтения.
// top — вертикальная позиция якоря на экране (% высоты вьюпорта), нарочно
// вразнобой, чтобы реплики не выстраивались в одну линию, как патроны
// в барабане, а были разбросаны выше-ниже по обеим сторонам.
const QUOTES = [
  { side: 'left', top: 32, author: 'Evgeniya_Belskih', text: 'Хватит ныть и тухнуть, вставайте.' },
  { side: 'right', top: 68, author: 'Trubadur_pro', text: 'Смело вступайте на борт, оставив за ним всё, что устарело и требует уничтожения.' },
  { side: 'left', top: 75, author: 'VeraaTara', text: 'Отпусти весь свой накопленный опыт и знания и доверься капитану.' },
  { side: 'right', top: 24, author: 'theodoreocampo', text: 'Быть готовым отсечь всё лишнее, чтобы вернуться к собственному началу.' },
  { side: 'left', top: 58, author: 'mashabriight', text: 'Будьте смелыми. Сильными в уязвимости и уязвимыми в силе своей.' },
  { side: 'right', top: 45, author: 'daria_epi', text: 'Довериться хотя бы раз этому подходу и дать себе шанс встать на этот путь.' },
]

function ScreenRow({ screen, reverse, delay }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(28px,4vw,64px)',
      alignItems: 'center', direction: reverse ? 'rtl' : 'ltr',
    }} className="platform-row">
      <FadeSection delay={delay} y={26} style={{ direction: 'ltr' }}>
        <figure style={{
          margin: 0, borderRadius: 10, overflow: 'hidden',
          border: '1px solid rgba(194,154,72,0.22)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        }}>
          <img src={screen.img} alt={screen.title} style={{ width: '100%', display: 'block' }} />
        </figure>
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

      <QuoteRail {...QUOTES[0]} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto' }}>
        <FadeSection><MeanderRule opacity={0.5} style={{ marginBottom: 44 }} /></FadeSection>

        <div style={{ maxWidth: 640, margin: '0 auto 70px', textAlign: 'center' }}>
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
            <p style={{
              fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 15,
              lineHeight: 1.65, color: C.kostDim, margin: 0,
            }}>
              Никакой ленты, никакой борьбы за твоё внимание. Всё внутри сконфигурировано
              ради одного — твоего прохождения. Один на один со знанием, ничего не отвлекает.
            </p>
          </FadeSection>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(56px,8vw,96px)' }}>
          <ScreenRow screen={SCREENS[0]} delay={220} />
          <QuoteRail {...QUOTES[1]} />

          <ScreenRow screen={SCREENS[1]} reverse delay={220} />
          <QuoteRail {...QUOTES[2]} />
          <QuoteRail {...QUOTES[3]} />

          <ScreenRow screen={SCREENS[2]} delay={220} />
          <QuoteRail {...QUOTES[4]} />
        </div>

        <FadeSection delay={280}>
          <div style={{
            maxWidth: 680, margin: '80px auto 0', textAlign: 'center',
            fontFamily: "'Onest', sans-serif", fontSize: 13.5, lineHeight: 1.75, color: C.kostMuted,
          }}>
            Рядом — Рубка для общения с командой и куратором, Дневник для ежедневной практики
            и Динамика, что копит твой путь день за днём. Это устанавливаемое веб-приложение
            в телефоне, а не сайт с логином: открываешь как любое другое, без браузера каждый раз.
          </div>
        </FadeSection>

        <QuoteList quotes={QUOTES} style={{ maxWidth: 480, margin: '56px auto 0' }} />
      </div>

      <QuoteRail {...QUOTES[5]} />

      <style>{`
        @media (max-width: 760px) {
          .platform-row { grid-template-columns: 1fr !important; direction: ltr !important; }
        }
      `}</style>
    </section>
  )
}
