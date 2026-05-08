import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { UserPlus, Eye, EyeOff, Trash2, Dumbbell, MessageCircle, ChevronRight, X, Search } from 'lucide-react'

export default function Clients() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [form, setForm] = useState({ email: '', fullName: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [clientSessions, setClientSessions] = useState([])

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function openClient(client) {
    setSelectedClient(client)
    const { data } = await supabase.from('sessions').select('*').eq('client_id', client.id).order('created_at', { ascending: false })
    setClientSessions(data || [])
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  async function createClient() {
    if (!form.email || !form.fullName || !form.password) { setError('Tous les champs sont obligatoires'); return }
    setCreating(true); setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.fullName, role: 'client' } }
    })
    if (signUpError) { setError(signUpError.message); setCreating(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, email: form.email, full_name: form.fullName, role: 'client', coach_id: user.id })
    }
    setSuccess({ email: form.email, password: form.password, name: form.fullName })
    setForm({ email: '', fullName: '', password: '' }); setShowForm(false); fetchClients(); setCreating(false)
  }

  async function deleteClient(clientId) {
    if (!window.confirm('Supprimer ce client ? Toutes ses données seront perdues.')) return
    setDeleting(clientId)
    await supabase.from('sessions').delete().eq('client_id', clientId)
    await supabase.from('measurements').delete().eq('user_id', clientId)
    await supabase.from('profiles').delete().eq('id', clientId)
    setSelectedClient(null); fetchClients(); setDeleting(null)
  }

  const filtered = clients.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const avatarColor = (name) => `hsl(${(name?.charCodeAt(0) || 0) * 15 % 360}, 60%, 35%)`

  return (
    <div style={{ padding: '0 0 100px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ padding: '24px 16px 0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Coach</p>
            <h1 style={{ fontSize: '40px', lineHeight: 1 }}>MES CLIENTS</h1>
          </div>
          <button className="btn-primary" onClick={() => { setShowForm(true); setError('') }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={16} /> Nouveau
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ paddingLeft: '36px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '4px' }}>Total clients</p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '40px', color: 'var(--accent)', lineHeight: 1 }}>{clients.length}</p>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '4px' }}>Résultats</p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '40px', color: 'var(--accent)', lineHeight: 1 }}>{filtered.length}</p>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <UserPlus size={36} style={{ color: 'var(--text2)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text2)' }}>Aucun client trouvé</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(client => (
              <div key={client.id} className="card" onClick={() => openClient(client)}
                style={{ padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: avatarColor(client.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '22px', flexShrink: 0 }}>
                  {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '15px' }}>{client.full_name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06d6a0', boxShadow: '0 0 6px #06d6a0' }} />
                  <ChevronRight size={16} style={{ color: 'var(--text2)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal détail client */}
      {selectedClient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelectedClient(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '24px 20px 40px' }}>
            <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: avatarColor(selectedClient.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '28px', flexShrink: 0 }}>
                {selectedClient.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '28px', lineHeight: 1 }}>{selectedClient.full_name}</h2>
                <p style={{ color: 'var(--text2)', fontSize: '13px' }}>{selectedClient.email}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              <button className="btn-primary" onClick={() => { setSelectedClient(null); navigate(`/create-session?client=${selectedClient.id}&name=${encodeURIComponent(selectedClient.full_name)}`) }} style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}>
                <Dumbbell size={16} /> Créer séance
              </button>
              <button className="btn-ghost" onClick={() => { setSelectedClient(null); navigate('/messages') }} style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}>
                <MessageCircle size={16} /> Message
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Séances ({clientSessions.length})</p>
            {clientSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: '13px', background: 'var(--bg3)', borderRadius: '10px', marginBottom: '20px' }}>Aucune séance pour ce client</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {clientSessions.map(session => (
                  <div key={session.id} onClick={() => { setSelectedClient(null); navigate(`/session/${session.id}`) }} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px' }}>{session.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>{new Date(session.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} · {session.total_sets} séries</p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text2)' }} />
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <button onClick={() => deleteClient(selectedClient.id)} disabled={deleting === selectedClient.id} style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.4)', borderRadius: '8px', color: 'var(--accent)', padding: '12px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                <Trash2 size={15} /> {deleting === selectedClient.id ? 'Suppression...' : 'Supprimer ce client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal création */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: '20px 20px 0 0', width: '100%', padding: '24px 20px 40px' }}>
            <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px' }}>NOUVEAU CLIENT</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Nom complet</label>
                <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Jean Dupont" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jean@email.com" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={{ paddingRight: '44px' }} />
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button onClick={() => setForm(f => ({ ...f, password: generatePassword() }))} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', marginTop: '6px', padding: 0, fontWeight: 600 }}>
                  ⚡ Générer automatiquement
                </button>
              </div>
              {error && <div style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '10px', color: 'var(--accent)', fontSize: '13px' }}>{error}</div>}
              <button className="btn-primary" onClick={createClient} disabled={creating} style={{ padding: '14px', fontSize: '15px' }}>
                {creating ? 'Création...' : 'CRÉER LE COMPTE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal succès */}
      {success && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ padding: '28px', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>COMPTE CRÉÉ !</h2>
            <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '20px' }}>Transmets ces identifiants à {success.name}</p>
            <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '2px' }}>Email</p>
                <p style={{ fontWeight: 700 }}>{success.email}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '2px' }}>Mot de passe</p>
                <p style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)', fontSize: '16px' }}>{success.password}</p>
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigator.clipboard.writeText(`Email: ${success.email}\nMot de passe: ${success.password}`)} style={{ width: '100%', padding: '12px', marginBottom: '10px' }}>
              📋 Copier les identifiants
            </button>
            <button className="btn-ghost" onClick={() => setSuccess(null)} style={{ width: '100%', padding: '12px' }}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}
