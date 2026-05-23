import { useEffect, useRef } from 'react'
import { default as bodyHighlighter } from 'body-highlighter'

// Mapping des IDs muscles NytroForm vers les IDs body-highlighter
const MUSCLE_MAP = {
  chest:      ['chest'],
  shoulders:  ['front-deltoids', 'back-deltoids'],
  biceps:     ['biceps'],
  triceps:    ['triceps'],
  forearms:   ['forearm'],
  abs:        ['abs'],
  obliques:   ['obliques'],
  traps:      ['trapezius'],
  back:       ['upper-back'],
  lats:       ['upper-back'],
  lower_back: ['lower-back'],
  glutes:     ['gluteal'],
  quads:      ['quadriceps'],
  hamstrings: ['hamstring'],
  calves:     ['calves'],
}

function BodyHighlight({ activeMuscles, side, size }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''

    const muscles = []
    activeMuscles.forEach(m => {
      const mapped = MUSCLE_MAP[m] || []
      mapped.forEach(name => {
        muscles.push({ muscles: [name], color: '#e63946' })
      })
    })

    try {
      bodyHighlighter(ref.current, {
        data: muscles,
        side,
        width: size,
        height: size * 1.6,
        style: {
          highlightedMuscleColor: '#e63946',
        }
      })
    } catch (e) {
      console.error('body-highlighter error:', e)
    }
  }, [activeMuscles, side, size])

  return <div ref={ref} />
}

export default function BodySVG({ activeMuscles = [], size = 80, showBoth = false }) {
  const BACK_ONLY = ['back', 'lats', 'lower_back', 'hamstrings', 'glutes', 'triceps']
  const FRONT_ONLY = ['chest', 'biceps', 'abs', 'quads', 'obliques', 'forearms']
  const hasBack = activeMuscles.some(m => BACK_ONLY.includes(m))
  const hasFront = activeMuscles.some(m => FRONT_ONLY.includes(m))

  if (showBoth || (hasBack && hasFront)) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Face</p>
          <BodyHighlight activeMuscles={activeMuscles} side="front" size={size} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Dos</p>
          <BodyHighlight activeMuscles={activeMuscles} side="back" size={size} />
        </div>
      </div>
    )
  }

  if (hasBack) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '2px' }}>Dos</p>
        <BodyHighlight activeMuscles={activeMuscles} side="back" size={size} />
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '2px' }}>Face</p>
      <BodyHighlight activeMuscles={activeMuscles} side="front" size={size} />
    </div>
  )
}
