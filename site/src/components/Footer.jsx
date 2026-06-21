import { C, MEDIA, MeanderRule, WordMark } from './Shared'

export default function Footer() {
  return (
    <footer style={{
      background: C.tishina,
      borderTop: '1px solid rgba(194,154,72,0.16)',
      padding: 'clamp(44px,6vw,64px) clamp(22px,6vw,80px) 40px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <MeanderRule opacity={0.3} style={{ marginBottom: 40 }} />

        <div className="footer-row" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 28, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <img
              src={MEDIA.monogram} alt="Аргонавтика"
              style={{ height: 30, width: 'auto', filter: 'invert(1)', opacity: 0.7 }}
            />
            <WordMark size={12} color={C.kostMuted} gap={7} withStar={false} />
          </div>

          <div style={{ display: 'flex', gap: 'clamp(20px,4vw,40px)', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="https://t.me/argonautica_systems"
              target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: "'Onest', sans-serif", fontSize: 11.5, letterSpacing: 1,
                color: C.kostMuted, textDecoration: 'none', transition: 'color 200ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.zolotoYar }}
              onMouseLeave={e => { e.currentTarget.style.color = C.kostMuted }}
            >База Аргонавтики в Тг</a>
            <a
              href="https://web.tribute.tg/s/YQU"
              target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: "'Onest', sans-serif", fontSize: 11.5, letterSpacing: 1,
                color: C.kostMuted, textDecoration: 'none', transition: 'color 200ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.zolotoYar }}
              onMouseLeave={e => { e.currentTarget.style.color = C.kostMuted }}
            >Манифест Аргонавтов</a>
            <span style={{
              fontFamily: "'Onest', sans-serif", fontSize: 11.5, letterSpacing: 1, color: C.ghost,
            }}>Аргат</span>
          </div>
        </div>

        <div style={{
          marginTop: 30, fontFamily: "'Onest', sans-serif", fontSize: 10, letterSpacing: 1.5,
          textTransform: 'uppercase', color: C.stone,
        }}>СИСТЕМА ПРОЯВЛЕНИЯ ДЛЯ ЛЮДЕЙ С МИССИЕЙ</div>
      </div>
    </footer>
  )
}
