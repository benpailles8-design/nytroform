import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, Scale, Ruler, Plus } from 'lucide-react'
import BodySVG from '../components/BodySVG'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [measurements, setMeasurements] = useState([])
  const [newWeight, setNewWeight] = useState('')
  const [newHeight, setNewHeight] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchMeasurements() }, [])

  async function fetchMeasurements() {
    const { data } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setMeasurements(data || [])
  }

  async function addMeasurement() {
    if (!newWeight && !newHeight) return
    await supabase.from('measurements').insert({
      user_id: user.id,
      weight: newWeight ? parseFloat(newWeight) : null,
      height: newHeight ? parseFloat(newHeight) : null,
      date: new Date().toISOString().split('T')[0]
    })
    setNewWeight('')
    setNewHeight('')
    fetchMeasurements()
  }

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    await refreshProfile()
    setEditMode(false)
    setSaving(false)
  }

  const latestWeight = measurements.find(m => m.weight)?.weight
  const latestHeight = measurements.find(m => m.height)?.height
  const bmi = latestWeight && latestHeight ? (latestWeight / Math.pow(latestHeight / 100, 2)).toFixed(1) : null

  // Calcul évolution poids
  const weightHistory = measurements.filter(m => m.weight).slice(0, 10).reverse()
  const maxWeight = Math.max(...weightHistory.map(m => m.weight), 0)
  const minWeight = Math.min(...weightHistory.map(m => m.weight), 999)
  const weightRange = maxWeight - minWeight || 10

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header profil */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '42px', lineHeight: 1 }}>PROFIL</h1>
          <button
            onClick={() => editMode ? saveProfile() : setEditMode(true)}
            className={editMode ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {editMode ? (saving ? 'Sauvegarde...' : 'Sauvegarder') : 'Modifier'}
          </button>
        </div>

        {editMode ? (
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ton nom complet" style={{ fontSize: '16px' }} />
        ) : (
          <p style={{ fontSize: '18px', fontWeight: 600 }}>{profile?.full_name}</p>
        )}
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>{user?.email}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
          <Scale size={16} style={{ color: 'var(--accent)', margin: '0 auto 4px' }} />
          <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '4px' }}>Poids</p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--text)', lineHeight: 1 }}>
            {latestWeight || '—'}
          </p>
          {latestWeight && <p style={{ fontSize: '10px', color: 'var(--text2)' }}>kg</p>}
        </div>
        <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
          <Ruler size={16} style={{ color: 'var(--accent)', margin: '0 auto 4px' }} />
          <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '4px' }}>Taille</p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--text)', lineHeight: 1 }}>
            {latestHeight || '—'}
          </p>
          {latestHeight && <p style={{ fontSize: '10px', color: 'var(--text2)' }}>cm</p>}
        </div>
        <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
          <TrendingUp size={16} style={{ color: 'var(--accent)', margin: '0 auto 4px' }} />
          <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '4px' }}>IMC</p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--text)', lineHeight: 1 }}>
            {bmi || '—'}
          </p>
        </div>
      </div>

      {/* Ajouter mesure */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>AJOUTER UNE MESURE</p>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Poids (kg)</label>
            <input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="75.5" step="0.1" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Taille (cm)</label>
            <input type="number" value={newHeight} onChange={e => setNewHeight(e.target.value)} placeholder="175" />
          </div>
        </div>
        <button className="btn-primary" onClick={addMeasurement} style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Plus size={16} /> Enregistrer
        </button>
      </div>

      {/* Graphique poids */}
      {weightHistory.length > 1 && (
        <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>ÉVOLUTION DU POIDS</p>
          <div style={{ height: '120px', position: 'relative', marginBottom: '8px' }}>
            <svg viewBox={`0 0 ${weightHistory.length * 40} 100`} width="100%" height="120px" preserveAspectRatio="none">
              {/* Grid */}
              {[0, 50, 100].map(y => (
                <line key={y} x1="0" y1={y} x2={weightHistory.length * 40} y2={y} stroke="var(--border)" strokeWidth="0.5" />
              ))}
              {/* Line */}
              <polyline
                points={weightHistory.map((m, i) => {
                  const x = i * 40 + 20
                  const y = 95 - ((m.weight - minWeight) / weightRange) * 90
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Points */}
              {weightHistory.map((m, i) => {
                const x = i * 40 + 20
                const y = 95 - ((m.weight - minWeight) / weightRange) * 90
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="var(--accent)" />
                    <text x={x} y={y - 8} textAnchor="middle" fontSize="8" fill="var(--text2)">{m.weight}</text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {weightHistory.map((m, i) => (
              <span key={i} style={{ fontSize: '10px', color: 'var(--text2)', textAlign: 'center' }}>
                {new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Historique mesures */}
      {measurements.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>HISTORIQUE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {measurements.slice(0, 10).map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < measurements.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '13px', color: 'var(--text2)' }}>
                  {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {m.weight && <span style={{ fontSize: '14px', fontWeight: 600 }}>{m.weight} kg</span>}
                  {m.height && <span style={{ fontSize: '14px', color: 'var(--text2)' }}>{m.height} cm</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
