import { useState } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// IDs Giphy fixes - vrais humains faisant les exercices correctement
// Format: https://media.giphy.com/media/[ID]/giphy.gif
const GIPHY_IDS = {
  // POITRINE
  bench_press:      'l0HlymHMgW3YwNMre',
  incline_bench:    'xT9IgzoKnwFNmISR8I',
  decline_bench:    'l0HlymHMgW3YwNMre',
  db_bench:         'l0HlymHMgW3YwNMre',
  db_incline:       'xT9IgzoKnwFNmISR8I',
  db_flyes:         '26BRzozg4TCBXv6QU',
  pushup:           'tGCbcNXkBMOEqnEdvP',
  dips_chest:       'l4FGrYKtP0pBGpBAA',
  cable_crossover:  '26BRzozg4TCBXv6QU',

  // DOS
  deadlift:         'l3vRfDn9ca5PnWNhS',
  pullup:           'l0HlHqfn0rkXxKRnW',
  lat_pulldown:     '3o7TKtnuHOHHUjR38Y',
  seated_row:       '3o7TKtnuHOHHUjR38Y',
  bent_row:         'l3vRfDn9ca5PnWNhS',
  db_row:           '3o7TKtnuHOHHUjR38Y',
  hyperextension:   'xT9IgD5Zp9RFiSGQcM',
  face_pull:        '3o7TKtnuHOHHUjR38Y',

  // ÉPAULES
  ohp:              'xT9IgzoKnwFNmISR8I',
  db_press:         'xT9IgzoKnwFNmISR8I',
  lateral_raise:    '3o7TKSjRrfIPjeiVyM',
  front_raise:      '3o7TKSjRrfIPjeiVyM',
  rear_delt:        '3o7TKSjRrfIPjeiVyM',
  shrugs:           'xT9IgzoKnwFNmISR8I',
  arnold_press:     'xT9IgzoKnwFNmISR8I',
  upright_row:      'xT9IgzoKnwFNmISR8I',

  // BICEPS
  barbell_curl:     'l0HlPystfeSHPerBe',
  db_curl:          'l0HlPystfeSHPerBe',
  hammer_curl:      'l0HlPystfeSHPerBe',
  preacher_curl:    'l0HlPystfeSHPerBe',
  cable_curl:       'l0HlPystfeSHPerBe',

  // TRICEPS
  skullcrusher:     'l4FGrYKtP0pBGpBAA',
  tricep_pushdown:  'l4FGrYKtP0pBGpBAA',
  overhead_tricep:  'l4FGrYKtP0pBGpBAA',
  dips_tricep:      'l4FGrYKtP0pBGpBAA',

  // JAMBES
  squat:            'l0HlBO0W2eXTDEVIA',
  front_squat:      'l0HlBO0W2eXTDEVIA',
  leg_press:        'l0HlBO0W2eXTDEVIA',
  leg_extension:    'l0HlBO0W2eXTDEVIA',
  leg_curl:         'xT9IgD5Zp9RFiSGQcM',
  rdl:              'l3vRfDn9ca5PnWNhS',
  lunges:           'l0HlBO0W2eXTDEVIA',
  bulgarian_squat:  'l0HlBO0W2eXTDEVIA',
  hip_thrust:       'xT9IgD5Zp9RFiSGQcM',
  calf_raise:       'l0HlBO0W2eXTDEVIA',
  goblet_squat:     'l0HlBO0W2eXTDEVIA',

  // ABDOS
  crunch:           'xT9IgD5Zp9RFiSGQcM',
  plank:            'xT9IgD5Zp9RFiSGQcM',
  leg_raise:        'xT9IgD5Zp9RFiSGQcM',
  russian_twist:    'xT9IgD5Zp9RFiSGQcM',
  mountain_climber: 'tGCbcNXkBMOEqnEdvP',
  ab_wheel:         'xT9IgD5Zp9RFiSGQcM',

  // CROSSFIT
  burpee:           'tGCbcNXkBMOEqnEdvP',
  box_jump:         'tGCbcNXkBMOEqnEdvP',
  kettlebell_swing: 'l3vRfDn9ca5PnWNhS',
  clean:            'l3vRfDn9ca5PnWNhS',
  snatch:           'l3vRfDn9ca5PnWNhS',
  push_press:       'xT9IgzoKnwFNmISR8I',
  thruster:         'l0HlBO0W2eXTDEVIA',
  jump_rope:        'tGCbcNXkBMOEqnEdvP',
  run:              'tGCbcNXkBMOEqnEdvP',
  rowing_machine:   '3o7TKtnuHOHHUjR38Y',
}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [showModal, setShowModal] = useState(false)
  const [ok, setOk] = useState(true)

  const gifId = GIPHY_IDS[exerciseId]
  if (!gifId || !ok) return null

  const url = `https://media.giphy.com/media/${gifId}/giphy.gif`

  return (
    <>
      <div onClick={() => clickable && setShowModal(true)}
        style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}>
        <img src={url} alt={exerciseName}
          onError={() => setOk(false)}
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
