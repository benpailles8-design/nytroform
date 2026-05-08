import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react'

export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', fullName: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function createClient() {
    if (!form.email || !form.fullName || !form.password) {
      setError('Tous les champs sont obligatoires')
      return
    }
    setCreating(true)
    setError('')

    // Créer le compte via Supabase Admin (on utilise signUp ici pour la simplicité)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, role: 'client' }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setCreating(false)
      return
    }

    // Créer le profil manuellement si pas auto-créé
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.fullName,
        role: 'client',
        coach_id: user.id
      })
    }

    setSuccess(`✅ Compte créé ! Identifiants : ${form.email} / ${form.password}`)
    setForm({ email: '', fullName: '', password: '' })
    setShowForm(false)
    fetchClients()
    setCreating(false)
  }

  function copyCredentials() {
    navigator.clipboard.writeText(`Email: ${form.email}\nMot de passe: ${form.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '42px' }}>CLIENTS</h1>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserPlus size={16} /> Nouveau
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>NOUVEAU CLIENT</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Nom complet</label>
              <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Jean Dupont" />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="client@email.com" />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Mot de passe temporaire</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mot de passe"
                  style={{ paddingRight: '80px' }}
                />
                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '6px' }}>
                  <button onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, password: generatePassword() }))}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', marginTop: '4px', padding: 0 }}
              >
                Générer un mot de passe
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '10px', color: 'var(--accent)', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button className="btn-primary" onClick={createClient} disabled={creating} style={{ padding: '12px' }}>
              {creating ? 'Création...' : 'CRÉER LE COMPTE'}
            </button>
          </div>
        </div>
      )}

      {/* Message succès */}
      {success && (
        <div style={{ background: 'rgba(6, 214, 160, 0.1)', border: '1px solid #06d6a0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ color: '#06d6a0', fontSize: '14px', marginBottom: '8px' }}>{success}</p>
          <p style={{ color: 'var(--text2)', fontSize: '12px' }}>Transmets ces identifiants à ton client pour qu'il puisse se connecter.</p>
        </div>
      )}

      {/* Liste clients */}
      <div>
        <p style={{ fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          {clients.length} client{clients.length > 1 ? 's' : ''}
        </p>
        {clients.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text2)' }}>Aucun client pour le moment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {clients.map(client => (
              <div key={client.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Bebas Neue', fontSize: '20px', flexShrink: 0
                }}>
                  {client.full_name?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{client.full_name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text2)' }}>{client.email}</p>
                </div>
                <div style={{
                  background: 'rgba(6,214,160,0.1)',
                  border: '1px solid rgba(6,214,160,0.3)',
                  borderRadius: '6px', padding: '3px 8px',
                  fontSize: '11px', color: '#06d6a0'
                }}>
                  Actif
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
