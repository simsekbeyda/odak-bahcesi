import { useMemo, useState } from 'react'
import { weeklyStats } from '../utils/stats'
import { DAY_LABELS, addDays, dayKey, formatDate, formatMinutes, formatWeekRange, startOfWeek } from '../utils/date'

function niceMax(value) {
  // 60'ın katı → çeyrek çizgiler her zaman 15 dakikanın katına denk gelir
  return Math.max(60, Math.ceil(value / 60) * 60)
}

function WeeklyChart({ days, subjects }) {
  const [hover, setHover] = useState(null)
  const max = niceMax(Math.max(...days.map((d) => d.total)))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))
  const todayKey = dayKey(new Date())

  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <div className="chart__plot">
        <div className="chart__grid" aria-hidden="true">
          {ticks
            .slice()
            .reverse()
            .map((t) => (
              <div key={t} className="chart__gridline">
                <span>{t ? formatMinutes(t) : '0'}</span>
              </div>
            ))}
        </div>
        <div className="chart__bars">
          {days.map((d, i) => {
            const isToday = dayKey(d.date) === todayKey
            return (
              <div
                key={i}
                className={`chart__col ${hover === i ? 'is-hover' : ''}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${DAY_LABELS[i]}: ${formatMinutes(d.total)}`}
              >
                <div className="chart__stack" style={{ height: `${(d.total / max) * 100}%` }}>
                  {subjects
                    .filter((s) => d.bySubject[s.id])
                    .map((s) => (
                      <div
                        key={s.id}
                        className="chart__seg"
                        style={{ background: s.color, flexGrow: d.bySubject[s.id] }}
                      />
                    ))}
                </div>
                {hover === i && (
                  <div className={`chart__tip ${i > 4 ? 'chart__tip--left' : ''}`}>
                    <strong>{formatDate(d.date)}</strong>
                    <span className="chart__tip-total">{formatMinutes(d.total)}</span>
                    {subjects
                      .filter((s) => d.bySubject[s.id])
                      .map((s) => (
                        <span key={s.id} className="chart__tip-row">
                          <span className="chip__dot" style={{ background: s.color }} />
                          {s.name}
                          <b>{formatMinutes(d.bySubject[s.id])}</b>
                        </span>
                      ))}
                    {!d.total && <span className="muted">Bu gün odak yok</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="chart__labels">
        {days.map((d, i) => (
          <span key={i} className={dayKey(d.date) === todayKey ? 'is-today' : ''}>
            {DAY_LABELS[i]}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function StatsView({ sessions, subjects }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekStart = useMemo(() => addDays(startOfWeek(), weekOffset * 7), [weekOffset])
  const stats = useMemo(() => weeklyStats(sessions, subjects, weekStart), [sessions, subjects, weekStart])
  const maxSubject = stats.subjectTotals[0]?.minutes || 1
  const weekSubjects = subjects.filter((s) => stats.subjectTotals.some((t) => t.id === s.id))

  return (
    <section className="stats">
      <div className="card">
        <div className="section-head">
          <div>
            <h2>Haftalık istatistikler</h2>
            <p className="muted">{formatWeekRange(weekStart)}</p>
          </div>
          <div className="week-nav">
            <button className="btn btn--ghost btn--icon" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Önceki hafta">
              ‹
            </button>
            <button className="btn btn--ghost" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>
              Bu hafta
            </button>
            <button
              className="btn btn--ghost btn--icon"
              onClick={() => setWeekOffset((w) => w + 1)}
              disabled={weekOffset >= 0}
              aria-label="Sonraki hafta"
            >
              ›
            </button>
          </div>
        </div>

        <div className="kpis">
          <div className="kpi">
            <span className="kpi__label">Toplam odak</span>
            <span className="kpi__value">{formatMinutes(stats.totalMinutes)}</span>
          </div>
          <div className="kpi">
            <span className="kpi__label">Yetişen bitki</span>
            <span className="kpi__value">{stats.plants} 🌼</span>
          </div>
          <div className="kpi">
            <span className="kpi__label">Solan bitki</span>
            <span className="kpi__value">{stats.withered} 🥀</span>
          </div>
          <div className="kpi">
            <span className="kpi__label">Başarı oranı</span>
            <span className="kpi__value">{stats.successRate === null ? '–' : `%${stats.successRate}`}</span>
          </div>
        </div>

        <h3 className="chart-title">Günlük odak süresi</h3>
        <WeeklyChart days={stats.days} subjects={subjects} />
        {weekSubjects.length > 1 && (
          <ul className="legend">
            {weekSubjects.map((s) => (
              <li key={s.id}>
                <span className="chip__dot" style={{ background: s.color }} />
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Hangi derse ne kadar çalıştım?</h2>
        {stats.subjectTotals.length === 0 ? (
          <p className="empty">Bu hafta henüz tamamlanmış bir oturum yok.</p>
        ) : (
          <table className="subject-table">
            <thead>
              <tr>
                <th scope="col">Ders</th>
                <th scope="col"><span className="visually-hidden">Oran</span></th>
                <th scope="col" className="num">Süre</th>
                <th scope="col" className="num">Pay</th>
              </tr>
            </thead>
            <tbody>
              {stats.subjectTotals.map((s) => (
                <tr key={s.id}>
                  <th scope="row">
                    <span className="chip__dot" style={{ background: s.color }} />
                    {s.name}
                    <span className="muted small"> · {s.count} bitki</span>
                  </th>
                  <td className="bar-cell">
                    <div className="hbar">
                      <div className="hbar__fill" style={{ width: `${(s.minutes / maxSubject) * 100}%`, background: s.color }} />
                    </div>
                  </td>
                  <td className="num">{formatMinutes(s.minutes)}</td>
                  <td className="num muted">%{Math.round((s.minutes / stats.totalMinutes) * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
