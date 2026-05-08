import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, ChevronDown, ChevronUp, Dumbbell, History } from 'lucide-react'
import BodySVG from '../components/BodySVG'
import RestTimer from '../components/RestTimer'
import { MUSCLE_GROUPS, SERIES_TYPES } from '../data/exercises'
import { getExerciseGif } from '../data/exerciseGifs'

export default function SessionDetail() {
  const { id } = useParams()
  const { user, isCoach } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [exercises, setExercises] = useState([])
  const [weights, setWeights] = useState({}) // { blockIdx_setIdx: value }
  const [prevWeights, setPrevWeights] = useState({})
  const [loading, setLoading] = useState(true)
  const [expandedBlock, setExpandedBlock] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchSession() }, [id])

  async function fetchSession() {
    const { data } = await supabase.from('sessions').select('*').eq('id', id).single()
    if (data) {
      setSession(data)
      const exos = JSON.parse(data.exercises || '[]')
      setExercises(exos)

      // Charger poids actuels
      const { data: weightData } = await supabase
        .from('session_weights')
        .select('*')
        .eq('session_id', id)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (weightData?.[0]?.weights) {
        setWeights(JSON.parse(weightData[0].weights))
      }

      // Charger poids séance précédente (même nom d'exercice)
      const { data: prevData } = await supabase
        .from('session_weights')
        .select('*')
        .eq('client_id', user.id)
        .neq('session_id', id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (prevData?.[0]?.weights) {
        setPrevWeights(JSON.parse(prevData[0].weights))
      }
    }
    setLoading(false)
  }

  async function saveWeights() {
    setSaving(true)
    await supabase.from('session_weights').upsert({
      session_id: id,
      client_id: user.id,
      weights: JSON.stringify(weights),
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_id,client_id' })
    setSaving(false)
  }

  function updateWeight(key, value) {
    setWeights(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text2)' }}>Chargement...</div>
  if (!session) return null

  const muscles = JSON.parse(session.muscles_worked || '[]')
  const getSeriesTypeLabel = (type) => SERIES_TYPES.find(t => t.value === type)?.label || type

  const getSeriesTypeColor = (type) => {
    const colors = {
      warmup: '#f4a261',
      dropset: '#9b5de5',
      degressive: '#00b4d8',
      superset: '#06d6a0',
      pyramid: '#ffd166',
      failure: '#e63946',
      pause: '#4cc9f0',
      normal: 'var(--text2)'
    }
    return colors[type] || 'var(--text2)'
  }

  return (
    <div style={{ padding: '24px 16px 120px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '36px', lineHeight: 1 }}>{session.name}</h1>
          <p style={{ color: 'var(--text2)', fontSize: '12px' }}>
            {new Date(session.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Corps + muscles */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <BodySVG activeMuscles={muscles} size={100} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Muscles ciblés
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {muscles.map(m => (
              <span key={m} style={{
                background: 'rgba(230,57,70,0.1)',
                border: '1px solid rgba(230,57,70,0.3)',
                borderRadius: '4px', padding: '3px 8px',
                fontSize: '11px', color: 'var(--accent)', fontWeight: 600
              }}>
                {MUSCLE_GROUPS[m]}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Exercices</p>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent)' }}>{exercises.length}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Séries totales</p>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent)' }}>{session.total_sets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div style={{ marginBottom: '20px' }}>
        <RestTimer />
      </div>

      {/* Exercices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {exercises.map((block, blockIdx) => (
          <div key={blockIdx} className="card" style={{ overflow: 'hidden' }}>
            {/* Header exercice */}
            <div
              onClick={() => setExpandedBlock(expandedBlock === blockIdx ? -1 : blockIdx)}
              style={{ padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div style={{ flexShrink: 0 }}>
                {getExerciseGif(block.exercise.id)
                  ? <img src={getExerciseGif(block.exercise.id)} alt={block.exercise.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} onError={e => e.target.style.display='none'} />
                  : <BodySVG activeMuscles={block.exercise.muscles} size={48} />
                }
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: '20px' }}>{block.exercise.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text2)' }}>
                  {block.sets.length} série{block.sets.length > 1 ? 's' : ''} · {block.exercise.equipment}
                </p>
              </div>
              {expandedBlock === blockIdx ? <ChevronUp size={16} style={{ color: 'var(--text2)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text2)' }} />}
            </div>

            {/* Détail séries */}
            {expandedBlock === blockIdx && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '16px' }}>
                {/* Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 80px 80px', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>#</span>
                  <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Type · Reps</span>
                  <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', textAlign: 'center' }}>Précédent</span>
                  <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', textAlign: 'center' }}>Poids (kg)</span>
                </div>

                {block.sets.map((set, setIdx) => {
                  const key = `${blockIdx}_${setIdx}`
                  const prevWeight = prevWeights[key]
                  return (
                    <div key={setIdx} style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr 80px 80px',
                      gap: '8px',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: setIdx < block.sets.length - 1 ? '1px solid var(--border)' : 'none'
                    }}>
                      <span style={{ fontFamily: 'Bebas Neue', fontSize: '18px', color: 'var(--accent)' }}>{setIdx + 1}</span>
                      <div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: getSeriesTypeColor(set.type),
                          textTransform: 'uppercase',
                          display: 'block',
                          marginBottom: '2px'
                        }}>
                          {getSeriesTypeLabel(set.type)}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 600 }}>{set.reps} reps</span>
                        {set.rest && <span style={{ fontSize: '11px', color: 'var(--text2)', marginLeft: '8px' }}>· {set.rest}s repos</span>}
                      </div>
                      {/* Poids précédent */}
                      <div style={{ textAlign: 'center' }}>
                        {prevWeight ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <History size={10} style={{ color: 'var(--text2)' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 500 }}>{prevWeight} kg</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--border)', fontSize: '12px' }}>—</span>
                        )}
                      </div>
                      {/* Input poids */}
                      <input
                        type="number"
                        value={weights[key] || ''}
                        onChange={e => updateWeight(key, e.target.value)}
                        placeholder="0"
                        disabled={!true} // client peut toujours modifier
                        style={{
                          textAlign: 'center',
                          padding: '6px',
                          fontSize: '14px',
                          fontWeight: 700,
                          borderColor: weights[key] ? 'var(--accent)' : 'var(--border)'
                        }}
                        min="0"
                        step="0.5"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sauvegarder poids */}
      <button
        className="btn-primary"
        onClick={saveWeights}
        disabled={saving}
        style={{ width: '100%', padding: '16px', fontSize: '15px' }}
      >
        {saving ? 'SAUVEGARDE...' : '💾 SAUVEGARDER MES POIDS'}
      </button>
    </div>
  )
}
