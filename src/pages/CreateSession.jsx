import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { EXERCISES, EXERCISE_CATEGORIES, SERIES_TYPES, MUSCLE_GROUPS } from '../data/exercises'
import { Plus, Trash2, ChevronDown, ChevronUp, Search, ArrowLeft } from 'lucide-react'
import BodySVG from '../components/BodySVG'

export default function CreateSession() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const preselectedClient = searchParams.get('client')
  const preselectedName = searchParams.get('name')
  const [clients, setClients] = useState([])
  const [sessionName, setSessionName] = useState('')
  const [clientId, setClientId] = useState('')
  const [exerciseBlocks, setExerciseBlocks] = useState([])
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('Tous')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
    if (preselectedClient) setClientId(preselectedClient)
    if (editId) loadExistingSession(editId)
  }, [])

  async function loadExistingSession(sessionId) {
    const { data } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
    if (data) {
      setSessionName(data.name)
      setClientId(data.client_id)
      const exos = JSON.parse(data.exercises || '[]')
      setExerciseBlocks(exos)
    }
  }

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'client')
    setClients(data || [])
  }

  function addExercise(exercise) {
    setExerciseBlocks(prev => [...prev, {
      exercise,
      sets: [{ type: 'normal', reps: 10, rest: 90 }]
    }])
    setShowExercisePicker(false)
  }

  function removeBlock(idx) {
    setExerciseBlocks(prev => prev.filter((_, i) => i !== idx))
  }

  function addSet(blockIdx) {
    setExerciseBlocks(prev => prev.map((block, i) =>
      i === blockIdx ? { ...block, sets: [...block.sets, { type: 'normal', reps: 10, rest: 90 }] } : block
    ))
  }

  function removeSet(blockIdx, setIdx) {
    setExerciseBlocks(prev => prev.map((block, i) =>
      i === blockIdx ? { ...block, sets: block.sets.filter((_, j) => j !== setIdx) } : block
    ))
  }

  function updateSet(blockIdx, setIdx, field, value) {
    setExerciseBlocks(prev => prev.map((block, i) =>
      i === blockIdx ? {
        ...block,
        sets: block.sets.map((set, j) => j === setIdx ? { ...set, [field]: value } : set)
      } : block
    ))
  }

  const allMuscles = [...new Set(exerciseBlocks.flatMap(b => b.exercise.muscles))]
  const totalSets = exerciseBlocks.reduce((acc, b) => acc + b.sets.length, 0)

  const filteredExercises = EXERCISES.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === 'Tous' || e.category === filterCategory
    return matchSearch && matchCat
  })

  async function handleSave() {
    if (!sessionName || !clientId || exerciseBlocks.length === 0) return
    setSaving(true)

    const client = clients.find(c => c.id === clientId)

    let error
    if (editId) {
      const { error: e } = await supabase.from('sessions').update({
        name: sessionName,
        client_id: clientId,
        client_name: client?.full_name,
        muscles_worked: JSON.stringify(allMuscles),
        total_sets: totalSets,
        exercises: JSON.stringify(exerciseBlocks)
      }).eq('id', editId)
      error = e
    } else {
      const { error: e } = await supabase.from('sessions').insert({
      name: sessionName,
      client_id: clientId,
      client_name: client?.full_name,
      coach_id: user.id,
      muscles_worked: JSON.stringify(allMuscles),
      total_sets: totalSets,
      exercises: JSON.stringify(exerciseBlocks)
      }).select().single()
      error = e
    }

    if (!error) navigate('/dashboard')
    setSaving(false)
  }

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '36px' }}>{editId ? 'MODIFIER LA SÉANCE' : 'NOUVELLE SÉANCE'}</h1>
      </div>

      {/* Infos séance */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Nom de la séance
            </label>
            <input value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Ex: Push A - Force" />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Client
            </label>
            <select value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">Sélectionner un client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Aperçu muscles */}
      {allMuscles.length > 0 && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BodySVG activeMuscles={allMuscles} size={80} />
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Muscles travaillés</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allMuscles.map(m => (
                <span key={m} style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: 'var(--accent)' }}>
                  {MUSCLE_GROUPS[m]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {exerciseBlocks.map((block, blockIdx) => (
          <div key={blockIdx} className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: '20px' }}>{block.exercise.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text2)' }}>{block.exercise.category} · {block.exercise.equipment}</p>
              </div>
              <button onClick={() => removeBlock(blockIdx)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>

            {/* Séries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px 60px 24px', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Type</span>
                <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Répétitions</span>
                <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Repos</span>
                <span></span>
                <span></span>
              </div>
              {block.sets.map((set, setIdx) => (
                <div key={setIdx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px 60px 24px', gap: '6px', alignItems: 'center' }}>
                  <select
                    value={set.type}
                    onChange={e => updateSet(blockIdx, setIdx, 'type', e.target.value)}
                    style={{ fontSize: '11px', padding: '6px 8px' }}
                  >
                    {SERIES_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={e => updateSet(blockIdx, setIdx, 'reps', e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '13px' }}
                    min="1"
                  />
                  <input
                    type="number"
                    value={set.rest}
                    onChange={e => updateSet(blockIdx, setIdx, 'rest', e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '13px' }}
                    placeholder="90s"
                    min="0"
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center' }}>#{setIdx + 1}</span>
                  <button onClick={() => removeSet(blockIdx, setIdx)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 0 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSet(blockIdx)}
                style={{ background: 'var(--bg3)', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--text2)', padding: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <Plus size={12} /> Ajouter une série
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ajouter exercice */}
      <button
        onClick={() => setShowExercisePicker(true)}
        className="btn-ghost"
        style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}
      >
        <Plus size={18} /> AJOUTER UN EXERCICE
      </button>

      {/* Sauvegarder */}
      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving || !sessionName || !clientId || exerciseBlocks.length === 0}
        style={{ width: '100%', padding: '16px', fontSize: '16px', opacity: (saving || !sessionName || !clientId || exerciseBlocks.length === 0) ? 0.5 : 1 }}
      >
        {saving ? 'SAUVEGARDE...' : `${editId ? 'METTRE À JOUR' : 'SAUVEGARDER'} LA SÉANCE (${totalSets} séries)`}
      </button>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200
        }} onClick={() => setShowExercisePicker(false)}>
          <div
            style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0', width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 16px 0' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>CHOISIR UN EXERCICE</h2>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  style={{ paddingLeft: '36px' }}
                  autoFocus
                />
              </div>
              {/* Filtres catégories */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {['Tous', ...EXERCISE_CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    style={{
                      background: filterCategory === cat ? 'var(--accent)' : 'var(--bg3)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      color: 'var(--text)',
                      padding: '4px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: '8px 16px 24px', flex: 1 }}>
              {filteredExercises.map(exercise => (
                <div
                  key={exercise.id}
                  onClick={() => addExercise(exercise)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <p style={{ fontWeight: 600, marginBottom: '2px' }}>{exercise.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text2)' }}>
                    {exercise.category} · {exercise.equipment} · {exercise.muscles.map(m => MUSCLE_GROUPS[m]).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
