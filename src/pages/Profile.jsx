import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, TrendingUp, ChevronDown, ChevronUp, Save, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const MEASUREMENTS_FIELDS = [
  { key: 'weight', label: 'Poids', unit: 'kg', icon: '⚖️', category: 'Corps' },
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
  { key: 'forearm_circ', label: "Tour d'avant-bras", unit: 'cm', icon: '📐', category: 'Mensurations' },
]

const CATEGORIES = ['Corps', 'Mensurations']

export default function Profile({ clientId = null, readOnly = false }) {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const targetId = clientId || user?.id
  const [measurements, setMeasurements] = useState([])
  const [form, setForm] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedCat, setExpandedCat] = useState('Corps')
  const [targetProfile, setTargetProfile] = useState(null)

  // Paramètres compte
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [accountMsg, setAccountMsg] = useState(null)
  const [savingAccount, setSavingAccount] = useState(false)

  useEffect(() => {
    fetchMeasurements()
    if (clientId) fetchTargetProfile()
    else setTargetProfile(profile)
  }, [targetId])

  useEffect(() => { setTargetProfile(profile) }, [profile])

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

  async function updateEmail() {
    if (!newEmail) return
    setSavingAccount(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) setAccountMsg({ type: 'error', text: error.message })
    else setAccountMsg({ type: 'success', text: 'Email mis à jour ! Vérifie ta boîte mail.' })
    setSavingAccount(false)
    setNewEmail('')
  }

  async function updatePassword() {
    if (!newPassword || newPassword !== confirmPassword) {
      setAccountMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }
    if (newPassword.length < 6) {
      setAccountMsg({ type: 'error', text: 'Minimum 6 caractères' })
      return
    }
    setSavingAccount(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setAccountMsg({ type: 'error', text: error.message })
    else setAccountMsg({ type: 'success', text: 'Mot de passe mis à jour !' })
    setSavingAccount(false)
    setNewPassword(''); setConfirmPassword('')
  }

  const latest = measurements[0] || {}
  const bmi = latest.weight && latest.height ? (latest.weight / Math.pow(latest.height / 100, 2)).toFixed(1) : null
  const displayName = targetProfile?.full_name || (clientId ? 'Client' : profile?.full_name)

  return (
    <div style={{ padding: '0 0 100px', maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 20px' }}>
        <p style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {clientId ? 'Profil client' : 'Mon profil'}
        </p>
        <h1 style={{ fontSize: 40, lineHeight: 1.1 }}>{displayName}</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>{targetProfile?.email}</p>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 16px', marginBottom: 20 }}>
        {[
          { label: 'Poids', value: latest.weight, unit: 'kg' },
          { label: 'M. grasse', value: latest.body_fat, unit: '%' },
          { label: 'IMC', value: bmi, unit: '' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <p style={{ fontSize: 9, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: value ? 'var(--accent)' : 'var(--text2)', lineHeight: 1 }}>
              {value || '—'}
            </p>
            {value && <p style={{ fontSize: 9, color: 'var(--text2)' }}>{unit}</p>}
          </div>
        ))}
      </div>

      {/* Bouton progression */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <button onClick={() => navigate('/progression')} className="btn-ghost"
          style={{ width: '100%', padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
          <TrendingUp size={16} /> Voir mes graphiques de progression
        </button>
      </div>

      {/* Ajouter mesure */}
      {!readOnly && (
        <div style={{ padding: '0 16px', marginBottom: 20 }}>
          <button className={showForm ? 'btn-ghost' : 'btn-primary'} onClick={() => setShowForm(!showForm)}
            style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Plus size={16} /> {showForm ? 'Annuler' : 'Ajouter des mesures'}
          </button>
        </div>
      )}

      {showForm && !readOnly && (
        <div className="card" style={{ margin: '0 16px 20px', padding: 20 }}>
          <h3 style={{ fontSize: 20, marginBottom: 12 }}>NOUVELLES MESURES</h3>
          {CATEGORIES.map(cat => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 700 }}>{cat}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {MEASUREMENTS_FIELDS.filter(f => f.category === cat).map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 11, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
                      {field.icon} {field.label} ({field.unit})
                    </label>
                    <input type="number" value={form[field.key] || ''} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder="—" step="0.1" min="0" style={{ padding: '8px 10px', fontSize: 14 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-primary" onClick={saveMeasurement} disabled={saving} style={{ width: '100%', padding: 12, marginTop: 8 }}>
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
            <button onClick={() => setExpandedCat(isOpen ? null : cat)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 22 }}>{cat.toUpperCase()}</span>
              {isOpen ? <ChevronUp size={18} style={{ color: 'var(--text2)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text2)' }} />}
            </button>
            {isOpen && (
              <div style={{ paddingTop: 12 }}>
                {fields.map(field => {
                  const current = latest[field.key]
                  const prev = measurements[1]?.[field.key]
                  const diff = current && prev ? (current - prev).toFixed(1) : null
                  return (
                    <div key={field.key} className="card" style={{ padding: 14, marginBottom: 8 }}>
                      <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>{field.icon} {field.label}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: current ? 'var(--text)' : 'var(--text2)' }}>
                          {current || '—'}
                        </span>
                        {current && <span style={{ fontSize: 12, color: 'var(--text2)' }}>{field.unit}</span>}
                        {diff && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: parseFloat(diff) > 0 ? '#06d6a0' : 'var(--accent)' }}>
                            {parseFloat(diff) > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </div>
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
          <h3 style={{ fontSize: 20, marginBottom: 12 }}>HISTORIQUE</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {measurements.slice(0, 10).map((m, i) => (
              <div key={i} className="card" style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
                  {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {MEASUREMENTS_FIELDS.filter(f => m[f.key] != null).map(f => (
                    <span key={f.key} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 12 }}>
                      {f.label} : <strong>{m[f.key]} {f.unit}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paramètres compte (seulement pour soi-même) */}
      {!clientId && !readOnly && (
        <div style={{ margin: '24px 16px 0' }}>
          <button onClick={() => setShowAccountSettings(!showAccountSettings)}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 22 }}>PARAMÈTRES DU COMPTE</span>
            {showAccountSettings ? <ChevronUp size={18} style={{ color: 'var(--text2)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text2)' }} />}
          </button>

          {showAccountSettings && (
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {accountMsg && (
                <div style={{ background: accountMsg.type === 'success' ? 'rgba(6,214,160,0.1)' : 'rgba(230,57,70,0.1)', border: `1px solid ${accountMsg.type === 'success' ? '#06d6a0' : 'var(--accent)'}`, borderRadius: 8, padding: '10px 14px', color: accountMsg.type === 'success' ? '#06d6a0' : 'var(--accent)', fontSize: 13 }}>
                  {accountMsg.text}
                </div>
              )}

              {/* Changer email */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Mail size={16} style={{ color: 'var(--accent)' }} />
                  <p style={{ fontWeight: 700, fontSize: 14 }}>Changer l'adresse email</p>
                </div>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Nouvelle adresse email" style={{ marginBottom: 10 }} />
                <button className="btn-primary" onClick={updateEmail} disabled={savingAccount || !newEmail} style={{ width: '100%', padding: 10, fontSize: 13, opacity: !newEmail ? 0.5 : 1 }}>
                  {savingAccount ? 'Mise à jour...' : 'Mettre à jour l\'email'}
                </button>
              </div>

              {/* Changer mot de passe */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Lock size={16} style={{ color: 'var(--accent)' }} />
                  <p style={{ fontWeight: 700, fontSize: 14 }}>Changer le mot de passe</p>
                </div>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input type={showPwd ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmer le mot de passe" style={{ marginBottom: 10 }} />
                <button className="btn-primary" onClick={updatePassword} disabled={savingAccount || !newPassword} style={{ width: '100%', padding: 10, fontSize: 13, opacity: !newPassword ? 0.5 : 1 }}>
                  {savingAccount ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
