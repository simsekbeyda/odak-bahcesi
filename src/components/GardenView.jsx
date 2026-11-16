import { useMemo, useState } from 'react'
import Plant from './Plant'
import { SPECIES } from '../utils/plants'
import { formatDateTime, formatMinutes, startOfWeek } from '../utils/date'

const RANGES = [
  { id: 'week', label: 'Bu hafta' },
  { id: 'all', label: 'Tümü' },
]

export default function GardenView({ sessions, subjects, newPlantId }) {
  const [range, setRange] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [showWithered, setShowWithered] = useState(true)

  const subjectMap = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects])

  const list = useMemo(() => {
    const weekStart = startOfWeek()
    return sessions
      .filter((s) => range === 'all' || new Date(s.endedAt) >= weekStart)
      .filter((s) => subjectFilter === 'all' || s.subjectId === subjectFilter)
      .filter((s) => showWithered || s.status === 'completed')
      .slice()
      .reverse()
  }, [sessions, range, subjectFilter, showWithered])

  const alive = list.filter((s) => s.status === 'completed').length
  const withered = list.length - alive

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Bahçem</h2>
          <p className="muted">
            {alive} sağlıklı bitki · {withered} solmuş bitki
          </p>
        </div>
        <div className="filters">
          <div className="segmented segmented--small">
            {RANGES.map((r) => (
              <button key={r.id} className={range === r.id ? 'is-active' : ''} onClick={() => setRange(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} aria-label="Derse göre filtrele">
            <option value="all">Tüm dersler</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <label className="check">
            <input type="checkbox" checked={showWithered} onChange={(e) => setShowWithered(e.target.checked)} />
            Solmuşları göster
          </label>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="garden garden--empty">
          <Plant stage={0} size={90} sway={false} />
          <p>Bahçen henüz boş. İlk odak oturumunu tamamla ve ilk bitkini dik!</p>
        </div>
      ) : (
        <ul className="garden">
          {list.map((s, i) => {
            const sub = subjectMap[s.subjectId]
            const sp = SPECIES[s.species]
            const isWithered = s.status === 'withered'
            return (
              <li
                key={s.id}
                className={`garden__tile ${isWithered ? 'is-withered' : ''}`}
                style={{ animationDelay: `${Math.min(i, 20) * 30}ms` }}
              >
                <Plant species={s.species} stage={4} withered={isWithered} animate={s.id === newPlantId} size={72} />
                <span className="garden__tag" style={{ '--chip': sub?.color ?? '#999' }}>
                  <span className="chip__dot" />
                  {sub?.name ?? 'Silinmiş ders'}
                </span>
                <div className="tooltip" role="tooltip">
                  <strong>{isWithered ? `Solmuş ${sp?.name}` : sp?.name}</strong>
                  <span>{sub?.name ?? 'Silinmiş ders'}</span>
                  <span>
                    {isWithered
                      ? `${formatMinutes(s.minutes)} / ${formatMinutes(s.plannedMinutes)} sonra bırakıldı`
                      : `${formatMinutes(s.minutes)} odak`}
                  </span>
                  <span className="muted">{formatDateTime(s.endedAt)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
