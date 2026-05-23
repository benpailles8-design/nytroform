import { useEffect, useRef } from 'react'
import { createBodyHighlighter, ModelType } from 'body-highlighter'

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

function BodyView({ activeMuscles, type, size, label }) {
  const ref = useRef(null)
  const instanceRef = useRef(null)

  const getData = () => {
    const muscles = []
    const seen = new Set()
    activeMuscles.forEach(m => {
      const mapped = MUSCLE_MAP[m] || []
      mapped.forEach(name => {
        if (!seen.has(name)) {
          seen.add(name)
          muscles.push({ muscles: [name], color: '#e63946' })
        }
      })
    })
    return muscles
  }

  useEffect(() => {
    if (!ref.current) return
    if (instanceRef.current) {
      instanceRef.current.update({ data: getData() })
      return
    }
    instanceRef.current = createBodyHighlighter(ref.current, {
      data: getData(),
      type,
      style: { width: size, height: size * 1.6 },
    })
    return () => {
      instanceRef.current?.destroy()
      instanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.update({ data: getData() })
    }
  }, [activeMuscles])

  return (
    <div style={{ textAlign: 'center' }}>
      {label && <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</p>}
      <div ref={ref} />
    </div>
  )
}

export default function BodySVG({ activeMuscles = [], size = 80, showBoth = false }) {
  const BACK_ONLY = ['back', 'lats', 'lower_back', 'hamstrings', 'glutes', 'triceps']
  const FRONT_ONLY = ['chest', 'biceps', 'abs', 'quads', 'obliques', 'forearms']
  const hasBack = activeMuscles.some(m => BACK_ONLY.includes(m))
  const hasFront = activeMuscles.some(m => FRONT_ONLY.includes(m))

  if (showBoth || (hasBack && hasFront)) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <BodyView activeMuscles={activeMuscles} type={ModelType.ANTERIOR} size={size} label="Face" />
        <BodyView activeMuscles={activeMuscles} type={ModelType.POSTERIOR} size={size} label="Dos" />
      </div>
    )
  }

  if (hasBack) {
    return <BodyView activeMuscles={activeMuscles} type={ModelType.POSTERIOR} size={size} label="Dos" />
  }

  return <BodyView activeMuscles={activeMuscles} type={ModelType.ANTERIOR} size={size} label="Face" />
}
