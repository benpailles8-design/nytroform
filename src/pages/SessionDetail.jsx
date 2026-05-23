import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, ChevronDown, ChevronUp, Dumbbell, History } from 'lucide-react'
import BodySVG from '../components/BodySVG'
import RestTimer from '../components/RestTimer'
import { MUSCLE_GROUPS, SERIES_TYPES } from '../data/exercises'

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
  const [saved, setSaved] = useState(false)
  const [exerciseImages, setExerciseImages] = useState({}) // { exerciseId: { image1, image2 } }
  const [uploadingImg, setUploadingImg] = useState(null)

  useEffect(() => { fetchSession() }, [id])

  async function fetchSession() {
    const { data } = await supabase.from('sessions').select('*').eq('id', id).single()
    if (data) {
      setSession(data)
      const exos = JSON.parse(data.exercises || '[]')
      setExercises(exos)
      await loadExerciseImages(exos)

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

  async function loadExerciseImages(exos) {
    const ids = exos.map(b => b.exercise.id).filter(id => !id.includes('-')) // IDs classiques (pas UUID)
    if (!ids.length) return
    const { data } = await supabase.from('exercise_images').select('*').in('exercise_id', ids)
    if (data) {
      const map = {}
      data.forEach(d => { map[d.exercise_id] = { image1: d.image1, image2: d.image2 } })
      setExerciseImages(map)
    }
  }

  async function compressAndSave(exerciseId, slot, file) {
    if (!file || !file.type.startsWith('image/')) return
    setUploadingImg(exerciseId + slot)
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const maxW = 600
      if (width > maxW) { height = Math.round(height * maxW / width); width = maxW }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      const compressed = canvas.toDataURL('image/jpeg', 0.65)

      // Upsert dans exercise_images
      const current = exerciseImages[exerciseId] || {}
      const updated = { ...current, [slot]: compressed }
      await supabase.from('exercise_images').upsert({
        exercise_id: exerciseId,
        image1: updated.image1 || null,
        image2: updated.image2 || null,
      }, { onConflict: 'exercise_id' })
      setExerciseImages(prev => ({ ...prev, [exerciseId]: updated }))
      setUploadingImg(null)
    }
    img.src = url
  }

  async function handlePasteImage(exerciseId, slot, e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        await compressAndSave(exerciseId, slot, item.getAsFile())
        break
      }
    }
  }

  async function removeImage(exerciseId, slot) {
    const current = exerciseImages[exerciseId] || {}
    const updated = { ...current, [slot]: null }
    await supabase.from('exercise_images').upsert({
      exercise_id: exerciseId,
      image1: updated.image1 || null,
      image2: updated.image2 || null,
    }, { onConflict: 'exercise_id' })
    setExerciseImages(prev => ({ ...prev, [exerciseId]: updated }))
  }

  async function saveWeights() {
    setSaving(true)
    setSaved(false)
    const { error } = await supabase.from('session_weights').upsert({
      session_id: id,
      client_id: user.id,
      weights: JSON.stringify(weights),
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_id,client_id' })
    setSaving(false)
    if (error) {
      alert('Erreur lors de la sauvegarde : ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
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
              {(block.exercise.image1 || block.exercise.image2) && (
                <img src={block.exercise.image1 || block.exercise.image2} alt={block.exercise.name}
                  style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }} />
              )}
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
                {/* Photos + muscles */}
                <div style={{ marginBottom: '16px' }}>
                  {(() => {
                    const exId = block.exercise.id
                    const isCustom = block.exercise.isCustom
                    const img1 = isCustom ? block.exercise.image1 : exerciseImages[exId]?.image1
                    const img2 = isCustom ? block.exercise.image2 : exerciseImages[exId]?.image2
                    return (
                      <>
                        {(img1 || img2) && (
                          <div style={{ display: 'grid', gridTemplateColumns: img1 && img2 ? '1fr 1fr' : '1fr', gap: 8, marginBottom: 12 }}>
                            {img1 && (
                              <div style={{ position: 'relative' }}>
                                <img src={img1} alt="Départ" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
                                {isCoach && !isCustom && (
                                  <button onClick={() => removeImage(exId, 'image1')} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                )}
                              </div>
                            )}
                            {img2 && (
                              <div style={{ position: 'relative' }}>
                                <img src={img2} alt="Arrivée" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
                                {isCoach && !isCustom && (
                                  <button onClick={() => removeImage(exId, 'image2')} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {isCoach && !isCustom && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                            {['image1', 'image2'].map(slot => {
                              const hasImg = slot === 'image1' ? !!img1 : !!img2
                              if (hasImg) return null
                              const label = slot === 'image1' ? 'Photo départ' : 'Photo arrivée'
                              return (
                                <label key={slot} style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                                  onPaste={e => handlePasteImage(exId, slot, e)} tabIndex={0}>
                                  {uploadingImg === exId + slot ? (
                                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>Compression...</span>
                                  ) : (
                                    <>
                                      <span style={{ fontSize: 18 }}>📷</span>
                                      <span style={{ fontSize: 10, color: 'var(--text2)' }}>{label}</span>
                                      <span style={{ fontSize: 9, color: 'var(--text2)', opacity: 0.7 }}>Colle ou clique</span>
                                    </>
                                  )}
                                  <input type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => e.target.files[0] && compressAndSave(exId, slot, e.target.files[0])} />
                                </label>
                              )
                            })}
                          </div>
                        )}
                        <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: '10px' }}>
                          <BodySVG activeMuscles={block.exercise.muscles} size={60} showBoth={true} />
                        </div>
                      </>
                    )
                  })()}
                </div>
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

      {isCoach && (
        <button className="btn-ghost" onClick={() => navigate('/create-session?edit=' + id)} style={{ width: '100%', padding: '14px', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          ✏️ Modifier cette séance
        </button>
      )}

      {/* Sauvegarder poids */}
      <button
        className="btn-primary"
        onClick={saveWeights}
        disabled={saving || saved}
        style={{ width: '100%', padding: '16px', fontSize: '15px', background: saved ? '#06d6a0' : saving ? 'var(--bg3)' : 'var(--accent)', transition: 'all 0.3s' }}
      >
        {saving ? '⏳ SAUVEGARDE EN COURS...' : saved ? '✅ POIDS SAUVEGARDÉS !' : '💾 SAUVEGARDER MES POIDS'}
      </button>
    </div>
  )
}
