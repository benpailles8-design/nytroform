import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { ArrowLeft, Dumbbell, MessageCircle } from 'lucide-react'
import Profile from './Profile'

export default function ClientProfile() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [clientData, setClientData] = useState(null)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', clientId).single().then(({ data }) => setClientData(data))
  }, [clientId])

  return (
    <div style={{ paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 16px 0', marginBottom: '4px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '28px' }}>PROFIL CLIENT</h2>
      </div>

      {/* Actions rapides */}
      {clientData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px 16px 0' }}>
          <button className="btn-primary" onClick={() => navigate(`/create-session?client=${clientId}&name=${encodeURIComponent(clientData.full_name)}`)}
            style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
            <Dumbbell size={15} /> Créer séance
          </button>
          <button className="btn-ghost" onClick={() => navigate('/messages')}
            style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
            <MessageCircle size={15} /> Message
          </button>
        </div>
      )}

      <Profile clientId={clientId} readOnly={true} />
    </div>
  )
}
