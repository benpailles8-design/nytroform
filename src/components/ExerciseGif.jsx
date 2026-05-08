import { useState } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// GIFs depuis Musclewiki - publics et gratuits
const MW = 'https://musclewiki.com/media/uploads/males/gif'
const MW2 = 'https://musclewiki.com/media/uploads'

const GIF_URLS = {
  // POITRINE
  bench_press:         `${MW}/chest/male-barbell-bench-press-chest.gif`,
  incline_bench:       `${MW}/chest/male-barbell-incline-bench-press-chest.gif`,
  decline_bench:       `${MW}/chest/male-barbell-decline-bench-press-chest.gif`,
  db_bench:            `${MW}/chest/male-dumbbell-bench-press-chest.gif`,
  db_incline:          `${MW}/chest/male-dumbbell-incline-bench-press-chest.gif`,
  db_flyes:            `${MW}/chest/male-dumbbell-fly-chest.gif`,
  cable_crossover:     `${MW}/chest/male-cable-crossover-chest.gif`,
  pushup:              `${MW}/chest/male-push-up-chest.gif`,
  dips_chest:          `${MW}/chest/male-chest-dip-chest.gif`,
  pec_deck:            `${MW}/chest/male-pec-deck-fly-chest.gif`,

  // DOS
  deadlift:            `${MW}/hamstrings/male-barbell-deadlift-hamstrings.gif`,
  pullup:              `${MW}/lats/male-pull-up-lats.gif`,
  lat_pulldown:        `${MW}/lats/male-cable-lat-pulldown-lats.gif`,
  seated_row:          `${MW}/middle-back/male-cable-seated-row-middle-back.gif`,
  bent_row:            `${MW}/middle-back/male-barbell-bent-over-row-middle-back.gif`,
  db_row:              `${MW}/lats/male-dumbbell-row-lats.gif`,
  face_pull:           `${MW}/shoulders/male-cable-face-pull-shoulders.gif`,
  hyperextension:      `${MW}/lower-back/male-back-extension-lower-back.gif`,
  cable_row:           `${MW}/middle-back/male-cable-seated-row-middle-back.gif`,

  // ÉPAULES
  ohp:                 `${MW}/shoulders/male-barbell-overhead-press-shoulders.gif`,
  db_press:            `${MW}/shoulders/male-dumbbell-shoulder-press-shoulders.gif`,
  lateral_raise:       `${MW}/shoulders/male-dumbbell-lateral-raise-shoulders.gif`,
  front_raise:         `${MW}/shoulders/male-dumbbell-front-raise-shoulders.gif`,
  rear_delt:           `${MW}/shoulders/male-dumbbell-reverse-fly-shoulders.gif`,
  shrugs:              `${MW}/traps/male-barbell-shrug-traps.gif`,
  arnold_press:        `${MW}/shoulders/male-dumbbell-arnold-press-shoulders.gif`,
  upright_row:         `${MW}/shoulders/male-barbell-upright-row-shoulders.gif`,

  // BICEPS
  barbell_curl:        `${MW}/biceps/male-barbell-curl-biceps.gif`,
  db_curl:             `${MW}/biceps/male-dumbbell-curl-biceps.gif`,
  hammer_curl:         `${MW}/biceps/male-dumbbell-hammer-curl-biceps.gif`,
  preacher_curl:       `${MW}/biceps/male-barbell-preacher-curl-biceps.gif`,
  cable_curl:          `${MW}/biceps/male-cable-curl-biceps.gif`,

  // TRICEPS
  skullcrusher:        `${MW}/triceps/male-barbell-skull-crusher-triceps.gif`,
  tricep_pushdown:     `${MW}/triceps/male-cable-pushdown-triceps.gif`,
  overhead_tricep:     `${MW}/triceps/male-dumbbell-overhead-extension-triceps.gif`,
  dips_tricep:         `${MW}/triceps/male-tricep-dip-triceps.gif`,
  wrist_curl:          `${MW}/forearms/male-barbell-wrist-curl-forearms.gif`,

  // JAMBES
  squat:               `${MW}/quads/male-barbell-squat-quads.gif`,
  front_squat:         `${MW}/quads/male-barbell-front-squat-quads.gif`,
  leg_press:           `${MW}/quads/male-leg-press-quads.gif`,
  leg_extension:       `${MW}/quads/male-leg-extension-quads.gif`,
  leg_curl:            `${MW}/hamstrings/male-lying-leg-curl-hamstrings.gif`,
  rdl:                 `${MW}/hamstrings/male-barbell-romanian-deadlift-hamstrings.gif`,
  lunges:              `${MW}/quads/male-barbell-lunge-quads.gif`,
  bulgarian_squat:     `${MW}/quads/male-dumbbell-bulgarian-split-squat-quads.gif`,
  hip_thrust:          `${MW}/glutes/male-barbell-hip-thrust-glutes.gif`,
  calf_raise:          `${MW}/calves/male-standing-calf-raise-calves.gif`,
  goblet_squat:        `${MW}/quads/male-dumbbell-goblet-squat-quads.gif`,
  sumo_squat:          `${MW}/quads/male-barbell-sumo-squat-quads.gif`,

  // ABDOS
  crunch:              `${MW}/abdominals/male-crunch-abdominals.gif`,
  plank:               `${MW}/abdominals/male-plank-abdominals.gif`,
  leg_raise:           `${MW}/abdominals/male-hanging-leg-raise-abdominals.gif`,
  russian_twist:       `${MW}/abdominals/male-russian-twist-abdominals.gif`,
  ab_wheel:            `${MW}/abdominals/male-ab-wheel-rollout-abdominals.gif`,
  cable_crunch:        `${MW}/abdominals/male-cable-crunch-abdominals.gif`,
  mountain_climber:    `${MW}/abdominals/male-mountain-climber-abdominals.gif`,
  side_plank:          `${MW}/abdominals/male-side-plank-abdominals.gif`,

  // CROSSFIT / HALTERO
  clean:               `${MW}/hamstrings/male-barbell-power-clean-hamstrings.gif`,
  push_press:          `${MW}/shoulders/male-barbell-push-press-shoulders.gif`,
  thruster:            `${MW}/shoulders/male-barbell-thruster-shoulders.gif`,
  kettlebell_swing:    `${MW}/hamstrings/male-kettlebell-swing-hamstrings.gif`,
  box_jump:            `${MW}/quads/male-box-jump-quads.gif`,
  burpee:              `${MW}/quads/male-burpee-quads.gif`,
  toes_to_bar:         `${MW}/abdominals/male-toes-to-bar-abdominals.gif`,
  rowing_machine:      `${MW}/middle-back/male-rowing-machine-middle-back.gif`,
  jump_rope:           `${MW}/calves/male-jump-rope-calves.gif`,
}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [ok, setOk] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const url = GIF_URLS[exerciseId]

  if (!url || !ok) return null

  return (
    <>
      <div onClick={() => clickable && setShowModal(true)}
        style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}>
        <img src={url} alt={exerciseName}
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
