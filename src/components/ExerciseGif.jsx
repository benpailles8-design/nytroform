import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

const WGER_IDS = {
  bench_press: 192, incline_bench: 394, decline_bench: 393, db_bench: 307,
  db_incline: 308, db_flyes: 314, cable_crossover: 313, pushup: 10,
  dips_chest: 73, pec_deck: 313, chest_press_machine: 307,
  deadlift: 241, pullup: 31, lat_pulldown: 102, seated_row: 61,
  bent_row: 63, db_row: 62, face_pull: 103, hyperextension: 58,
  rack_pull: 241, cable_row: 61,
  ohp: 72, db_press: 77, lateral_raise: 78, front_raise: 79,
  rear_delt: 80, shrugs: 81, arnold_press: 77, upright_row: 83,
  barbell_curl: 90, db_curl: 91, hammer_curl: 92, preacher_curl: 90,
  cable_curl: 90, skullcrusher: 95, tricep_pushdown: 96,
  overhead_tricep: 97, dips_tricep: 73, wrist_curl: 99,
  squat: 264, front_squat: 265, leg_press: 266, leg_extension: 267,
  leg_curl: 268, rdl: 241, lunges: 270, bulgarian_squat: 265,
  hip_thrust: 272, calf_raise: 273, goblet_squat: 264, sumo_squat: 264,
  crunch: 111, plank: 119, leg_raise: 118, russian_twist: 120,
  ab_wheel: 119, cable_crunch: 111, mountain_climber: 119, side_plank: 119,
  burpee: 10, box_jump: 272, kettlebell_swing: 241, thruster: 264,
  clean: 241, snatch: 241, push_press: 72, push_jerk: 72,
  wall_ball: 264, muscle_up: 31, toes_to_bar: 118, rowing_machine: 61,
  air_squat: 264, kb_goblet: 264, ring_dip: 73, ghd_situp: 111,
  double_under: 10, handstand_pushup: 72, run: 10, jump_rope: 10,
}

const gifCache = {}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [gifUrl, setGifUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!exerciseId) { setLoading(false); return }
    if (gifCache[exerciseId]) { setGifUrl(gifCache[exerciseId]); setLoading(false); return }
    const wgerId = WGER_IDS[exerciseId]
    if (!wgerId) { setLoading(false); setError(true); return }
    fetch(`https://wger.de/api/v2/exerciseimage/?exercise_base=${wgerId}&format=json&is_main=True`)
      .then(r => r.json())
      .then(data => {
        const img = data?.results?.[0]?.image
        if (img) { gifCache[exerciseId] = img; setGifUrl(img) }
        else setError(true)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [exerciseId])

  if (loading) return (
    <div style={{ width: size, height: size, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (error || !gifUrl) return null

  return (
    <>
      <div
        onClick={() => clickable && setShowModal(true)}
        style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}
      >
        <img
          src={gifUrl}
          alt={exerciseName}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }}
        />
        {clickable && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 8,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
          >
            <span style={{ fontSize: 22 }}>🔍</span>
          </div>
        )}
      </div>

      {/* Modal plein écran */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <button
            onClick={() => setShowModal(false)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
          >
            <X size={20} />
          </button>

          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* Nom exercice */}
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, textAlign: 'center', letterSpacing: '0.05em' }}>{exerciseName}</h2>

            {/* GIF agrandi */}
            <img
              src={gifUrl}
              alt={exerciseName}
              style={{ width: '100%', maxWidth: 320, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg3)' }}
            />

            {/* Muscles + bonhomme */}
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

            <p style={{ color: 'var(--text2)', fontSize: 12, textAlign: 'center' }}>Appuie n'importe où pour fermer</p>
          </div>
        </div>
      )}
    </>
  )
}
