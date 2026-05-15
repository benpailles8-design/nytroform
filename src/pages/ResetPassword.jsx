import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase gère automatiquement le token depuis l'URL
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleReset(e) {
    e.preventDefault()
    if (password !== confirm) { setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' }); return }
    if (password.length < 6) { setMsg({ type: 'error', text: 'Minimum 6 caractères' }); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMsg({ type: 'error', text: error.message })
    else {
      setMsg({ type: 'success', text: 'Mot de passe mis à jour ! Redirection...' })
      setTimeout(() => navigate('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '56px', color: 'var(--accent)', lineHeight: 1 }}>NYTROFORM</h1>
        </div>
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>NOUVEAU MOT DE PASSE</h2>
          <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '24px' }}>
            {ready ? 'Choisis ton nouveau mot de passe.' : 'Chargement...'}
          </p>

          {ready && (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Nouveau mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Confirmer</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
              </div>
              {msg && (
                <div style={{ background: msg.type === 'success' ? 'rgba(6,214,160,0.1)' : 'rgba(230,57,70,0.1)', border: '1px solid ' + (msg.type === 'success' ? '#06d6a0' : 'var(--accent)'), borderRadius: '8px', padding: '10px 14px', color: msg.type === 'success' ? '#06d6a0' : 'var(--accent)', fontSize: '13px' }}>
                  {msg.text}
                </div>
              )}
              <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '14px', fontSize: '15px', marginTop: '4px' }}>
                {loading ? 'Mise à jour...' : 'METTRE À JOUR'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
