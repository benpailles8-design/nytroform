import { useState } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

const AVAILABLE = [
  'bench_press','incline_bench','decline_bench','db_bench','db_incline',
  'db_flyes','pushup','dips_chest','deadlift','pullup','lat_pulldown',
  'seated_row','bent_row','db_row','hyperextension','ohp','db_press',
  'lateral_raise','front_raise','shrugs','arnold_press','barbell_curl',
  'db_curl','hammer_curl','preacher_curl','skullcrusher','tricep_pushdown',
  'overhead_tricep','dips_tricep','squat','leg_press','leg_extension',
  'leg_curl','rdl','lunges','hip_thrust','calf_raise','goblet_squat',
  'bulgarian_squat','crunch','plank','leg_raise','russian_twist',
  'mountain_climber','burpee','kettlebell_swing','jump_rope','face_pull',
  'upright_row','box_jump',
]

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [ok, setOk] = useState(true)
  const [showModal, setShowModal] = useState(false)

  if (!AVAILABLE.includes(exerciseId) || !ok) return null

  const url = `/gifs/${exerciseId}.gif`

  return (
    <>
      <div onClick={() => clickable && setShowModal(true)}
        style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}>
        <img
          src={url}
          alt={exerciseName}
          onError={() => setOk(false)}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block', background: 'white' }}
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
            <img src={url} alt={exerciseName} style={{ width: '100%', maxWidth: 360, borderRadius: 16, border: '1px solid var(--border)', background: 'white' }} />
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
