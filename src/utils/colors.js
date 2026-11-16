// Ders renkleri: renk körlüğüne karşı doğrulanmış 8'li kategorik palet.
// Yeni derse sıradaki boş renk verilir (sabit sıra, döngü yok).
export const SUBJECT_COLORS = [
  '#2a78d6', // mavi
  '#eb6834', // turuncu
  '#1baf7a', // turkuaz
  '#eda100', // sarı
  '#e87ba4', // pembe
  '#008300', // yeşil
  '#6250d6', // mor
  '#e34948', // kırmızı
]

export function nextFreeColor(subjects) {
  const used = new Set(subjects.map((s) => s.color))
  return SUBJECT_COLORS.find((c) => !used.has(c)) ?? null
}
