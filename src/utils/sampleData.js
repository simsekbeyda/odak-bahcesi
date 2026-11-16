import { pickSpecies } from './plants'
import { uid } from './storage'

// Sunum için son 14 güne yayılmış örnek oturumlar üretir
export function generateSampleSessions(subjects) {
  if (!subjects.length) return []
  const sessions = []
  const now = new Date()
  for (let d = 13; d >= 0; d--) {
    const count = d % 6 === 0 ? 1 : Math.floor(Math.random() * 4) + 1
    for (let i = 0; i < count; i++) {
      const sub = subjects[Math.floor(Math.random() * subjects.length)]
      const planned = Math.random() < 0.2 ? 50 : 25
      const end = new Date(now)
      end.setDate(end.getDate() - d)
      end.setHours(9 + i * 2, Math.floor(Math.random() * 60), 0, 0)
      if (end > now) continue
      const withered = Math.random() < 0.15
      sessions.push({
        id: uid(),
        subjectId: sub.id,
        species: pickSpecies(planned),
        status: withered ? 'withered' : 'completed',
        plannedMinutes: planned,
        minutes: withered ? Math.max(1, Math.floor(Math.random() * planned * 0.8)) : planned,
        startedAt: new Date(end.getTime() - planned * 60000).toISOString(),
        endedAt: end.toISOString(),
        sample: true,
      })
    }
  }
  return sessions
}
