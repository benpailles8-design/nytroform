import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// wger.de - plateforme fitness open source, GIFs animés publics et gratuits
// Les images sont des illustrations animées correctes pour chaque exercice
const WGER_BASE = 'https://wger.de'

// IDs vérifiés sur wger.de/en/exercise/overview/
const WGER_MAP = {
  // POITRINE
  bench_press: 192, incline_bench: 394, decline_bench: 393,
  db_bench: 307, db_incline: 308, db_flyes: 314,
  cable_crossover: 313, pushup: 10, dips_chest: 73, pec_deck: 313,

  // DOS
  deadlift: 241, pullup: 31, lat_pulldown: 102,
  seated_row: 61, bent_row: 63, db_row: 62,
  face_pull: 103, hyperextension: 58, cable_row: 61,

  // ÉPAULES
  ohp: 72, db_press: 77, lateral_raise: 78,
  front_raise: 79, rear_delt: 80, shrugs: 81,
  arnold_press: 77, upright_row: 83,

  // BRAS
  barbell_curl: 90, db_curl: 91, hammer_curl: 92,
  preacher_curl: 90, cable_curl: 90, skullcrusher: 95,
  tricep_pushdown: 96, overhead_tricep: 97, dips_tricep: 73,

  // JAMBES
  squat: 264, front_squat: 265, leg_press: 266,
  leg_extension: 267, leg_curl: 268, rdl: 241,
  lunges: 270, bulgarian_squat: 265, hip_thrust: 272,
  calf_raise: 273, goblet_squat: 264,

  // ABDOS
  crunch: 111, plank: 119, leg_raise: 118,
  russian_twist: 120, mountain_climber: 119,

  // CROSSFIT
  burpee: 10, box_jump: 272, kettlebell_swing: 184,
  thruster: 264, clean: 241, snatch: 241,
  push_press: 72, toes_to_bar: 118, rowing_machine: 61,
  air_squat: 264, ring_dip: 73,
}

const cache = {}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [gifUrl, setGifUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const wgerId = WGER_MAP[exerciseId]
    if (!wgerId) { setLoading(false); return }
    if (cache[exerciseId]) { setGifUrl(cache[exerciseId]); setLoading(false); return }

    fetch(`${WGER_BASE}/api/v2/exerciseimage/?exercise_base=${wgerId}&format=json&language=2&limit=1`)
      .then(r => r.json())
      .then(data => {
        const img = data?.results?.[0]?.image
        if (img) {
          const full = img.startsWith('http') ? img : `${WGER_BASE}${img}`
          cache[exerciseId] = full
          setGifUrl(full)
        }
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
        <img src={gifUrl} alt={exerciseName}
          onError={() => setGifUrl(null)}
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
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, textAlign: 'center' }}>{exerciseName}</h2>
            <img src={gifUrl} alt={exerciseName} style={{ width: '100%', maxWidth: 320, borderRadius: 16, border: '1px solid var(--border)', background: 'white' }} />
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
