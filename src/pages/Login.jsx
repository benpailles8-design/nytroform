import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou mot de passe incorrect')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '64px',
            color: 'var(--accent)',
            lineHeight: 1,
            marginBottom: '8px'
          }}>NYTROFORM</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Coaching · Performance · Résultats
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>CONNEXION</h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '28px' }}>
            Accès réservé aux membres
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid var(--accent)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--accent)',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '8px', padding: '14px', fontSize: '16px', letterSpacing: '0.05em' }}>
              {loading ? 'Connexion...' : 'SE CONNECTER'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '12px', marginTop: '24px' }}>
          Pas encore de compte ? Contacte ton coach.
        </p>
        <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '11px', marginTop: '12px', opacity: 0.5, letterSpacing: '0.05em' }}>
          Application créée par <span style={{ color: 'var(--accent)' }}>Ben Pailles</span>
        </p>
      </div>
    </div>
  )
}
