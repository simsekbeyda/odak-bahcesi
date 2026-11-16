import { addDays, dayKey } from './date'

// Seçilen haftanın günlük ve ders bazlı dağılımı (yalnızca tamamlanan oturumlar sayılır)
export function weeklyStats(sessions, subjects, weekStart) {
  const weekEnd = addDays(weekStart, 7)
  const inWeek = sessions.filter((s) => {
    const t = new Date(s.endedAt)
    return t >= weekStart && t < weekEnd
  })
  const completed = inWeek.filter((s) => s.status === 'completed')

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    const key = dayKey(date)
    const bySubject = {}
    let total = 0
    for (const s of completed) {
      if (dayKey(s.endedAt) !== key) continue
      bySubject[s.subjectId] = (bySubject[s.subjectId] || 0) + s.minutes
      total += s.minutes
    }
    return { date, bySubject, total }
  })

  const subjectTotals = subjects
    .map((sub) => {
      const list = completed.filter((s) => s.subjectId === sub.id)
      return {
        ...sub,
        minutes: list.reduce((a, s) => a + s.minutes, 0),
        count: list.length,
      }
    })
    .filter((s) => s.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)

  return {
    days,
    subjectTotals,
    totalMinutes: completed.reduce((a, s) => a + s.minutes, 0),
    plants: completed.length,
    withered: inWeek.length - completed.length,
    successRate: inWeek.length
      ? Math.round((completed.length / inWeek.length) * 100)
      : null,
  }
}

// Üst üste en az bir bitki yetiştirilen gün sayısı
export function currentStreak(sessions) {
  const days = new Set(
    sessions.filter((s) => s.status === 'completed').map((s) => dayKey(s.endedAt)),
  )
  let cursor = new Date()
  if (!days.has(dayKey(cursor))) cursor = addDays(cursor, -1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function todayMinutes(sessions) {
  const key = dayKey(new Date())
  return sessions
    .filter((s) => s.status === 'completed' && dayKey(s.endedAt) === key)
    .reduce((a, s) => a + s.minutes, 0)
}
