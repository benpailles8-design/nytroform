import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

const GIPHY_KEY = '4NOdh7kSngAWsGcVu3lcjQ8QT4CiT4AF'

const SEARCH_TERMS = {
  bench_press: 'barbell bench press exercise',
  incline_bench: 'incline bench press exercise',
  decline_bench: 'decline bench press exercise',
  db_bench: 'dumbbell bench press exercise',
  db_incline: 'incline dumbbell press exercise',
  db_flyes: 'dumbbell flyes chest exercise',
  pushup: 'push up exercise workout',
  dips_chest: 'chest dips exercise',
  deadlift: 'barbell deadlift exercise',
  pullup: 'pull up exercise workout',
  lat_pulldown: 'lat pulldown cable exercise',
  seated_row: 'seated cable row exercise',
  bent_row: 'barbell bent over row exercise',
  db_row: 'dumbbell row exercise',
  hyperextension: 'back extension hyperextension exercise',
  face_pull: 'face pull cable exercise',
  ohp: 'overhead press barbell exercise',
  db_press: 'dumbbell shoulder press exercise',
  lateral_raise: 'lateral raise dumbbell exercise',
  front_raise: 'front raise dumbbell exercise',
  rear_delt: 'rear delt fly exercise',
  shrugs: 'barbell shrug exercise',
  arnold_press: 'arnold press exercise',
  upright_row: 'upright row exercise',
  barbell_curl: 'barbell curl bicep exercise',
  db_curl: 'dumbbell curl bicep exercise',
  hammer_curl: 'hammer curl exercise',
  preacher_curl: 'preacher curl exercise',
  cable_curl: 'cable curl bicep exercise',
  skullcrusher: 'skull crusher tricep exercise',
  tricep_pushdown: 'tricep pushdown cable exercise',
  overhead_tricep: 'tricep overhead extension exercise',
  dips_tricep: 'tricep dips exercise',
  squat: 'barbell squat exercise',
  front_squat: 'front squat exercise',
  leg_press: 'leg press machine exercise',
  leg_extension: 'leg extension machine exercise',
  leg_curl: 'leg curl machine exercise',
  rdl: 'romanian deadlift exercise',
  lunges: 'barbell lunge exercise',
  bulgarian_squat: 'bulgarian split squat exercise',
  hip_thrust: 'hip thrust barbell exercise',
  calf_raise: 'calf raise exercise',
  goblet_squat: 'goblet squat exercise',
  crunch: 'crunch ab exercise',
  plank: 'plank exercise core',
  leg_raise: 'hanging leg raise exercise',
  russian_twist: 'russian twist exercise',
  mountain_climber: 'mountain climber exercise',
  ab_wheel: 'ab wheel rollout exercise',
  burpee: 'burpee exercise workout',
  box_jump: 'box jump exercise',
  kettlebell_swing: 'kettlebell swing exercise',
  clean: 'power clean barbell exercise',
  snatch: 'barbell snatch exercise',
  push_press: 'push press exercise',
  thruster: 'barbell thruster exercise',
  jump_rope: 'jump rope exercise',
  run: 'running treadmill exercise',
}

const cache = {}

function useGiphyGif(exerciseId) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!exerciseId || !SEARCH_TERMS[exerciseId]) { setLoading(false); return }
    if (cache[exerciseId] !== undefined) { setUrl(cache[exerciseId]); setLoading(false); return }

    const term = encodeURIComponent(SEARCH_TERMS[exerciseId])
    fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${term}&limit=1&rating=g&lang=en`)
      .then(r => r.json())
      .then(data => {
        const gif = data?.data?.[0]?.images?.fixed_height?.url
        cache[exerciseId] = gif || null
        setUrl(gif || null)
        setLoading(false)
      })
      .catch(() => { cache[exerciseId] = null; setLoading(false) })
  }, [exerciseId])

  return { url, loading }
}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const { url, loading } = useGiphyGif(exerciseId)
  const [showModal, setShowModal] = useState(false)

  if (!SEARCH_TERMS[exerciseId]) return null

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
