import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// URLs directes des GIFs wger.de - open source, 100% gratuit, pas de clé API
// wger.de est une app fitness open source avec des GIFs animés pour chaque exercice
// Les IDs correspondent aux exercices sur https://wger.de/en/exercise/overview/
const GIFS = {
  // POITRINE
  bench_press:         'https://wger.de/en/exercise/192/view/en',
  incline_bench:       'https://wger.de/en/exercise/394/view/en',
  db_bench:            'https://wger.de/en/exercise/307/view/en',
  db_flyes:            'https://wger.de/en/exercise/314/view/en',
  pushup:              'https://wger.de/en/exercise/10/view/en',
  dips_chest:          'https://wger.de/en/exercise/73/view/en',
  cable_crossover:     'https://wger.de/en/exercise/313/view/en',

  // DOS
  deadlift:            'https://wger.de/en/exercise/241/view/en',
  pullup:              'https://wger.de/en/exercise/31/view/en',
  lat_pulldown:        'https://wger.de/en/exercise/102/view/en',
  seated_row:          'https://wger.de/en/exercise/61/view/en',
  bent_row:            'https://wger.de/en/exercise/63/view/en',
  db_row:              'https://wger.de/en/exercise/62/view/en',
  hyperextension:      'https://wger.de/en/exercise/58/view/en',

  // ÉPAULES
  ohp:                 'https://wger.de/en/exercise/72/view/en',
  db_press:            'https://wger.de/en/exercise/77/view/en',
  lateral_raise:       'https://wger.de/en/exercise/78/view/en',
  front_raise:         'https://wger.de/en/exercise/79/view/en',
  shrugs:              'https://wger.de/en/exercise/81/view/en',
  arnold_press:        'https://wger.de/en/exercise/77/view/en',

  // BRAS
  barbell_curl:        'https://wger.de/en/exercise/90/view/en',
  db_curl:             'https://wger.de/en/exercise/91/view/en',
  hammer_curl:         'https://wger.de/en/exercise/92/view/en',
  skullcrusher:        'https://wger.de/en/exercise/95/view/en',
  tricep_pushdown:     'https://wger.de/en/exercise/96/view/en',
  overhead_tricep:     'https://wger.de/en/exercise/97/view/en',
  dips_tricep:         'https://wger.de/en/exercise/73/view/en',

  // JAMBES
  squat:               'https://wger.de/en/exercise/264/view/en',
  leg_press:           'https://wger.de/en/exercise/266/view/en',
  leg_extension:       'https://wger.de/en/exercise/267/view/en',
  leg_curl:            'https://wger.de/en/exercise/268/view/en',
  rdl:                 'https://wger.de/en/exercise/241/view/en',
  lunges:              'https://wger.de/en/exercise/270/view/en',
  hip_thrust:          'https://wger.de/en/exercise/272/view/en',
  calf_raise:          'https://wger.de/en/exercise/273/view/en',
  goblet_squat:        'https://wger.de/en/exercise/264/view/en',

  // ABDOS
  crunch:              'https://wger.de/en/exercise/111/view/en',
  plank:               'https://wger.de/en/exercise/119/view/en',
  leg_raise:           'https://wger.de/en/exercise/118/view/en',
  russian_twist:       'https://wger.de/en/exercise/120/view/en',
}

// Fetch les images via l'API JSON de wger
const imgCache = {}

function useWgerImage(exerciseId) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!GIFS[exerciseId]) { setLoading(false); return }
    if (imgCache[exerciseId] !== undefined) {
      setUrl(imgCache[exerciseId])
      setLoading(false)
      return
    }

    // On extrait l'ID wger depuis l'URL
    const match = GIFS[exerciseId].match(/\/exercise\/(\d+)\//)
    const wgerId = match?.[1]
    if (!wgerId) { setLoading(false); return }

    fetch(`https://wger.de/api/v2/exerciseimage/?exercise_base=${wgerId}&format=json&limit=5`)
      .then(r => r.json())
      .then(data => {
        const results = data?.results || []
        // Chercher un GIF en priorité
        const gif = results.find(r => r.image?.endsWith('.gif')) || results[0]
        const imgUrl = gif?.image
        if (imgUrl) {
          const full = imgUrl.startsWith('http') ? imgUrl : `https://wger.de${imgUrl}`
          imgCache[exerciseId] = full
          setUrl(full)
        } else {
          imgCache[exerciseId] = null
        }
        setLoading(false)
      })
      .catch(() => { imgCache[exerciseId] = null; setLoading(false) })
  }, [exerciseId])

  return { url, loading }
}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const { url, loading } = useWgerImage(exerciseId)
  const [showModal, setShowModal] = useState(false)

  if (loading) return (
    <div style={{ width: size, height: size, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 14, height: 14, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!url) return null

  return (
    <>
      <div onClick={() => clickable && setShowModal(true)}
        style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}>
        <img src={url} alt={exerciseName}
          style={{ width: size, height: size, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)', display: 'block', background: 'white' }}
          onError={e => e.target.style.display = 'none'}
        />
        {clickable && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.45)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}
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
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, textAlign: 'center' }}>{exerciseName}</h2>
            <img src={url} alt={exerciseName} style={{ width: '100%', maxWidth: 320, borderRadius: 16, border: '1px solid var(--border)', background: 'white' }} />
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
