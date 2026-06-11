import { useState } from 'react'
import { C, MEDIA, FadeSection, SecLabel, StarSpark, Hairline, scrollTo, btnGhost } from './Shared'

const CHAPTERS = [
  { num: 'I',     title: 'Архитектура симуляции',
    body: 'Мы живём в цифровой симуляции. Это фундаментальная рабочая предпосылка — не метафора. Задача аргонавта — научиться различать живое от неживого. Различать за тысячу шагов: чувствовать, знать и быть готовым ещё до того, как неживое на тебя бросится.',
    pull: 'Различать живое от неживого. За тысячу шагов.' },
  { num: 'IV',    title: 'Вертикаль и горизонтали',
    body: 'Пока Ядро не собрано — невозможно участвовать в собственных событийных рядах. Человек включается в чужие игры, созданные другими сценаристами. Первичная задача аргонавта — освободить внимание из внешних горизонтальных игр и сфокусироваться на уплотнении своего Ядра.',
    hard: 'Одиночество — титановая оболочка Ядра.' },
  { num: 'V',     title: 'Вещество Матрицы',
    body: 'Матрица ни в коем случае не враг. Воевать с матрицей — сон безумца. Аргонавт понимает принципы её работы и лепит из неё свою великую действительность. Намерение → Сопротивление → Рождение — абсолютная закономерность, работающая как часы.',
    pull: 'Матрица — это пластилин в руках аргонавта.',
    hard: 'Бояться пиздеца — значит отказываться от великих дел.' },
  { num: 'VI',    title: 'Мир — зеркало',
    body: 'Ты принял твёрдое решение, Матрица приняла его к исполнению. Но проходит время, ты смотришь в зеркало — а там всё как прежде, и бросаешь начатое на полпути. Физика инертна. Матрица материализует с задержкой; её инерцию нужно воспринимать как благо.',
    pull: 'Аргонавтика начинается, когда ты разбиваешь зеркало.' },
  { num: 'VIII',  title: 'Ловушка окружения',
    body: 'Матрица не выключает тебя сразу — она действует через постепенное усыпление. Аргонавт видит вовлекающие ловушки и даже среди людей не теряет состояния трезвого одиночества. Самые сильные проверки часто приходят через близких.',
    hard: 'Отсутствие врагов — признак посредственности человека.' },
  { num: 'IX',    title: 'Правило бинера',
    body: 'Энергия вырабатывается на разнице потенциалов. Свет и тьма, день и ночь, напряжение и расслабление. Чем глубже вхождение в тишину и недеяние — тем больше энергии действия черпается из бездонного источника. Аргонавт ловит и держит Баланс.',
    pull: 'Энергия вырабатывается на разнице потенциалов.' },
  { num: 'XIV',   title: 'Необходимость действовать',
    body: 'Аргонавт идёт своим путём — он активирует Бездеятеля: того, кто создаёт импульс, из которого рождается действие. Мы встаём в точку, из которой возникает Намерение, и держимся там, пока оно не станет плотным. Намерение → Импульс → Действие.' },
  { num: 'XV',    title: 'Оживление',
    body: 'Пробуждение и Просветление — не финал. За ними есть третий этап. Оживление — интеграция всех знаний в жизнь, разворачивание реальности из точки баланса. Аргонавт — человек, активирующий живые структуры.',
    pull: 'Пробуждение — не финал. Есть третий этап: Оживление.' },
  { num: 'XVIII', title: 'Перезагрузка системы 64-х',
    body: 'Здесь всё начинается с чистого импульса. После — всегда Проверка от системы, плодородная Тень. Именно здесь ты опускаешь руки. Ты не слабый — ты просто не знаешь механизма. Проходя плотность Тени, Ядро Намерения укрепляется, и ты обретаешь Дар.',
    pull: 'Сиддхи → Тень → Дар.' },
  { num: 'XXIII', title: 'Карта Аргонавтики',
    body: 'Карта собирает твоё внимание, чтобы ты дошёл. На ней — состояния, что держат тебя; этапы, открывающиеся по одному; и Золотое Руно как пламя, которое, загораясь, меняет всё.' },
]

export default function ManifestoSection() {
  const [active, setActive] = useState(0)
  const ch = CHAPTERS[active]

  return (
    <section id="manifesto" style={{
      background: C.tishina,
      padding: 'clamp(98px,12vw,172px) clamp(22px,6vw,80px)',
      borderTop: '1px solid rgba(194,154,72,0.1)',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <FadeSection>
          <SecLabel num="02" text="Манифест" />
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(26px,3.4vw,40px)', lineHeight: 1.2, color: C.kostYar,
            maxWidth: '16ch', marginBottom: 18,
          }}>Точка притяжения. Выжимка сути.</h2>
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 17, lineHeight: 1.7,
            color: C.kostMuted, maxWidth: '54ch', marginBottom: 'clamp(40px,6vw,64px)',
          }}>
            Манифест — ледяной отрезвляющий душ. Двадцать четыре главы, набранные как серьёзная книга.
            Здесь — только верхушка айсберга.
          </p>
        </FadeSection>

        <div className="manifesto-grid" style={{
          display: 'grid', gridTemplateColumns: '54px 210px 1fr',
          gap: 'clamp(28px,4vw,56px)', alignItems: 'start',
        }}>
          {/* Gold thread */}
          <div className="thread-rail" style={{
            alignSelf: 'stretch', borderRadius: 6, overflow: 'hidden', minHeight: 460,
            border: '1px solid rgba(194,154,72,0.18)', position: 'relative',
          }}>
            <img
              src={MEDIA.thread} alt="Золотая нить Ариадны"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 30%, transparent 70%, rgba(0,0,0,0.45))' }} />
          </div>

          {/* Chapter nav */}
          <nav className="ch-nav">
            <div style={{
              fontFamily: "'Onest', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: 3,
              textTransform: 'uppercase', color: C.ghost, marginBottom: 18,
            }}>I — XXIV · Главы</div>
            {CHAPTERS.map((c, i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                display: 'flex', alignItems: 'baseline', gap: 12, width: '100%',
                background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                padding: '12px 0',
                borderBottom: `1px solid rgba(194,154,72,${active === i ? 0.4 : 0.1})`,
                transition: 'border-color 220ms ease',
              }}>
                <span style={{
                  fontFamily: "'Onest', sans-serif", fontSize: 10.5, fontWeight: 600, letterSpacing: 1,
                  color: active === i ? C.zolotoYar : C.stone, width: 38, flexShrink: 0,
                }}>{c.num}</span>
                <span style={{
                  fontFamily: "'Prata', serif", fontSize: 13.5, lineHeight: 1.3,
                  color: active === i ? C.kostYar : C.kostMuted, transition: 'color 220ms ease',
                }}>{c.title}</span>
              </button>
            ))}
            <div style={{ marginTop: 16, fontFamily: "'Onest', sans-serif", fontSize: 10, letterSpacing: 2, color: C.stone }}>
              · · · и далее до XXIV
            </div>
          </nav>

          {/* Reading pane */}
          <article key={active} className="chapter-fade" style={{ maxWidth: '62ch', paddingTop: 4 }}>
            <div style={{
              fontFamily: "'Onest', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 3,
              textTransform: 'uppercase', color: C.latun, marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <StarSpark size={9} color={C.zoloto} />Глава {ch.num}
            </div>
            <h3 style={{
              fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(24px,3vw,36px)',
              lineHeight: 1.22, color: C.kostYar, marginBottom: 26,
            }}>{ch.title}</h3>
            <Hairline strength="soft" style={{ marginBottom: 30 }} />

            <p style={{
              fontFamily: "'Lora', serif", fontSize: 18, lineHeight: 1.85, color: C.kostDim,
              marginBottom: ch.pull || ch.hard ? 30 : 0,
            }}>{ch.body}</p>

            {ch.pull && (
              <blockquote style={{ margin: '0 0 30px', display: 'flex', gap: 16 }}>
                <StarSpark size={12} color={C.zoloto} style={{ marginTop: 14, flexShrink: 0 }} />
                <p style={{
                  fontFamily: "'Prata', serif", fontWeight: 400, fontSize: 'clamp(20px,2.4vw,28px)',
                  lineHeight: 1.34, color: C.kostYar, margin: 0,
                }}>{ch.pull}</p>
              </blockquote>
            )}

            {ch.hard && (
              <p style={{
                fontFamily: "'Onest', sans-serif", fontWeight: 600, fontSize: 'clamp(14px,1.6vw,17px)',
                letterSpacing: 0.5, color: C.krovYar, lineHeight: 1.5, margin: '0 0 30px',
                paddingLeft: 18, borderLeft: `2px solid ${C.krov}`,
              }}>{ch.hard}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 38, flexWrap: 'wrap' }}>
              <button
                onClick={() => setActive(i => Math.min(i + 1, CHAPTERS.length - 1))}
                disabled={active >= CHAPTERS.length - 1}
                style={{
                  fontFamily: "'Onest', sans-serif", fontSize: 11.5, fontWeight: 500, letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: active >= CHAPTERS.length - 1 ? C.stone : C.kostMuted,
                  background: 'none', border: 'none', padding: 0,
                  cursor: active >= CHAPTERS.length - 1 ? 'default' : 'pointer',
                  transition: 'color 200ms ease',
                }}
                onMouseEnter={e => { if (active < CHAPTERS.length - 1) e.currentTarget.style.color = C.kostYar }}
                onMouseLeave={e => { if (active < CHAPTERS.length - 1) e.currentTarget.style.color = C.kostMuted }}
              >Следующая глава →</button>
            </div>
          </article>
        </div>

        {/* Transition CTA */}
        <FadeSection delay={80}>
          <div style={{
            marginTop: 'clamp(64px,9vw,110px)', textAlign: 'center',
            paddingTop: 'clamp(40px,6vw,64px)', borderTop: '1px solid rgba(194,154,72,0.14)',
          }}>
            <p style={{
              fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 'clamp(17px,2vw,21px)',
              lineHeight: 1.6, color: C.kostMuted, maxWidth: '54ch', margin: '0 auto 26px',
            }}>
              Если после Манифеста ты почувствовал ледяной огонь, значит твой внутренний фитобоярин
              зашевелился. Ты готов идти дальше.<br />Если нет — найди себе другое сообщество.
            </p>
            <button
              onClick={() => scrollTo('expedition')}
              style={{ ...btnGhost, borderColor: 'rgba(194,154,72,0.4)', color: C.kostDim }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.zoloto; e.currentTarget.style.color = C.kostYar }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.4)'; e.currentTarget.style.color = C.kostDim }}
            >Перейти к Экспедиции ↓</button>
          </div>
        </FadeSection>
      </div>
    </section>
  )
}
