// LocalStorage yardımcıları: tüm okuma/yazmalar try/catch içinde,
// çünkü gizli sekmede veya kota dolduğunda hata fırlatabilir.
export const STORAGE_KEY = 'odak-bahcesi:v1'

export function loadState(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return {
      ...fallback,
      ...parsed,
      settings: { ...fallback.settings, ...(parsed.settings || {}) },
    }
  } catch {
    return fallback
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* depolama kullanılamıyorsa sessizce devam et */
  }
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
