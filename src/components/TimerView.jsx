import { useEffect, useState } from 'react'
import Plant from './Plant'
import { formatClock } from '../utils/date'

const DURATIONS = [15, 25, 50]
const STAGE_MESSAGES = [
  'Tohum toprağa düştü. Odaklan!',
  'Filiz çıktı, harika gidiyorsun 🌱',
  'Yapraklar açılıyor, devam!',
  'Tomurcuk göründü, az kaldı!',
  'Çiçek açmak üzere!',
]

function ProgressRing({ progress, color, children }) {
  const r = 140
  const c = 2 * Math.PI * r
  return (
    <div className="ring">
      <svg viewBox="0 0 300 300" className="ring__svg" aria-hidden="true">
        <circle cx="150" cy="150" r={r} className="ring__track" />
        <circle
          cx="150"
          cy="150"
          r={r}
          className="ring__bar"
          style={{ stroke: color, strokeDasharray: c, strokeDashoffset: c * (1 - progress) }}
        />
      </svg>
      <div className="ring__content">{children}</div>
    </div>
  )
}

export default function TimerView({
  active,
  remaining,
  subjects,
  allSubjects,
  lastSubjectId,
  settings,
  onStart,
  onGiveUp,
  onStopBreak,
  onChangeMinutes,
  onGoSettings,
}) {
  const [subjectId, setSubjectId] = useState(
    subjects.some((s) => s.id === lastSubjectId) ? lastSubjectId : subjects[0]?.id,
  )
  const [confirming, setConfirming] = useState(false)

  useEffect(() => setConfirming(false), [active])

  // --- MOLA ---
  if (active?.type === 'break') {
    const progress = Math.min(1, Math.max(0, 1 - remaining / active.durationMs))
    return (
      <section className="card timer timer--break">
        <ProgressRing progress={progress} color="var(--accent-break)">
          <div className="timer__emoji" aria-hidden="true">☕</div>
          <div className="timer__clock">{formatClock(remaining)}</div>
          <div className="timer__label">Mola zamanı</div>
        </ProgressRing>
        <p className="timer__hint">Su iç, biraz esne. Bahçen seni bekliyor.</p>
        <button className="btn btn--ghost" onClick={onStopBreak}>Molayı bitir</button>
      </section>
    )
  }

  // --- ODAK OTURUMU ---
  if (active?.type === 'focus') {
    const progress = Math.min(1, Math.max(0, 1 - remaining / active.durationMs))
    const stage = Math.min(4, Math.floor(progress * 5))
    const subject = allSubjects.find((s) => s.id === active.subjectId)
    return (
      <section className="card timer">
        <span className="chip" style={{ '--chip': subject?.color }}>
          <span className="chip__dot" /> {subject?.name ?? 'Ders'}
        </span>
        <ProgressRing progress={progress} color={subject?.color ?? 'var(--green)'}>
          <Plant species={active.species} stage={stage} size={120} />
          <div className="timer__clock">{formatClock(remaining)}</div>
        </ProgressRing>
        <p className="timer__hint" aria-live="polite">{STAGE_MESSAGES[stage]}</p>

        {!confirming ? (
          <button className="btn btn--danger-ghost" onClick={() => setConfirming(true)}>
            Vazgeç
          </button>
        ) : (
          <div className="confirm">
            <p>Emin misin? Oturumu bırakırsan bitkin <strong>solacak</strong> 🥀</p>
            <div className="confirm__actions">
              <button className="btn btn--primary" onClick={() => setConfirming(false)}>
                Devam et
              </button>
              <button className="btn btn--danger" onClick={onGiveUp}>
                Bırak
              </button>
            </div>
          </div>
        )}
      </section>
    )
  }

  // --- BOŞTA: yeni oturum hazırlığı ---
  if (!subjects.length) {
    return (
      <section className="card timer">
        <p className="empty">Başlamak için önce bir ders ekle.</p>
        <button className="btn btn--primary" onClick={onGoSettings}>Ders ekle</button>
      </section>
    )
  }

  const selected = subjects.find((s) => s.id === subjectId) ?? subjects[0]

  return (
    <section className="card timer">
      <h2 className="timer__title">Hangi derse odaklanacaksın?</h2>
      <div className="subject-picker" role="radiogroup" aria-label="Ders seç">
        {subjects.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={selected.id === s.id}
            className={`chip chip--button ${selected.id === s.id ? 'chip--selected' : ''}`}
            style={{ '--chip': s.color }}
            onClick={() => setSubjectId(s.id)}
          >
            <span className="chip__dot" /> {s.name}
          </button>
        ))}
      </div>

      <ProgressRing progress={0} color={selected.color}>
        <Plant species="lale" stage={0} size={120} sway={false} />
        <div className="timer__clock">{formatClock(settings.focusMinutes * 60000)}</div>
      </ProgressRing>

      <div className="segmented" role="radiogroup" aria-label="Süre">
        {DURATIONS.map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={settings.focusMinutes === m}
            className={settings.focusMinutes === m ? 'is-active' : ''}
            onClick={() => onChangeMinutes(m)}
          >
            {m} dk{m === 50 && ' 🌳'}
          </button>
        ))}
      </div>

      <button className="btn btn--primary btn--big" onClick={() => onStart(selected.id)}>
        🌱 Odaklanmaya başla
      </button>
      {settings.fastMode && (
        <p className="badge-warning">⚡ Sunum modu açık: 1 dakika = 1 saniye</p>
      )}
      <p className="timer__hint">
        Oturumu tamamlarsan bahçene bir bitki eklenir. Yarıda bırakırsan bitki solar.
        50 dakikalık oturumlar ağaç verir!
      </p>
    </section>
  )
}
