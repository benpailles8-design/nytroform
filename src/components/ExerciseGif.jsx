import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

const GIPHY_KEY = '4NOdh7kSngAWsGcVu3lcjQ8QT4CiT4AF'

const TERMS = {
  bench_press:      'barbell bench press gym',
  incline_bench:    'incline bench press gym',
  decline_bench:    'decline bench press gym',
  db_bench:         'dumbbell bench press gym',
  db_incline:       'incline dumbbell press gym',
  db_flyes:         'dumbbell fly chest gym',
  pushup:           'push ups exercise',
  dips_chest:       'chest dips exercise gym',
  cable_crossover:  'cable crossover chest gym',
  deadlift:         'deadlift barbell gym',
  pullup:           'pull ups exercise gym',
  lat_pulldown:     'lat pulldown gym exercise',
  seated_row:       'seated cable row gym',
  bent_row:         'barbell row gym exercise',
  db_row:           'dumbbell row gym',
  hyperextension:   'back extension gym exercise',
  face_pull:        'face pull cable gym',
  ohp:              'overhead press barbell gym',
  db_press:         'dumbbell shoulder press gym',
  lateral_raise:    'lateral raise dumbbell gym',
  front_raise:      'front raise dumbbell gym',
  rear_delt:        'rear delt fly gym',
  shrugs:           'barbell shrug trap gym',
  arnold_press:     'arnold press gym',
  upright_row:      'upright row barbell gym',
  barbell_curl:     'barbell curl bicep gym',
  db_curl:          'dumbbell curl bicep gym',
  hammer_curl:      'hammer curl gym',
  preacher_curl:    'preacher curl bicep gym',
  skullcrusher:     'skull crusher tricep gym',
  tricep_pushdown:  'tricep pushdown cable gym',
  overhead_tricep:  'tricep overhead extension gym',
  dips_tricep:      'tricep dips gym',
  squat:            'barbell squat gym exercise',
  front_squat:      'front squat barbell gym',
  leg_press:        'leg press machine gym',
  leg_extension:    'leg extension machine gym',
  leg_curl:         'leg curl machine gym',
  rdl:              'romanian deadlift gym',
  lunges:           'barbell lunge gym exercise',
  bulgarian_squat:  'bulgarian split squat gym',
  hip_thrust:       'hip thrust barbell gym',
  calf_raise:       'calf raise gym exercise',
  goblet_squat:     'goblet squat gym',
  crunch:           'crunch abs exercise gym',
  plank:            'plank core exercise',
  leg_raise:        'hanging leg raise gym',
  russian_twist:    'russian twist core gym',
  mountain_climber: 'mountain climber exercise',
  ab_wheel:         'ab wheel rollout gym',
  burpee:           'burpee exercise workout',
  box_jump:         'box jump exercise gym',
  kettlebell_swing: 'kettlebell swing exercise',
  clean:            'power clean barbell gym',
  push_press:       'push press barbell gym',
  thruster:         'thruster barbell crossfit',
  jump_rope:        'jump rope exercise',
  run:              'running treadmill gym',
  rowing_machine:   'rowing machine exercise gym',
}

const cache = {}

function useGiphy(exerciseId) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const term = TERMS[exerciseId]
    if (!term) { setLoading(false); return }
    if (cache[exerciseId] !== undefined) { setUrl(cache[exerciseId]); setLoading(false); return }

    // offset fixe par exercice pour toujours avoir le même résultat
    const offset = Object.keys(TERMS).indexOf(exerciseId) % 5

    fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(term)}&limit=1&offset=${offset}&rating=g&lang=en`)
      .then(r => r.json())
      .then(data => {
        const gif = data?.data?.[0]?.images?.downsized?.url
          || data?.data?.[0]?.images?.fixed_height?.url
        cache[exerciseId] = gif || null
        setUrl(gif || null)
        setLoading(false)
      })
      .catch(() => { cache[exerciseId] = null; setLoading(false) })
  }, [exerciseId])

  return { url, loading }
}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const { url, loading } = useGiphy(exerciseId)
  const [showModal, setShowModal] = useState(false)

  if (!TERMS[exerciseId]) return null

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
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }}
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
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, textAlign: 'center' }}>{exerciseName}</h2>
            <img src={url} alt={exerciseName} style={{ width: '100%', maxWidth: 360, borderRadius: 16, border: '1px solid var(--border)' }} />
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
