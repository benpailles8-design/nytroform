import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, ChevronRight, Dumbbell, Calendar, LogOut } from 'lucide-react'
import BodySVG from '../components/BodySVG'

export default function Dashboard() {
  const { profile, isCoach, user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchSessions() }, [])

  async function fetchSessions() {
    let query = supabase.from('sessions').select('*').order('created_at', { ascending: false })
    if (!isCoach) query = query.eq('client_id', user.id)
    const { data } = await query
    setSessions(data || [])
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const getMusclesForSession = (session) => {
    try { return JSON.parse(session.muscles_worked || '[]') } catch { return [] }
  }

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <p style={{ color: 'var(--text2)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {isCoach ? '👑 Coach' : 'Athlete'}
          </p>
          <h1 style={{ fontSize: '42px', lineHeight: 1.1 }}>
            {profile?.full_name?.split(' ')[0] || 'Bienvenue'}
          </h1>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', marginTop: '8px' }}>
          <LogOut size={20} />
        </button>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Séances</p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: 'var(--accent)', lineHeight: 1 }}>{sessions.length}</p>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Ce mois</p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: 'var(--accent)', lineHeight: 1 }}>
            {sessions.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
          </p>
        </div>
      </div>

      {/* Bouton créer séance (coach only) */}
      {isCoach && (
        <button
          className="btn-primary"
          onClick={() => navigate('/create-session')}
          style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}
        >
          <Plus size={20} />
          CRÉER UNE SÉANCE
        </button>
      )}

      {/* Liste des séances */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text2)' }}>
          {isCoach ? 'TOUTES LES SÉANCES' : 'MES SÉANCES'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text2)', padding: '40px' }}>Chargement...</div>
        ) : sessions.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <Dumbbell size={40} style={{ color: 'var(--text2)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text2)' }}>Aucune séance pour le moment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map(session => (
              <div
                key={session.id}
                className="card"
                onClick={() => navigate(`/session/${session.id}`)}
                style={{ padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Mini body */}
                <div style={{ flexShrink: 0 }}>
                  <BodySVG activeMuscles={getMusclesForSession(session)} size={60} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '0.03em' }}>{session.name}</p>
                  <p style={{ color: 'var(--text2)', fontSize: '12px', marginTop: '2px' }}>
                    {new Date(session.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {isCoach && session.client_name && (
                    <p style={{ color: 'var(--accent)', fontSize: '11px', marginTop: '4px' }}>👤 {session.client_name}</p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <span style={{
                    background: 'rgba(230, 57, 70, 0.1)',
                    border: '1px solid rgba(230, 57, 70, 0.3)',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: 'var(--accent)',
                    fontWeight: 600
                  }}>
                    {session.total_sets || 0} séries
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--text2)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
