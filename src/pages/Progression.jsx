import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, TrendingUp, Dumbbell, Ruler, Search } from 'lucide-react'


const MEASUREMENTS_LABELS = [
  { key: 'weight', label: 'Poids', unit: 'kg' },
  { key: 'height', label: 'Taille', unit: 'cm' },
  { key: 'body_fat', label: 'Masse grasse', unit: '%' },
  { key: 'muscle_mass', label: 'Masse musculaire', unit: 'kg' },
  { key: 'chest_circ', label: 'Tour de poitrine', unit: 'cm' },
  { key: 'waist_circ', label: 'Tour de taille', unit: 'cm' },
  { key: 'hip_circ', label: 'Tour de hanches', unit: 'cm' },
  { key: 'bicep_circ', label: 'Tour de bras', unit: 'cm' },
  { key: 'thigh_circ', label: 'Tour de cuisse', unit: 'cm' },
  { key: 'calf_circ', label: 'Tour de mollet', unit: 'cm' },
  { key: 'shoulder_width', label: 'Largeur épaules', unit: 'cm' },
  { key: 'forearm_circ', label: 'Tour avant-bras', unit: 'cm' },
]

function LineChart({ data, color = '#e63946', unit = '' }) {
  if (!data || data.length < 2) return (
    <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: 13 }}>
      Pas assez de données
    </div>
  )

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 300, H = 100
  const padX = 10, padY = 10

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (W - padX * 2)
    const y = H - padY - ((d.value - min) / range) * (H - padY * 2)
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`

  const trend = values[values.length - 1] - values[0]
  const trendColor = trend > 0 ? '#06d6a0' : trend < 0 ? '#e63946' : 'var(--text2)'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase' }}>Actuel</p>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--text)', lineHeight: 1 }}>
              {values[values.length - 1]} <span style={{ fontSize: 12 }}>{unit}</span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase' }}>Évolution</p>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: trendColor, lineHeight: 1 }}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)} <span style={{ fontSize: 12 }}>{unit}</span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase' }}>Min / Max</p>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4 }}>
              {min} / {max} {unit}
            </p>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={120} style={{ overflow: 'visible' }}>
        {/* Grid */}
        {[0, 0.5, 1].map((t, i) => (
          <line key={i} x1={padX} y1={padY + t * (H - padY * 2)} x2={W - padX} y2={padY + t * (H - padY * 2)}
            stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
        ))}
        {/* Area */}
        <path d={areaD} fill={color} opacity="0.08" />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill={color} />
            {i === points.length - 1 && (
              <circle cx={p.x} cy={p.y} r={7} fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
            )}
          </g>
        ))}
      </svg>

      {/* Dates */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text2)' }}>
          {new Date(data[0].date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text2)' }}>
          {new Date(data[data.length - 1].date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function MeasurementsTab({ userId }) {
  const [measurements, setMeasurements] = useState([])
  const [selected, setSelected] = useState('weight')

  useEffect(() => {
    supabase.from('measurements').select('*').eq('user_id', userId).order('date').then(({ data }) => setMeasurements(data || []))
  }, [userId])

  const available = MEASUREMENTS_LABELS.filter(m => measurements.some(e => e[m.key] != null))

  const chartData = measurements
    .filter(m => m[selected] != null)
    .map(m => ({ value: parseFloat(m[selected]), date: m.date }))

  const selectedLabel = MEASUREMENTS_LABELS.find(m => m.key === selected)

  return (
    <div>
      {available.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)' }}>
          <Ruler size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p>Aucune mensuration enregistrée</p>
        </div>
      ) : (
        <>
          {/* Sélecteur */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {available.map(m => (
              <button key={m.key} onClick={() => setSelected(m.key)} style={{
                background: selected === m.key ? 'var(--accent)' : 'var(--bg3)',
                border: `1px solid ${selected === m.key ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 20, padding: '5px 12px', fontSize: 12,
                color: 'var(--text)', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Graphique */}
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
              {selectedLabel?.label} ({selectedLabel?.unit})
            </p>
            <LineChart data={chartData} color="#e63946" unit={selectedLabel?.unit} />
          </div>
        </>
      )}
    </div>
  )
}

function ExercisesTab({ userId }) {
  const [sessions, setSessions] = useState([])
  const [allWeights, setAllWeights] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data: sessionsData } = await supabase.from('sessions').select('*').eq('client_id', userId)
      setSessions(sessionsData || [])
      const { data: weightsData } = await supabase.from('session_weights').select('*').eq('client_id', userId).order('created_at')
      setAllWeights(weightsData || [])
    }
    load()
  }, [userId])

  // Construire la liste de tous les exercices avec leurs données
  const exerciseMap = {}
  sessions.forEach(session => {
    const exercises = JSON.parse(session.exercises || '[]')
    exercises.forEach((block, blockIdx) => {
      const exoId = block.exercise.id
      const exoName = block.exercise.name
      if (!exerciseMap[exoId]) exerciseMap[exoId] = { name: exoName, data: [] }

      // Trouver les poids pour cette session
      const weightEntry = allWeights.find(w => w.session_id === session.id)
      if (weightEntry) {
        const weights = JSON.parse(weightEntry.weights || '{}')
        block.sets.forEach((set, setIdx) => {
          const key = `${blockIdx}_${setIdx}`
          const w = parseFloat(weights[key])
          if (w > 0) {
            exerciseMap[exoId].data.push({
              value: w,
              reps: set.reps,
              date: weightEntry.updated_at || weightEntry.created_at,
              session: session.name
            })
          }
        })
      }
    })
  })

  const exerciseList = Object.entries(exerciseMap)
    .filter(([, v]) => v.data.length > 0)
    .filter(([, v]) => v.name.toLowerCase().includes(search.toLowerCase()))

  const selectedData = selectedExercise ? exerciseMap[selectedExercise]?.data : null

  // Grouper par date (max poids par date)
  const chartData = selectedData ? Object.values(
    selectedData.reduce((acc, d) => {
      const date = d.date.split('T')[0]
      if (!acc[date] || d.value > acc[date].value) acc[date] = { value: d.value, date }
      return acc
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date)) : []

  return (
    <div>
      {exerciseList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)' }}>
          <Dumbbell size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p>Aucun poids enregistré pour le moment</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>Commence à logger tes poids dans tes séances</p>
        </div>
      ) : (
        <>
          {/* Recherche */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un exercice..." style={{ paddingLeft: 34, fontSize: 13 }} />
          </div>

          {/* Liste exercices */}
          {!selectedExercise ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exerciseList.map(([id, ex]) => {
                const lastWeight = ex.data[ex.data.length - 1]?.value
                const firstWeight = ex.data[0]?.value
                const diff = lastWeight - firstWeight
                return (
                  <div key={id} className="card" onClick={() => setSelectedExercise(id)}
                    style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{ex.data.length} entrée{ex.data.length > 1 ? 's' : ''}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--accent)' }}>{lastWeight} kg</p>
                      {diff !== 0 && (
                        <p style={{ fontSize: 11, color: diff > 0 ? '#06d6a0' : '#e63946', fontWeight: 700 }}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedExercise(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                <ChevronLeft size={16} /> Retour
              </button>
              <div className="card" style={{ padding: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{exerciseMap[selectedExercise]?.name}</p>
                <LineChart data={chartData} color="#e63946" unit="kg" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Progression() {
  const { user, isCoach } = useAuth()
  const [tab, setTab] = useState('exercises')
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isCoach) {
      supabase.from('profiles').select('id, full_name').eq('role', 'client').then(({ data }) => setClients(data || []))
    }
  }, [isCoach])

  const targetId = isCoach ? selectedClient?.id : user.id
  const avatarColor = (name) => `hsl(${(name?.charCodeAt(0) || 0) * 15 % 360}, 60%, 35%)`
  const filteredClients = clients.filter(c => c.full_name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: '0 0 100px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          {isCoach && selectedClient && (
            <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 0 }}>
              <ChevronLeft size={24} />
            </button>
          )}
          <div>
            <h1 style={{ fontSize: 36, lineHeight: 1 }}>PROGRESSION</h1>
            {isCoach && selectedClient && <p style={{ color: 'var(--accent)', fontSize: 13 }}>{selectedClient.full_name}</p>}
          </div>
        </div>
      </div>

      {/* Coach : liste clients */}
      {isCoach && !selectedClient && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..." style={{ paddingLeft: 34 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredClients.map(client => (
              <div key={client.id} className="card" onClick={() => setSelectedClient(client)}
                style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor(client.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 20, flexShrink: 0 }}>
                  {client.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <p style={{ fontWeight: 700 }}>{client.full_name}</p>
                <TrendingUp size={16} style={{ color: 'var(--text2)', marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue progression */}
      {(!isCoach || selectedClient) && targetId && (
        <div style={{ padding: '0 16px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button onClick={() => setTab('exercises')} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
              background: tab === 'exercises' ? 'var(--accent)' : 'var(--bg3)',
              color: tab === 'exercises' ? 'white' : 'var(--text2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              <Dumbbell size={15} /> Exercices
            </button>
            <button onClick={() => setTab('measurements')} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
              background: tab === 'measurements' ? 'var(--accent)' : 'var(--bg3)',
              color: tab === 'measurements' ? 'white' : 'var(--text2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              <Ruler size={15} /> Mensurations
            </button>
          </div>

          {tab === 'exercises' && <ExercisesTab userId={targetId} />}
          {tab === 'measurements' && <MeasurementsTab userId={targetId} />}
        </div>
      )}
    </div>
  )
}
