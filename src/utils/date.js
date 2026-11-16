export const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

// Haftanın başlangıcı: Pazartesi 00:00
export function startOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Pzt=0 ... Paz=6
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function dayKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatMinutes(min) {
  const m = Math.round(min)
  if (m < 60) return `${m} dk`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} sa ${r} dk` : `${h} sa`
}

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' })
const dateTimeFmt = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatDate = (d) => dateFmt.format(new Date(d))
export const formatDateTime = (d) => dateTimeFmt.format(new Date(d))

export function formatWeekRange(weekStart) {
  return `${formatDate(weekStart)} – ${formatDate(addDays(weekStart, 6))}`
}
