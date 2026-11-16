import { useEffect } from 'react'
import Plant from './Plant'
import { SPECIES } from '../utils/plants'
import { formatMinutes } from '../utils/date'

export default function ResultModal({ session, subject, breakMinutes, onBreak, onGarden, onClose }) {
  const success = session.status === 'completed'
  const sp = SPECIES[session.species]

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal ${success ? 'modal--success' : 'modal--fail'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        onClick={(e) => e.stopPropagation()}
      >
        {success && (
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} style={{ '--i': i }} />
            ))}
          </div>
        )}
        <Plant species={session.species} stage={4} withered={!success} animate size={130} />
        <h2 id="result-title">{success ? 'Tebrikler! 🎉' : 'Bitkin soldu 🥀'}</h2>
        <p>
          {success ? (
            <>
              <strong>{subject?.name}</strong> dersine {formatMinutes(session.minutes)} odaklandın.
              Bahçene bir <strong>{sp?.name}</strong> eklendi!
            </>
          ) : (
            <>
              <strong>{subject?.name}</strong> oturumu {formatMinutes(session.minutes)} sonra bırakıldı.
              Sorun değil, bir sonraki oturumda yeniden dene!
            </>
          )}
        </p>
        <div className="modal__actions">
          {success && (
            <button className="btn btn--primary" onClick={onBreak}>
              ☕ {breakMinutes} dk mola ver
            </button>
          )}
          <button className="btn btn--ghost" onClick={onGarden}>
            Bahçeme git
          </button>
          <button className="btn btn--ghost" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
