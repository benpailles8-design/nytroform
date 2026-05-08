import { useState } from 'react'
import { X } from 'lucide-react'
import BodySVG from './BodySVG'
import { MUSCLE_GROUPS } from '../data/exercises'

// Test avec une image hardcodée connue pour fonctionner
const TEST_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg'

export default function ExerciseGif({ exerciseId, exerciseName, muscles = [], size = 80, clickable = false }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div onClick={() => clickable && setShowModal(true)}
        style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default', flexShrink: 0 }}>
        <img
          src={TEST_URL}
          alt="test"
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '2px solid red', display: 'block' }}
        />
      </div>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, marginBottom: 16 }}>{exerciseName}</h2>
            <img src={TEST_URL} alt="test" style={{ width: '100%', borderRadius: 12 }} />
            <button onClick={() => setShowModal(false)} style={{ marginTop: 16, width: '100%', padding: 12, background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 14 }}>Fermer</button>
          </div>
        </div>
      )}
    </>
  )
}
