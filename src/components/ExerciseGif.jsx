import { useState, useEffect } from 'react'
import { X, RefreshCw, Lock, Unlock } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

const TERMS = {
  bench_press:      'barbell bench press gym workout',
  incline_bench:    'incline bench press gym',
  decline_bench:    'decline bench press gym',
  db_bench:         'dumbbell bench press gym',
  db_incline:       'incline dumbbell press gym',
  db_flyes:         'dumbbell fly chest gym',
  pushup:           'push ups exercise workout',
  dips_chest:       'chest dips exercise gym',
  cable_crossover:  'cable crossover chest gym',
  deadlift:         'deadlift barbell gym workout',
  pullup:           'pull ups exercise gym',
  lat_pulldown:     'lat pulldown gym exercise',
  seated_row:       'seated cable row gym',
  bent_row:         'barbell row gym exercise',
  db_row:           'dumbbell row back gym',
  hyperextension:   'back extension hyperextension gym',
  face_pull:        'face pull cable gym',
  ohp:              'overhead press barbell gym',
  db_press:         'dumbbell shoulder press gym',
  lateral_raise:    'lateral raise dumbbell gym',
  front_raise:      'front raise dumbbell gym',
  rear_delt:        'rear delt fly gym',
  shrugs:           'barbell shrug traps gym',
  arnold_press:     'arnold press gym',
  upright_row:      'upright row barbell gym',
  barbell_curl:     'barbell curl bicep gym',
  db_curl:          'dumbbell curl bicep gym',
  hammer_curl:      'hammer curl gym',
  preacher_curl:    'preacher curl bicep gym',
  skullcrusher:     'skull crusher tricep gym',
  tricep_pushdown:  'tricep pushdown cable gym',
  overhead_tricep:  'tricep overhead extension gym',
  dips_tricep:      'tricep dips gym workout',
  squat:            'barbell squat gym workout',
  front_squat:      'front squat barbell gym',
  leg_press:        'leg press machine gym',
  leg_extension:    'leg extension machine gym',
  leg_curl:         'lying leg curl machine gym',
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
  jump_rope:        'jump rope exercise workout',
  run:              'running treadmill gym',
  rowing_machine:   'rowing machine exercise gym',
}

// Cache mémoire session
const memCache = {}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const { isCoach } = useAuth()
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(Object.keys(TERMS).indexOf(exerciseId) % 5)
  const [locked, setLocked] = useState(false)
  const [locking, setLocking] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Charger le GIF verrouillé depuis Supabase
    supabase.from('exercise_gifs').select('gif_url, locked').eq('exercise_id', exerciseId).maybeSingle()
      .then(({ data }) => {
        if (data?.locked && data?.gif_url) {
          setUrl(data.gif_url)
          setLocked(true)
          setLoading(false)
        } else {
          fetchGiphy(offset)
        }
      })
  }, [exerciseId])

  async function fetchGiphy(off) {
    setLoading(true)
    const term = TERMS[exerciseId]
    if (!term) { setLoading(false); return }
    try {
      const r = await fetch(`/api/giphy?q=${encodeURIComponent(term)}&offset=${off}`)
      const data = await r.json()
      const gif = data?.data?.[0]?.images?.downsized?.url || data?.data?.[0]?.images?.fixed_height?.url
      setUrl(gif || null)
    } catch { setUrl(null) }
    setLoading(false)
  }

  async function reload() {
    if (locked) return
    const newOffset = offset + 1
    setOffset(newOffset)
    await fetchGiphy(newOffset)
  }

  async function lockGif() {
    if (!url) return
    setLocking(true)
    const { error } = await supabase.from('exercise_gifs').upsert({
      exercise_id: exerciseId,
      gif_url: url,
      locked: true
    }, { onConflict: 'exercise_id' })
    if (error) { alert('Erreur: ' + error.message); setLocking(false); return }
    setLocked(true)
    setLocking(false)
  }

  async function unlockGif() {
    setLocking(true)
    await supabase.from('exercise_gifs').upsert({
      exercise_id: exerciseId,
      gif_url: url,
      locked: false
    }, { onConflict: 'exercise_id' })
    setLocked(false)
    setLocking(false)
  }

  if (!TERMS[exerciseId]) return null

  if (loading) return (
    <div style={{ width: size, height: size, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 14, height: 14, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!url) return null

  return (
    <>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={url}
          alt={exerciseName}
          onClick={() => clickable && setShowModal(true)}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: `2px solid ${locked ? '#06d6a0' : 'var(--border)'}`, display: 'block', cursor: clickable ? 'pointer' : 'default' }}
        />

        {/* Boutons coach */}
        {isCoach && (
          <div style={{ position: 'absolute', bottom: -28, left: 0, display: 'flex', gap: 4 }}>
            {!locked && (
              <button
                onClick={reload}
                title="Recharger un autre GIF"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text2)' }}
              >
                <RefreshCw size={10} /> Autre
              </button>
            )}
            <button
              onClick={locked ? unlockGif : lockGif}
              disabled={locking}
              title={locked ? 'Déverrouiller' : 'Verrouiller ce GIF'}
              style={{ background: locked ? 'rgba(6,214,160,0.15)' : 'var(--bg3)', border: `1px solid ${locked ? '#06d6a0' : 'var(--border)'}`, borderRadius: 6, padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: locked ? '#06d6a0' : 'var(--text2)' }}
            >
              {locked ? <Lock size={10} /> : <Unlock size={10} />}
              {locked ? 'Verrouillé' : 'Verrouiller'}
            </button>
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
            {isCoach && (
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                {!locked && (
                  <button onClick={reload} className="btn-ghost" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px' }}>
                    <RefreshCw size={16} /> Autre GIF
                  </button>
                )}
                <button onClick={locked ? unlockGif : lockGif} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: locked ? '#06d6a0' : 'var(--accent)' }}>
                  {locked ? <><Unlock size={16} /> Déverrouiller</> : <><Lock size={16} /> Verrouiller</>}
                </button>
              </div>
            )}
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
