import { useState } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// jsDelivr CDN - sert les fichiers GitHub sans restriction CORS, 100% gratuit
const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises'

const GIF_URLS = {
  bench_press:         `${CDN}/Barbell_Bench_Press_-_Medium_Grip/images/0.jpg`,
  incline_bench:       `${CDN}/Barbell_Incline_Bench_Press_-_Medium_Grip/images/0.jpg`,
  decline_bench:       `${CDN}/Barbell_Decline_Bench_Press/images/0.jpg`,
  db_bench:            `${CDN}/Dumbbell_Bench_Press/images/0.jpg`,
  db_incline:          `${CDN}/Dumbbell_Incline_Bench_Press/images/0.jpg`,
  db_flyes:            `${CDN}/Dumbbell_Flyes/images/0.jpg`,
  cable_crossover:     `${CDN}/Cable_Crossover/images/0.jpg`,
  pushup:              `${CDN}/Pushups/images/0.jpg`,
  dips_chest:          `${CDN}/Dips_-_Chest_Version/images/0.jpg`,
  pec_deck:            `${CDN}/Pec_Deck_Fly/images/0.jpg`,
  chest_press_machine: `${CDN}/Barbell_Bench_Press_-_Medium_Grip/images/0.jpg`,
  deadlift:            `${CDN}/Barbell_Deadlift/images/0.jpg`,
  pullup:              `${CDN}/Pullups/images/0.jpg`,
  lat_pulldown:        `${CDN}/Wide-Grip_Lat_Pulldown/images/0.jpg`,
  seated_row:          `${CDN}/Seated_Cable_Rows/images/0.jpg`,
  bent_row:            `${CDN}/Barbell_Bent_Over_Row/images/0.jpg`,
  db_row:              `${CDN}/Dumbbell_Bent_Over_Row/images/0.jpg`,
  face_pull:           `${CDN}/Face_Pull/images/0.jpg`,
  hyperextension:      `${CDN}/Hyperextensions_With_No_Hyperextension_Bench/images/0.jpg`,
  rack_pull:           `${CDN}/Rack_Pull/images/0.jpg`,
  cable_row:           `${CDN}/Seated_Cable_Rows/images/0.jpg`,
  ohp:                 `${CDN}/Barbell_Shoulder_Press/images/0.jpg`,
  db_press:            `${CDN}/Dumbbell_Shoulder_Press/images/0.jpg`,
  lateral_raise:       `${CDN}/Side_Lateral_Raise/images/0.jpg`,
  front_raise:         `${CDN}/Dumbbell_Alternate_Front_Raise/images/0.jpg`,
  rear_delt:           `${CDN}/Seated_Bent-Over_Rear_Delt_Raise/images/0.jpg`,
  shrugs:              `${CDN}/Barbell_Shrug/images/0.jpg`,
  arnold_press:        `${CDN}/Arnold_Dumbbell_Press/images/0.jpg`,
  upright_row:         `${CDN}/Barbell_Upright_Row/images/0.jpg`,
  barbell_curl:        `${CDN}/Barbell_Curl/images/0.jpg`,
  db_curl:             `${CDN}/Dumbbell_Bicep_Curl/images/0.jpg`,
  hammer_curl:         `${CDN}/Hammer_Curls/images/0.jpg`,
  preacher_curl:       `${CDN}/Preacher_Curl/images/0.jpg`,
  cable_curl:          `${CDN}/Cable_Curl/images/0.jpg`,
  skullcrusher:        `${CDN}/Barbell_Skullcrusher/images/0.jpg`,
  tricep_pushdown:     `${CDN}/Triceps_Pushdown/images/0.jpg`,
  overhead_tricep:     `${CDN}/Dumbbell_One_Arm_Triceps_Extension/images/0.jpg`,
  dips_tricep:         `${CDN}/Dips_-_Triceps_Version/images/0.jpg`,
  wrist_curl:          `${CDN}/Palms_Up_Barbell_Wrist_Curl_Over_A_Bench/images/0.jpg`,
  squat:               `${CDN}/Barbell_Full_Squat/images/0.jpg`,
  front_squat:         `${CDN}/Barbell_Front_Squat/images/0.jpg`,
  leg_press:           `${CDN}/Leg_Press/images/0.jpg`,
  leg_extension:       `${CDN}/Leg_Extensions/images/0.jpg`,
  leg_curl:            `${CDN}/Lying_Leg_Curls/images/0.jpg`,
  rdl:                 `${CDN}/Romanian_Deadlift/images/0.jpg`,
  lunges:              `${CDN}/Barbell_Lunge/images/0.jpg`,
  bulgarian_squat:     `${CDN}/Barbell_Bulgarian_Split_Squat/images/0.jpg`,
  hip_thrust:          `${CDN}/Barbell_Hip_Thrust/images/0.jpg`,
  calf_raise:          `${CDN}/Standing_Calf_Raises/images/0.jpg`,
  goblet_squat:        `${CDN}/Dumbbell_Goblet_Squat/images/0.jpg`,
  sumo_squat:          `${CDN}/Sumo_Squat/images/0.jpg`,
  crunch:              `${CDN}/Crunch/images/0.jpg`,
  plank:               `${CDN}/Plank/images/0.jpg`,
  leg_raise:           `${CDN}/Flat_Bench_Lying_Leg_Raise/images/0.jpg`,
  russian_twist:       `${CDN}/Russian_Twist/images/0.jpg`,
  ab_wheel:            `${CDN}/Ab_Wheel_Rollout/images/0.jpg`,
  cable_crunch:        `${CDN}/Cable_Crunch/images/0.jpg`,
  mountain_climber:    `${CDN}/Mountain_Climbers/images/0.jpg`,
  side_plank:          `${CDN}/Side_Plank/images/0.jpg`,
  clean:               `${CDN}/Power_Clean/images/0.jpg`,
  snatch:              `${CDN}/Snatch/images/0.jpg`,
  clean_jerk:          `${CDN}/Clean_and_Jerk/images/0.jpg`,
  hang_clean:          `${CDN}/Hang_Power_Clean/images/0.jpg`,
  power_clean:         `${CDN}/Power_Clean/images/0.jpg`,
  push_press:          `${CDN}/Push_Press/images/0.jpg`,
  push_jerk:           `${CDN}/Push_Press/images/0.jpg`,
  burpee:              `${CDN}/Burpees/images/0.jpg`,
  box_jump:            `${CDN}/Box_Jump_(Multiple_Response)/images/0.jpg`,
  kettlebell_swing:    `${CDN}/Kettlebell_Swing/images/0.jpg`,
  thruster:            `${CDN}/Barbell_Thruster/images/0.jpg`,
  wall_ball:           `${CDN}/Wall_Ball/images/0.jpg`,
  muscle_up:           `${CDN}/Muscle_Up/images/0.jpg`,
  toes_to_bar:         `${CDN}/Hanging_Leg_Raise/images/0.jpg`,
  rowing_machine:      `${CDN}/Seated_Cable_Rows/images/0.jpg`,
  air_squat:           `${CDN}/Barbell_Full_Squat/images/0.jpg`,
  kb_goblet:           `${CDN}/Dumbbell_Goblet_Squat/images/0.jpg`,
  ring_dip:            `${CDN}/Dips_-_Triceps_Version/images/0.jpg`,
  ghd_situp:           `${CDN}/Sit-Up/images/0.jpg`,
  double_under:        `${CDN}/Jump_Rope/images/0.jpg`,
  handstand_pushup:    `${CDN}/Handstand_Push-up/images/0.jpg`,
  jump_rope:           `${CDN}/Jump_Rope/images/0.jpg`,
  run:                 `${CDN}/Running,_Treadmill/images/0.jpg`,
  hamstring_stretch:   `${CDN}/Standing_Hamstring_Stretch/images/0.jpg`,
  quad_stretch:        `${CDN}/Standing_Quadriceps_Stretch/images/0.jpg`,
  hip_flexor:          `${CDN}/Hip_Flexor_Stretch/images/0.jpg`,
  child_pose:          `${CDN}/Child's_Pose/images/0.jpg`,
  cat_cow:             `${CDN}/Cat_Stretch/images/0.jpg`,
}

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [ok, setOk] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const url = GIF_URLS[exerciseId]
  if (!url || !ok) return null

  return (
    <>
      <div onClick={() => clickable && setShowModal(true)} style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}>
        <img src={url} alt={exerciseName} onError={() => setOk(false)}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block', background: 'var(--bg3)' }}
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
            <img src={url} alt={exerciseName} style={{ width: '100%', maxWidth: 320, borderRadius: 16, border: '1px solid var(--border)' }} />
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
