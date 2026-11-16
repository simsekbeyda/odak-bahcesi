import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import TimerView from './components/TimerView'
import GardenView from './components/GardenView'
import StatsView from './components/StatsView'
import SettingsView from './components/SettingsView'
import ResultModal from './components/ResultModal'
import { loadState, saveState, uid } from './utils/storage'
import { pickSpecies } from './utils/plants'
import { playChime } from './utils/sound'
import { formatClock } from './utils/date'
import { SUBJECT_COLORS } from './utils/colors'
import { generateSampleSessions } from './utils/sampleData'

const DEFAULT_STATE = {
  subjects: [
    { id: 'mat', name: 'Matematik', color: SUBJECT_COLORS[0] },
    { id: 'fiz', name: 'Fizik', color: SUBJECT_COLORS[1] },
    { id: 'tur', name: 'Türkçe', color: SUBJECT_COLORS[2] },
    { id: 'ing', name: 'İngilizce', color: SUBJECT_COLORS[3] },
  ],
  sessions: [],
  settings: {
    focusMinutes: 25,
    breakMinutes: 5,
    fastMode: false, // sunum modu: 1 dakika = 1 saniye
    sound: true,
  },
  active: null,
  lastSubjectId: 'mat',
}

const TABS = [
  { id: 'timer', label: 'Zamanlayıcı', icon: '⏱️' },
  { id: 'garden', label: 'Bahçem', icon: '🌷' },
  { id: 'stats', label: 'İstatistikler', icon: '📊' },
  { id: 'settings', label: 'Dersler & Ayarlar', icon: '⚙️' },
]

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const [state, setState] = useState(() => {
    const loaded = loadState(DEFAULT_STATE)
    // ?demo=1 → bahçe boşsa sunum için örnek veriyle doldur
    if (params.has('demo') && loaded.sessions.length === 0) {
      return { ...loaded, sessions: generateSampleSessions(loaded.subjects.filter((s) => !s.archived)) }
    }
    return loaded
  })
  const [tab, setTab] = useState(() =>
    TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'timer',
  )
  const [now, setNow] = useState(Date.now())
  const [result, setResult] = useState(null) // tamamlanan/solan oturum bilgisi
  const [newPlantId, setNewPlantId] = useState(null)
  const finishedRef = useRef(null)

  const { active, settings } = state

  // Her değişiklikte LocalStorage'a kaydet
  useEffect(() => saveState(state), [state])

  // Aktif oturum varken saati ilerlet
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [active])

  const remaining = active ? active.startedAt + active.durationMs - now : 0

  // Süre dolunca oturumu bitir (sayfa yenilense bile startedAt sayesinde devam eder)
  useEffect(() => {
    if (!active || remaining > 0) return
    if (active.type === 'focus') finishFocus('completed')
    else {
      if (settings.sound) playChime('success')
      setState((s) => ({ ...s, active: null }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, remaining])

  // Sekme başlığında geri sayım
  useEffect(() => {
    if (!active) {
      document.title = 'Odak Bahçesi'
      return
    }
    const label = active.type === 'focus' ? '🌱 Odak' : '☕ Mola'
    document.title = `${formatClock(remaining)} · ${label}`
  }, [active, remaining])

  const speed = settings.fastMode ? 60 : 1

  function startFocus(subjectId) {
    const minutes = settings.focusMinutes
    setResult(null)
    setState((s) => ({
      ...s,
      lastSubjectId: subjectId,
      active: {
        type: 'focus',
        subjectId,
        species: pickSpecies(minutes),
        plannedMinutes: minutes,
        startedAt: Date.now(),
        durationMs: (minutes * 60000) / speed,
      },
    }))
  }

  function finishFocus(status) {
    const a = state.active
    if (!a || a.type !== 'focus') return
    // Aynı oturumun iki kez kaydedilmesini engelle (StrictMode çift efekt çalıştırır)
    if (finishedRef.current === a.startedAt) return
    finishedRef.current = a.startedAt
    const elapsedMs = Math.min(Date.now() - a.startedAt, a.durationMs)
    const session = {
      id: uid(),
      subjectId: a.subjectId,
      species: a.species,
      status,
      plannedMinutes: a.plannedMinutes,
      minutes:
        status === 'completed'
          ? a.plannedMinutes
          : Math.floor((elapsedMs / a.durationMs) * a.plannedMinutes),
      startedAt: new Date(a.startedAt).toISOString(),
      endedAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, active: null, sessions: [...s.sessions, session] }))
    setNewPlantId(session.id)
    setResult(session)
    if (settings.sound) playChime(status === 'completed' ? 'success' : 'fail')
  }

  function startBreak() {
    setResult(null)
    setState((s) => ({
      ...s,
      active: {
        type: 'break',
        startedAt: Date.now(),
        durationMs: (s.settings.breakMinutes * 60000) / speed,
      },
    }))
  }

  const stopBreak = () => setState((s) => ({ ...s, active: null }))

  const updateSettings = (patch) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))

  const visibleSubjects = useMemo(
    () => state.subjects.filter((s) => !s.archived),
    [state.subjects],
  )

  return (
    <div className="app">
      <Header sessions={state.sessions} />

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span> {t.label}
            {t.id === 'timer' && active && <span className="tab__dot" />}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'timer' && (
          <TimerView
            active={active}
            remaining={remaining}
            subjects={visibleSubjects}
            allSubjects={state.subjects}
            lastSubjectId={state.lastSubjectId}
            settings={settings}
            onStart={startFocus}
            onGiveUp={() => finishFocus('withered')}
            onStopBreak={stopBreak}
            onChangeMinutes={(m) => updateSettings({ focusMinutes: m })}
            onGoSettings={() => setTab('settings')}
          />
        )}
        {tab === 'garden' && (
          <GardenView sessions={state.sessions} subjects={state.subjects} newPlantId={newPlantId} />
        )}
        {tab === 'stats' && <StatsView sessions={state.sessions} subjects={state.subjects} />}
        {tab === 'settings' && (
          <SettingsView state={state} setState={setState} updateSettings={updateSettings} />
        )}
      </main>

      {result && (
        <ResultModal
          session={result}
          subject={state.subjects.find((s) => s.id === result.subjectId)}
          breakMinutes={settings.breakMinutes}
          onBreak={startBreak}
          onGarden={() => {
            setResult(null)
            setTab('garden')
          }}
          onClose={() => setResult(null)}
        />
      )}

      <footer className="footer">
        Odak Bahçesi · Veriler yalnızca bu tarayıcıda (LocalStorage) saklanır.
      </footer>
    </div>
  )
}
