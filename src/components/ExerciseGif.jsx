import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// Noms des exercices en anglais pour matcher l'API ExerciseDB
const EXERCISE_NAMES_EN = {
  bench_press: 'barbell bench press',
  incline_bench: 'barbell incline bench press',
  decline_bench: 'barbell decline bench press',
  db_bench: 'dumbbell bench press',
  db_incline: 'dumbbell incline bench press',
  db_flyes: 'dumbbell flyes',
  cable_crossover: 'cable crossover',
  pushup: 'push-up',
  dips_chest: 'chest dip',
  pec_deck: 'pec deck fly',
  chest_press_machine: 'chest press',
  deadlift: 'barbell deadlift',
  pullup: 'pull-up',
  lat_pulldown: 'cable lat pulldown',
  seated_row: 'cable seated row',
  bent_row: 'barbell bent over row',
  db_row: 'dumbbell bent over row',
  face_pull: 'cable face pull',
  hyperextension: 'hyperextensions',
  rack_pull: 'rack pull',
  cable_row: 'cable seated row',
  ohp: 'barbell overhead press',
  db_press: 'dumbbell shoulder press',
  lateral_raise: 'dumbbell lateral raise',
  front_raise: 'dumbbell front raise',
  rear_delt: 'rear delt fly',
  shrugs: 'barbell shrug',
  arnold_press: 'arnold press',
  upright_row: 'barbell upright row',
  barbell_curl: 'barbell curl',
  db_curl: 'dumbbell bicep curl',
  hammer_curl: 'hammer curl',
  preacher_curl: 'preacher curl',
  cable_curl: 'cable curl',
  skullcrusher: 'skull crusher',
  tricep_pushdown: 'triceps pushdown',
  overhead_tricep: 'dumbbell triceps extension',
  dips_tricep: 'triceps dip',
  wrist_curl: 'wrist curl',
  squat: 'barbell squat',
  front_squat: 'barbell front squat',
  leg_press: 'leg press',
  leg_extension: 'leg extension',
  leg_curl: 'lying leg curl',
  rdl: 'romanian deadlift',
  lunges: 'barbell lunge',
  bulgarian_squat: 'bulgarian split squat',
  hip_thrust: 'barbell hip thrust',
  calf_raise: 'standing calf raise',
  goblet_squat: 'dumbbell goblet squat',
  sumo_squat: 'sumo squat',
  crunch: 'crunch',
  plank: 'plank',
  leg_raise: 'hanging leg raise',
  russian_twist: 'russian twist',
  ab_wheel: 'ab wheel rollout',
  cable_crunch: 'cable crunch',
  mountain_climber: 'mountain climber',
  side_plank: 'side plank',
  burpee: 'burpee',
  box_jump: 'box jump',
  kettlebell_swing: 'kettlebell swing',
  thruster: 'barbell thruster',
  clean: 'power clean',
  snatch: 'snatch',
  push_press: 'push press',
  push_jerk: 'push jerk',
  wall_ball: 'wall ball',
  muscle_up: 'muscle up',
  toes_to_bar: 'toes to bar',
  rowing_machine: 'rowing',
  air_squat: 'air squat',
  kb_goblet: 'kettlebell goblet squat',
  ring_dip: 'ring dip',
  ghd_situp: 'sit-up',
  double_under: 'jump rope',
  handstand_pushup: 'handstand push up',
  run: 'run',
  jump_rope: 'jump rope',
}

const cache = {}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [gifUrl, setGifUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!exerciseId) { setLoading(false); return }
    if (cache[exerciseId]) { setGifUrl(cache[exerciseId]); setLoading(false); return }

    const name = EXERCISE_NAMES_EN[exerciseId]
    if (!name) { setLoading(false); return }

    // ExerciseDB public API - gratuite sans clé pour usage limité
    fetch(`https://exercisedb-api.vercel.app/api/v1/exercises/name/${encodeURIComponent(name)}?limit=1`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const exercises = data?.exercises || data
        const gif = Array.isArray(exercises) ? exercises[0]?.gifUrl : null
        if (gif) { cache[exerciseId] = gif; setGifUrl(gif) }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [exerciseId])

  if (loading) return (
    <div style={{ width: size, height: size, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 14, height: 14, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!gifUrl) return null

  return (
    <>
      <div onClick={() => clickable && setShowModal(true)} style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}>
        <img src={gifUrl} alt={exerciseName} style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block', background: 'var(--bg3)' }} />
        {clickable && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.35)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
          >
            <span style={{ fontSize: 20 }}>🔍</span>
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
            <img src={gifUrl} alt={exerciseName} style={{ width: '100%', maxWidth: 320, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg3)' }} />
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
