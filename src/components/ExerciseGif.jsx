import { useState } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// Videos MP4 hébergées sur le repo GitHub
// Pour ajouter un exercice : télécharge la vidéo, renomme-la en [exercise_id].mp4
// et place-la dans public/gifs/
const VIDEO_IDS = [
  'bench_press',
  // Ajoute les IDs ici au fur et à mesure
]

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(false)

  const hasVideo = VIDEO_IDS.includes(exerciseId)
  if (!hasVideo || error) return null

  const url = `/gifs/${exerciseId}.mp4`

  return (
    <>
      <div
        onClick={() => clickable && setShowModal(true)}
        style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}
      >
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setError(true)}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block', background: 'var(--bg3)' }}
        />
        {clickable && (
          <div
            style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.45)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
          >
            <span style={{ fontSize: 22 }}>🔍</span>
          </div>
        )}
      </div>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}>
            <X size={20} />
          </button>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, textAlign: 'center' }}>{exerciseName}</h2>
            <video
              src={url}
              autoPlay loop muted playsInline
              style={{ width: '100%', maxWidth: 360, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg3)' }}
            />
            {muscles.length > 0 && (
              <div className="card" style={{ width: '100%', padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                <BodySVG activeMuscles={muscles} size={70} showBoth={true} />
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Muscles ciblés</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {muscles.map(m => (
                      <span key={m} style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                        {MUSCLE_GROUPS[m]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <p style={{ color: 'var(--text2)', fontSize: 12 }}>Appuie n'importe où pour fermer</p>
          </div>
        </div>
      )}
    </>
  )
}
