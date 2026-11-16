import { currentStreak, todayMinutes } from '../utils/stats'
import { formatMinutes } from '../utils/date'

export default function Header({ sessions }) {
  const plants = sessions.filter((s) => s.status === 'completed').length
  const streak = currentStreak(sessions)
  const today = todayMinutes(sessions)

  return (
    <header className="header">
      <div className="brand">
        <span className="brand__logo" aria-hidden="true">🌱</span>
        <div>
          <h1>Odak Bahçesi</h1>
          <p>Her odak oturumu bahçene bir bitki ekler</p>
        </div>
      </div>
      <dl className="header__stats">
        <div>
          <dt>Bugün</dt>
          <dd>{formatMinutes(today)}</dd>
        </div>
        <div>
          <dt>Seri</dt>
          <dd>{streak} gün 🔥</dd>
        </div>
        <div>
          <dt>Bitki</dt>
          <dd>{plants} 🌼</dd>
        </div>
      </dl>
    </header>
  )
}
