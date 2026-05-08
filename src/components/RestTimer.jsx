import { useState, useEffect, useRef } from 'react'

export default function RestTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [preset, setPreset] = useState(90)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false)
            // Vibration si mobile
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function start(s) {
    setSeconds(s || preset)
    setRunning(true)
  }

  function stop() {
    setRunning(false)
    setSeconds(0)
  }

  const progress = seconds / preset
  const circumference = 2 * Math.PI * 28
  const dashoffset = circumference * (1 - progress)

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="card" style={{ padding: '16px' }}>
      <p style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
        ⏱ Temps de repos
      </p>

      {/* Presets */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {[30, 60, 90, 120, 180].map(s => (
          <button
            key={s}
            onClick={() => { setPreset(s); start(s) }}
            style={{
              background: preset === s && running ? 'var(--accent)' : 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {s >= 60 ? `${s / 60}min` : `${s}s`}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', width: '72px', height: '72px' }}>
          <svg viewBox="0 0 64 64" width="72" height="72">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
            {running && (
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke={seconds < 10 ? '#ff6b6b' : 'var(--accent)'}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            )}
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bebas Neue', fontSize: '18px',
            color: seconds < 10 && running ? 'var(--accent)' : 'var(--text)'
          }}>
            {running ? `${mins}:${secs.toString().padStart(2, '0')}` : '—'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!running ? (
            <button className="btn-primary" onClick={() => start()} style={{ padding: '8px 16px', fontSize: '13px' }}>
              Démarrer
            </button>
          ) : (
            <button className="btn-ghost" onClick={stop} style={{ padding: '8px 16px', fontSize: '13px' }}>
              Arrêter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
