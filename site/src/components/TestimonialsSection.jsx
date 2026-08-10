import { useState } from 'react'
import { C, FadeSection, MeanderRule, SecLabel } from './Shared'

// Согласие на публикацию с ником получено (survey_responses.publish_consent).
const TESTIMONIALS = [
  { author: 'VeraaTara', text: 'Когда идёшь в плавание, отпусти весь свой накопленный опыт и знания и доверься капитану. За 25 лет плавания в одиночку я получила потрясающий опыт и взглянула на себя совершенно с другого ракурса. Классно быть той, кого ведут.' },
  { author: 'Trubadur_pro', text: 'Смело вступайте на борт, оставив за ним всё, что устарело и требует уничтожения. Держите нос по ветру, ищите опору и с отвагой отсекайте всем чудищам головы)' },
  { author: 'Seda_psy', text: 'Я бы сказала так — если не готовы менять что-то в реале, не стоит идти в командную игру. Тут не про теорию, тут про действия.' },
  { author: 'a_bublii', text: 'Отправляйтесь в экспедицию даже если есть сомнения и непонятно чего ждать, походу дела разберётесь и поймёте, для чего это вам.' },
  { author: 'DorogovaG', text: 'Никогда не вставайте на путь Аргонавта, ибо растеряете значимость, важность, серьёзность, деловитость. И станете живым человеком. А значит — простым и смертным. Оно вам надо?' },
  { author: 'theodoreocampo', text: 'Живое учение не даст тебе чётких инструкций по прохождению сценария и гарантий безопасности. На корабле — команда, но у каждого своя история. Открыться потоку стихий — это возможность заглянуть прежде всего в себя и узреть внутри самого страшного врага. Не забывай, что встать на путь Аргонавта — это про быть готовым отсечь всё лишнее через личные страхи, боль и неприятности лишь для того, чтобы вернуться к собственному началу.' },
  { author: 'daria_epi', text: 'Довериться хотя бы раз этому подходу и дать себе шанс встать на этот путь. Не ожидать чуда, но проходить его с вниманием и честностью — тогда перемены обязательно придут.' },
  { author: 'yakov', text: 'Если ты настрадался, наискался, наигрался в медитации, психологию, аффирмации, йогу и всё это... То пора отправляться в экспедицию и встретить своих чудовищ.' },
  { author: 'ivanartomov', text: 'Вступайте на путь и, по-любому, это вас зацепит: будь то ключи, стихии или знания Аргата.' },
]

function ArrowButton({ dir, onClick, label }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={label}
      style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        border: '1px solid rgba(194,154,72,0.32)', background: 'transparent',
        color: C.zoloto, cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', transition: 'border-color 200ms ease, color 200ms ease, background 200ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.zolotoYar; e.currentTarget.style.color = C.zolotoYar; e.currentTarget.style.background = 'rgba(194,154,72,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(194,154,72,0.32)'; e.currentTarget.style.color = C.zoloto; e.currentTarget.style.background = 'transparent' }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={dir === 'prev' ? 'M10 3 L5 8 L10 13' : 'M6 3 L11 8 L6 13'}
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const count = TESTIMONIALS.length
  const go = dir => setIndex(i => (i + (dir === 'next' ? 1 : -1) + count) % count)
  const current = TESTIMONIALS[index]

  return (
    <section id="testimonials" style={{
      background: C.tishina, position: 'relative', overflow: 'hidden',
      padding: 'clamp(88px,12vw,160px) clamp(22px,6vw,80px)',
      borderTop: '1px solid rgba(194,154,72,0.16)',
    }}>
      <div style={{
        position: 'absolute', top: '10%', right: '-8%', width: 420, height: 420, zIndex: 0,
        background: 'radial-gradient(circle, rgba(194,154,72,0.10), transparent 68%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
        <FadeSection><MeanderRule opacity={0.5} style={{ marginBottom: 44 }} /></FadeSection>

        <FadeSection delay={80}>
          <SecLabel num="05" text="Голоса" style={{ justifyContent: 'center' }} />
        </FadeSection>
        <FadeSection delay={140} y={22}>
          <h2 style={{
            fontFamily: "'Prata', serif", fontWeight: 400,
            fontSize: 'clamp(26px,3.6vw,40px)', lineHeight: 1.2, color: C.kostYar,
            letterSpacing: '-0.01em', margin: '0 0 56px',
          }}>Пожелания будущим Аргонавтам от прошедших экспедицию</h2>
        </FadeSection>

        <FadeSection delay={200}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,2.4vw,28px)' }}>
            <ArrowButton dir="prev" onClick={() => go('prev')} label="Предыдущий отзыв" />

            <div key={index} className="testimonial-card" style={{
              flex: 1, minHeight: 220, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 'clamp(28px,4vw,40px)', borderRadius: 12,
              border: '1px solid rgba(194,154,72,0.18)',
              background: 'linear-gradient(160deg, rgba(194,154,72,0.055), rgba(194,154,72,0.01))',
            }}>
              <blockquote style={{
                margin: 0, fontFamily: "'Lora', serif", fontStyle: 'italic',
                fontSize: 'clamp(15px,1.8vw,17px)', lineHeight: 1.7, color: C.kostDim,
              }}>{current.text}</blockquote>
              <figcaption style={{
                marginTop: 20, fontFamily: "'Onest', sans-serif", fontSize: 11, letterSpacing: 1.5,
                textTransform: 'uppercase', color: C.zoloto,
              }}>— {current.author}</figcaption>
            </div>

            <ArrowButton dir="next" onClick={() => go('next')} label="Следующий отзыв" />
          </div>
        </FadeSection>

        <FadeSection delay={260}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 30 }}>
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.author} type="button" onClick={() => setIndex(i)}
                aria-label={`Отзыв ${i + 1} из ${count}`}
                style={{
                  width: 7, height: 7, borderRadius: '50%', padding: 0, border: 'none',
                  background: i === index ? C.zoloto : 'rgba(194,154,72,0.28)',
                  cursor: 'pointer', transition: 'background 200ms ease',
                }}
              />
            ))}
          </div>
        </FadeSection>
      </div>

      <style>{`
        .testimonial-card { animation: testimonialIn 420ms cubic-bezier(.22,.61,.36,1); }
        @keyframes testimonialIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 560px) {
          .testimonial-card { min-height: 260px !important; }
        }
      `}</style>
    </section>
  )
}
