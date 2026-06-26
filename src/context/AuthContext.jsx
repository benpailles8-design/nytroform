import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext({})

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms))
  ])
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connError, setConnError] = useState(false)

  useEffect(() => {
    let cancelled = false

    withTimeout(supabase.auth.getSession(), 10000, 'getSession')
      .then(({ data: { session } }) => {
        if (cancelled) return
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
        setConnError(true)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).single(),
        10000,
        'fetchProfile'
      )
      if (error) throw error
      setProfile(data)
      setConnError(false)
    } catch (e) {
      setConnError(true)
    } finally {
      setLoading(false)
    }
  }

  const isCoach = profile?.role === 'coach'

  return (
    <AuthContext.Provider value={{ user, profile, loading, connError, isCoach, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
