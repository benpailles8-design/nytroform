import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, TrendingUp, ChevronDown, ChevronUp, Save } from 'lucide-react'

const MEASUREMENTS_FIELDS = [
  { key: 'weight', label: 'Poids', unit: 'kg', icon: '⚖️', category: 'Corps' },
  { key: 'height', label: 'Taille', unit: 'cm', icon: '📏', category: 'Corps' },
  { key: 'body_fat', label: 'Masse grasse', unit: '%', icon: '🔥', category: 'Corps' },
  { key: 'muscle_mass', label: 'Masse musculaire', unit: 'kg', icon: '💪', category: 'Corps' },
  { key: 'chest_circ', label: 'Tour de poitrine', unit: 'cm', icon: '📐', category: 'Mensurations' },
  { key: 'waist_circ', label: 'Tour de taille', unit: 'cm', icon: '📐', category: 'Mensurations' },
  { key: 'hip_circ', label: 'Tour de hanches', unit: 'cm', icon: '📐', category: 'Mensurations' },
  { key: 'bicep_circ', label: 'Tour de bras (biceps)', unit: 'cm', icon: '📐', category: 'Mensurations' },
  { key: 'thigh_circ', label: 'Tour de cuisse', unit: 'cm', icon: '📐', category: 'Mensurations' },
  { key: 'calf_circ', label: 'Tour de mollet', unit: 'cm', icon: '📐', category: 'Mensurations' },
  { key: 'shoulder_width', label: 'Largeur épaules', unit: 'cm', icon: '📐', category: 'Mensurations' },
  { key: 'neck_circ', label: 'Tour de cou', unit: 'cm', icon: '📐', category: 'Mensurations' },
  { key: 'forearm_circ', label: 'Tour d\'avant-bras', unit: 'cm', icon: '📐', category: 'Mensurations' },
]

const CATEGORIES = ['Corps', 'Mensurations']

export default function Profile({ clientId = null, readOnly = false }) {
  const { user, profile, refreshProfile } = useAuth()
  const targetId = clientId || user?.id
  const [measurements, setMeasurements] = useState([])
  const [form, setForm] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [expandedCat, setExpandedCat] = useState('Corps')
  const [targetProfile, setTargetProfile] = useState(null)

  useEffect(() => {
    fetchMeasurements()
    if (clientId) fetchTargetProfile()
    else setTargetProfile(profile)
  }, [targetId])

  useEffect(() => { setFullName(profile?.full_name || '') }, [profile])

  async function fetchTargetProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', targetId).single()
    setTargetProfile(data)
  }

  async function fetchMeasurements() {
    const { data } = await supabase.from('measurements').select('*').eq('user_id', targetId).order('date', { ascending: false })
    setMeasurements(data || [])
  }

  async function saveMeasurement() {
    const hasValue = Object.values(form).some(v => v !== '' && v !== undefined)
    if (!hasValue) return
    setSaving(true)
    const entry = { user_id: targetId, date: new Date().toISOString().split('T')[0] }
    MEASUREMENTS_FIELDS.forEach(f => { if (form[f.key]) entry[f.key] = parseFloat(form[f.key]) })
    await supabase.from('measurements').insert(entry)
    setForm({})
    setShowForm(false)
    fetchMeasurements()
    setSaving(false)
  }

  async function saveProfileName() {
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    await refreshProfile()
    setEditName(false)
  }

  const latest = measurements[0] || {}
  const bmi = latest.weight && latest.height ? (latest.weight / Math.pow(latest.height / 100, 2)).toFixed(1) : null

  function getHistory(key) {
    return measurements.filter(m => m[key] != null).slice(0, 8).reverse()
  }

  function MiniChart({ data, color = 'var(--accent)' }) {
    if (data.length < 2) return null
    const vals = data.map(d => d.value)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || 1
    const w = 80, h = 32
    const points = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ')
    return (
      <svg width={w} height={h} style={{ display: 'block' }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx={(vals.length - 1) / (vals.length - 1) * w} cy={h - ((vals[vals.length - 1] - min) / range) * (h - 4) - 2} r="3" fill={color} />
      </svg>
    )
  }

  const displayName = targetProfile?.full_name || (clientId ? 'Client' : profile?.full_name)

  return (
    <div style={{ padding: '0 0 100px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {clientId ? 'Profil client' : 'Mon profil'}
            </p>
            {!clientId && editName ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ fontSize: '16px', padding: '6px 10px' }} />
                <button onClick={saveProfileName} style={{ background: 'var(--accent)', border: 'none', borderRadius: '8px', color: 'white', padding: '6px 12px', cursor: 'pointer' }}><Save size={16} /></button>
              </div>
            ) : (
              <h1 style={{ fontSize: '40px', lineHeight: 1.1, cursor: !clientId ? 'pointer' : 'default' }} onClick={() => !clientId && setEditName(true)}>
                {displayName}
                {!clientId && <span style={{ fontSize: '14px', color: 'var(--text2)', marginLeft: '8px' }}>✏️</span>}
              </h1>
            )}
            <p style={{ color: 'var(--text2)', fontSize: '13px' }}>{targetProfile?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '0 16px', marginBottom: '24px' }}>
        {[
          { label: 'Poids', value: latest.weight, unit: 'kg' },
          { label: 'Taille', value: latest.height, unit: 'cm' },
          { label: 'M. grasse', value: latest.body_fat, unit: '%' },
          { label: 'IMC', value: bmi, unit: '' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: value ? 'var(--accent)' : 'var(--text2)', lineHeight: 1 }}>
              {value || '—'}
            </p>
            {value && <p style={{ fontSize: '9px', color: 'var(--text2)' }}>{unit}</p>}
          </div>
        ))}
      </div>

      {/* Bouton ajouter mesure */}
      {!readOnly && (
        <div style={{ padding: '0 16px', marginBottom: '20px' }}>
          <button
            className={showForm ? 'btn-ghost' : 'btn-primary'}
            onClick={() => setShowForm(!showForm)}
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Plus size={16} /> {showForm ? 'Annuler' : 'Ajouter des mesures'}
          </button>
        </div>
      )}

      {/* Formulaire ajout */}
      {showForm && !readOnly && (
        <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>NOUVELLES MESURES</h3>
          <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '16px' }}>Remplis uniquement ce que tu as mesuré aujourd'hui</p>
          {CATEGORIES.map(cat => (
            <div key={cat} style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 700 }}>{cat}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {MEASUREMENTS_FIELDS.filter(f => f.category === cat).map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
                      {field.icon} {field.label} ({field.unit})
                    </label>
                    <input
                      type="number"
                      value={form[field.key] || ''}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder="—"
                      step="0.1"
                      min="0"
                      style={{ padding: '8px 10px', fontSize: '14px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-primary" onClick={saveMeasurement} disabled={saving} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
            {saving ? 'Sauvegarde...' : '💾 ENREGISTRER'}
          </button>
        </div>
      )}

      {/* Mensurations détaillées */}
      {CATEGORIES.map(cat => {
        const fields = MEASUREMENTS_FIELDS.filter(f => f.category === cat)
        const hasData = fields.some(f => latest[f.key] != null)
        if (!hasData && readOnly) return null
        const isOpen = expandedCat === cat

        return (
          <div key={cat} style={{ margin: '0 16px 12px' }}>
            <button
              onClick={() => setExpandedCat(isOpen ? null : cat)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}
            >
              <span style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: 'var(--text)' }}>{cat.toUpperCase()}</span>
              {isOpen ? <ChevronUp size={18} style={{ color: 'var(--text2)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text2)' }} />}
            </button>

            {isOpen && (
              <div style={{ paddingTop: '12px' }}>
                {fields.map(field => {
                  const history = getHistory(field.key).map(m => ({ value: m[field.key], date: m.date }))
                  const current = latest[field.key]
                  const prev = measurements[1]?.[field.key]
                  const diff = current && prev ? (current - prev).toFixed(1) : null

                  return (
                    <div key={field.key} className="card" style={{ padding: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '2px' }}>{field.icon} {field.label}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: current ? 'var(--text)' : 'var(--text2)' }}>
                            {current || '—'}
                          </span>
                          {current && <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{field.unit}</span>}
                          {diff && (
                            <span style={{ fontSize: '12px', fontWeight: 700, color: parseFloat(diff) > 0 ? '#06d6a0' : 'var(--accent)' }}>
                              {parseFloat(diff) > 0 ? '+' : ''}{diff}
                            </span>
                          )}
                        </div>
                      </div>
                      {history.length >= 2 && <MiniChart data={history} />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Historique */}
      {measurements.length > 0 && (
        <div style={{ margin: '20px 16px 0' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>HISTORIQUE</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {measurements.slice(0, 10).map((m, i) => (
              <div key={i} className="card" style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px' }}>
                  {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {MEASUREMENTS_FIELDS.filter(f => m[f.key] != null).map(f => (
                    <span key={f.key} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px' }}>
                      {f.label} : <strong>{m[f.key]} {f.unit}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
