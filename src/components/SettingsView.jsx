import { useState } from 'react'
import { SUBJECT_COLORS, nextFreeColor } from '../utils/colors'
import { uid } from '../utils/storage'
import { generateSampleSessions } from '../utils/sampleData'

export default function SettingsView({ state, setState, updateSettings }) {
  const { settings } = state
  const subjects = state.subjects.filter((s) => !s.archived)
  const [name, setName] = useState('')
  const [color, setColor] = useState(() => nextFreeColor(subjects) ?? SUBJECT_COLORS[0])
  const [error, setError] = useState('')

  function addSubject(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Ders adı boş olamaz.')
    if (subjects.some((s) => s.name.toLocaleLowerCase('tr') === trimmed.toLocaleLowerCase('tr')))
      return setError('Bu ders zaten var.')
    const subject = { id: uid(), name: trimmed, color }
    setState((s) => ({ ...s, subjects: [...s.subjects, subject] }))
    setName('')
    setError('')
    setColor(nextFreeColor([...subjects, subject]) ?? SUBJECT_COLORS[0])
  }

  function removeSubject(id) {
    const hasSessions = state.sessions.some((s) => s.subjectId === id)
    if (state.active?.subjectId === id) return alert('Bu ders için aktif bir oturum var.')
    if (hasSessions) {
      // Geçmiş istatistikler bozulmasın diye kayıtlı oturumu olan dersler arşivlenir
      if (!confirm('Bu ders arşivlenecek. Bahçendeki bitkileri ve istatistikleri korunur. Devam?')) return
      setState((s) => ({
        ...s,
        subjects: s.subjects.map((x) => (x.id === id ? { ...x, archived: true } : x)),
      }))
    } else {
      setState((s) => ({ ...s, subjects: s.subjects.filter((x) => x.id !== id) }))
    }
  }

  function renameSubject(id, newName) {
    setState((s) => ({
      ...s,
      subjects: s.subjects.map((x) => (x.id === id ? { ...x, name: newName } : x)),
    }))
  }

  function loadSample() {
    if (!confirm('Son 2 haftaya ait örnek oturumlar eklensin mi? (Sunum için)')) return
    setState((s) => ({
      ...s,
      sessions: [...s.sessions, ...generateSampleSessions(subjects)].sort(
        (a, b) => new Date(a.endedAt) - new Date(b.endedAt),
      ),
    }))
  }

  function clearSample() {
    setState((s) => ({ ...s, sessions: s.sessions.filter((x) => !x.sample) }))
  }

  function resetAll() {
    if (!confirm('Tüm bahçe ve istatistikler silinecek. Bu işlem geri alınamaz. Emin misin?')) return
    setState((s) => ({ ...s, sessions: [], active: null }))
  }

  const usedColors = new Set(subjects.map((s) => s.color))
  const sampleCount = state.sessions.filter((s) => s.sample).length

  return (
    <section className="settings">
      <div className="card">
        <h2>Derslerim</h2>
        <ul className="subject-list">
          {subjects.map((s) => (
            <li key={s.id}>
              <span className="chip__dot chip__dot--big" style={{ background: s.color }} />
              <input
                className="input input--inline"
                value={s.name}
                onChange={(e) => renameSubject(s.id, e.target.value)}
                onBlur={(e) => !e.target.value.trim() && renameSubject(s.id, 'Adsız ders')}
                aria-label="Ders adı"
              />
              <button className="btn btn--ghost btn--small" onClick={() => removeSubject(s.id)}>
                Sil
              </button>
            </li>
          ))}
        </ul>

        {subjects.length < SUBJECT_COLORS.length ? (
          <form className="add-subject" onSubmit={addSubject}>
            <input
              className="input"
              placeholder="Yeni ders adı (ör. Kimya)"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="swatches" role="radiogroup" aria-label="Renk">
              {SUBJECT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  role="radio"
                  aria-checked={color === c}
                  aria-label={c}
                  disabled={usedColors.has(c)}
                  className={`swatch ${color === c ? 'is-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <button className="btn btn--primary" type="submit">
              Ekle
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        ) : (
          <p className="muted">En fazla {SUBJECT_COLORS.length} ders eklenebilir.</p>
        )}
      </div>

      <div className="card">
        <h2>Ayarlar</h2>
        <div className="setting">
          <div>
            <strong>Mola süresi</strong>
            <p className="muted small">Odak oturumundan sonra önerilen mola</p>
          </div>
          <select value={settings.breakMinutes} onChange={(e) => updateSettings({ breakMinutes: Number(e.target.value) })}>
            {[5, 10, 15].map((m) => (
              <option key={m} value={m}>
                {m} dk
              </option>
            ))}
          </select>
        </div>
        <div className="setting">
          <div>
            <strong>Ses bildirimi</strong>
            <p className="muted small">Oturum bitince kısa bir melodi çalar</p>
          </div>
          <input type="checkbox" className="toggle" checked={settings.sound} onChange={(e) => updateSettings({ sound: e.target.checked })} />
        </div>
        <div className="setting">
          <div>
            <strong>Sunum modu ⚡</strong>
            <p className="muted small">Zamanlayıcı 60 kat hızlı çalışır (25 dk ≈ 25 sn)</p>
          </div>
          <input
            type="checkbox"
            className="toggle"
            checked={settings.fastMode}
            disabled={!!state.active}
            onChange={(e) => updateSettings({ fastMode: e.target.checked })}
          />
        </div>
      </div>

      <div className="card">
        <h2>Veri</h2>
        <div className="data-actions">
          <button className="btn btn--ghost" onClick={loadSample}>
            🌼 Örnek veri yükle
          </button>
          {sampleCount > 0 && (
            <button className="btn btn--ghost" onClick={clearSample}>
              Örnek veriyi kaldır ({sampleCount})
            </button>
          )}
          <button className="btn btn--danger-ghost" onClick={resetAll}>
            Bahçeyi sıfırla
          </button>
        </div>
      </div>
    </section>
  )
}
