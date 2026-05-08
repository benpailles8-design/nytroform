import { useState } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// GIFs depuis free-exercise-db (GitHub Pages) - open source, domaine public
// https://github.com/yuhonas/free-exercise-db
const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

const GIF_URLS = {
  // POITRINE
  bench_press:         `${BASE}/Barbell_Bench_Press_-_Medium_Grip/images/0.jpg`,
  incline_bench:       `${BASE}/Barbell_Incline_Bench_Press_-_Medium_Grip/images/0.jpg`,
  decline_bench:       `${BASE}/Barbell_Decline_Bench_Press/images/0.jpg`,
  db_bench:            `${BASE}/Dumbbell_Bench_Press/images/0.jpg`,
  db_incline:          `${BASE}/Dumbbell_Incline_Bench_Press/images/0.jpg`,
  db_flyes:            `${BASE}/Dumbbell_Flyes/images/0.jpg`,
  cable_crossover:     `${BASE}/Cable_Crossover/images/0.jpg`,
  pushup:              `${BASE}/Pushups/images/0.jpg`,
  dips_chest:          `${BASE}/Dips_-_Chest_Version/images/0.jpg`,
  pec_deck:            `${BASE}/Pec_Deck_Fly/images/0.jpg`,
  chest_press_machine: `${BASE}/Barbell_Bench_Press_-_Medium_Grip/images/0.jpg`,

  // DOS
  deadlift:            `${BASE}/Barbell_Deadlift/images/0.jpg`,
  pullup:              `${BASE}/Pullups/images/0.jpg`,
  lat_pulldown:        `${BASE}/Wide-Grip_Lat_Pulldown/images/0.jpg`,
  seated_row:          `${BASE}/Seated_Cable_Rows/images/0.jpg`,
  bent_row:            `${BASE}/Barbell_Bent_Over_Row/images/0.jpg`,
  db_row:              `${BASE}/Dumbbell_Bent_Over_Row/images/0.jpg`,
  face_pull:           `${BASE}/Face_Pull/images/0.jpg`,
  hyperextension:      `${BASE}/Hyperextensions_With_No_Hyperextension_Bench/images/0.jpg`,
  rack_pull:           `${BASE}/Rack_Pull/images/0.jpg`,
  cable_row:           `${BASE}/Seated_Cable_Rows/images/0.jpg`,

  // ÉPAULES
  ohp:                 `${BASE}/Barbell_Shoulder_Press/images/0.jpg`,
  db_press:            `${BASE}/Dumbbell_Shoulder_Press/images/0.jpg`,
  lateral_raise:       `${BASE}/Side_Lateral_Raise/images/0.jpg`,
  front_raise:         `${BASE}/Dumbbell_Alternate_Front_Raise/images/0.jpg`,
  rear_delt:           `${BASE}/Seated_Bent-Over_Rear_Delt_Raise/images/0.jpg`,
  shrugs:              `${BASE}/Barbell_Shrug/images/0.jpg`,
  arnold_press:        `${BASE}/Arnold_Dumbbell_Press/images/0.jpg`,
  upright_row:         `${BASE}/Barbell_Upright_Row/images/0.jpg`,

  // BICEPS
  barbell_curl:        `${BASE}/Barbell_Curl/images/0.jpg`,
  db_curl:             `${BASE}/Dumbbell_Bicep_Curl/images/0.jpg`,
  hammer_curl:         `${BASE}/Hammer_Curls/images/0.jpg`,
  preacher_curl:       `${BASE}/Preacher_Curl/images/0.jpg`,
  cable_curl:          `${BASE}/Cable_Curl/images/0.jpg`,

  // TRICEPS
  skullcrusher:        `${BASE}/Barbell_Skullcrusher/images/0.jpg`,
  tricep_pushdown:     `${BASE}/Triceps_Pushdown/images/0.jpg`,
  overhead_tricep:     `${BASE}/Dumbbell_One_Arm_Triceps_Extension/images/0.jpg`,
  dips_tricep:         `${BASE}/Dips_-_Triceps_Version/images/0.jpg`,
  wrist_curl:          `${BASE}/Palms_Up_Barbell_Wrist_Curl_Over_A_Bench/images/0.jpg`,

  // JAMBES
  squat:               `${BASE}/Barbell_Full_Squat/images/0.jpg`,
  front_squat:         `${BASE}/Barbell_Front_Squat/images/0.jpg`,
  leg_press:           `${BASE}/Leg_Press/images/0.jpg`,
  leg_extension:       `${BASE}/Leg_Extensions/images/0.jpg`,
  leg_curl:            `${BASE}/Lying_Leg_Curls/images/0.jpg`,
  rdl:                 `${BASE}/Romanian_Deadlift/images/0.jpg`,
  lunges:              `${BASE}/Barbell_Lunge/images/0.jpg`,
  bulgarian_squat:     `${BASE}/Barbell_Bulgarian_Split_Squat/images/0.jpg`,
  hip_thrust:          `${BASE}/Barbell_Hip_Thrust/images/0.jpg`,
  calf_raise:          `${BASE}/Standing_Calf_Raises/images/0.jpg`,
  goblet_squat:        `${BASE}/Dumbbell_Goblet_Squat/images/0.jpg`,
  sumo_squat:          `${BASE}/Sumo_Squat/images/0.jpg`,

  // ABDOS
  crunch:              `${BASE}/Crunch/images/0.jpg`,
  plank:               `${BASE}/Plank/images/0.jpg`,
  leg_raise:           `${BASE}/Flat_Bench_Lying_Leg_Raise/images/0.jpg`,
  russian_twist:       `${BASE}/Russian_Twist/images/0.jpg`,
  ab_wheel:            `${BASE}/Ab_Wheel_Rollout/images/0.jpg`,
  cable_crunch:        `${BASE}/Cable_Crunch/images/0.jpg`,
  mountain_climber:    `${BASE}/Mountain_Climbers/images/0.jpg`,
  side_plank:          `${BASE}/Side_Plank/images/0.jpg`,

  // HALTÉROPHILIE / CROSSFIT
  clean:               `${BASE}/Power_Clean/images/0.jpg`,
  snatch:              `${BASE}/Snatch/images/0.jpg`,
  clean_jerk:          `${BASE}/Clean_and_Jerk/images/0.jpg`,
  hang_clean:          `${BASE}/Hang_Power_Clean/images/0.jpg`,
  power_clean:         `${BASE}/Power_Clean/images/0.jpg`,
  push_press:          `${BASE}/Push_Press/images/0.jpg`,
  push_jerk:           `${BASE}/Push_Press/images/0.jpg`,
  burpee:              `${BASE}/Burpees/images/0.jpg`,
  box_jump:            `${BASE}/Box_Jump_(Multiple_Response)/images/0.jpg`,
  kettlebell_swing:    `${BASE}/Kettlebell_Swing/images/0.jpg`,
  thruster:            `${BASE}/Barbell_Thruster/images/0.jpg`,
  wall_ball:           `${BASE}/Wall_Ball/images/0.jpg`,
  muscle_up:           `${BASE}/Muscle_Up/images/0.jpg`,
  toes_to_bar:         `${BASE}/Hanging_Leg_Raise/images/0.jpg`,
  rowing_machine:      `${BASE}/Rowing,_Seated/images/0.jpg`,
  air_squat:           `${BASE}/Barbell_Full_Squat/images/0.jpg`,
  kb_goblet:           `${BASE}/Dumbbell_Goblet_Squat/images/0.jpg`,
  ring_dip:            `${BASE}/Dips_-_Triceps_Version/images/0.jpg`,
  ghd_situp:           `${BASE}/Sit-Up/images/0.jpg`,
  double_under:        `${BASE}/Jump_Rope/images/0.jpg`,
  handstand_pushup:    `${BASE}/Handstand_Push-up/images/0.jpg`,
  jump_rope:           `${BASE}/Jump_Rope/images/0.jpg`,
  run:                 `${BASE}/Running,_Treadmill/images/0.jpg`,
  bike:                `${BASE}/Stationary_Bike_Run,_Cross_Trainer/images/0.jpg`,

  // ÉTIREMENTS
  hamstring_stretch:   `${BASE}/Standing_Hamstring_Stretch/images/0.jpg`,
  quad_stretch:        `${BASE}/Standing_Quadriceps_Stretch/images/0.jpg`,
  hip_flexor:          `${BASE}/Hip_Flexor_Stretch/images/0.jpg`,
  child_pose:          `${BASE}/Child's_Pose/images/0.jpg`,
  cat_cow:             `${BASE}/Cat_Stretch/images/0.jpg`,
}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [imgOk, setImgOk] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const gifUrl = GIF_URLS[exerciseId]
  if (!gifUrl || !imgOk) return null

  return (
    <>
      <div
        onClick={() => clickable && setShowModal(true)}
        style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}
      >
        <img
          src={gifUrl}
          alt={exerciseName}
          onError={() => setImgOk(false)}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block', background: 'var(--bg3)' }}
        />
        {clickable && (
          <div
            style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.4)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}
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
            <img
              src={gifUrl}
              alt={exerciseName}
              style={{ width: '100%', maxWidth: 320, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg3)' }}
            />
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
