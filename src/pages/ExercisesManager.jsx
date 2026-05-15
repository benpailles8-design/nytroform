import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, X, Search, Trash2, ChevronDown, ChevronUp, Image } from 'lucide-react'
import { MUSCLE_GROUPS, EXERCISE_CATEGORIES } from '../data/exercises'

// Compression image canvas
async function compressImage(file, maxWidth = 600, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = url
  })
}

// Compression depuis clipboard (paste)
async function compressBase64(dataUrl, maxWidth = 600, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}

function ImageDropZone({ value, onChange, label }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const compressed = await compressImage(file)
    onChange(compressed)
  }

  async function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        await handleFile(file)
        break
      }
    }
  }

  return (
    <div
      onDrop={async e => { e.preventDefault(); setDragging(false); await handleFile(e.dataTransfer.files[0]) }}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onPaste={handlePaste}
      onClick={() => !value && inputRef.current?.click()}
      tabIndex={0}
      style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : value ? 'var(--border)' : 'var(--border)'}`,
        borderRadius: 10, overflow: 'hidden',
        background: dragging ? 'rgba(230,57,70,0.05)' : 'var(--bg3)',
        cursor: value ? 'default' : 'pointer',
        position: 'relative', minHeight: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
      }}
    >
      {value ? (
        <>
          <img src={value} alt={label} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }} />
          <button
            onClick={e => { e.stopPropagation(); onChange(null) }}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)' }}>
          <Image size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <p style={{ fontSize: 12, fontWeight: 600 }}>{label}</p>
          <p style={{ fontSize: 11, marginTop: 4 }}>Glisse, colle (Ctrl+V) ou clique</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={async e => { if (e.target.files[0]) await handleFile(e.target.files[0]) }} />
    </div>
  )
}

export default function ExercisesManager() {
  const { isCoach } = useAuth()
  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('Tous')
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', category: 'Musculation', muscles: [],
    equipment: 'Barre', description: '',
    image1: null, image2: null
  })

  useEffect(() => { fetchExercises() }, [])

  async function fetchExercises() {
    const { data, error } = await supabase.from('custom_exercises').select('*').order('name')
    console.log('exercises:', data, error)
    setExercises(data || [])
  }

  async function saveExercise() {
    if (!form.name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('custom_exercises').insert({
      name: form.name.trim(),
      category: form.category,
      muscles: JSON.stringify(form.muscles),
      equipment: form.equipment,
      description: form.description,
      image1: form.image1,
      image2: form.image2,
    })
    if (error) { alert('Erreur: ' + error.message); setSaving(false); return }
    setForm({ name: '', category: 'Musculation', muscles: [], equipment: 'Barre', description: '', image1: null, image2: null })
    setShowForm(false)
    setSaving(false)
    await fetchExercises()
  }

  async function deleteExercise(id) {
    if (!confirm('Supprimer cet exercice ?')) return
    await supabase.from('custom_exercises').delete().eq('id', id)
    fetchExercises()
  }

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'Tous' || e.category === filterCat
    return matchSearch && matchCat
  })

  const allMuscles = Object.entries(MUSCLE_GROUPS)
  const cats = ['Tous', ...EXERCISE_CATEGORIES]

  return (
    <div style={{ padding: '0 0 100px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 36 }}>EXERCICES</h1>
          {isCoach && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Nouveau
            </button>
          )}
        </div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ paddingLeft: 34 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {cats.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              background: filterCat === cat ? 'var(--accent)' : 'var(--bg3)',
              border: '1px solid var(--border)', borderRadius: 20,
              padding: '4px 12px', fontSize: 12, color: 'var(--text)',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Formulaire création */}
      {showForm && isCoach && (
        <div className="card" style={{ margin: '0 16px 20px', padding: 20 }}>
          <h2 style={{ fontSize: 22, marginBottom: 16 }}>NOUVEL EXERCICE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nom</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Curl incliné haltères" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Catégorie</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {EXERCISE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Équipement</label>
                <select value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}>
                  {['Barre', 'Haltères', 'Machine', 'Câble', 'Poids de corps', 'Kettlebell', 'Élastique', 'Aucun'].map(eq => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Muscles ciblés</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allMuscles.map(([key, label]) => (
                  <button key={key} onClick={() => setForm(f => ({ ...f, muscles: f.muscles.includes(key) ? f.muscles.filter(m => m !== key) : [...f.muscles, key] }))}
                    style={{ background: form.muscles.includes(key) ? 'var(--accent)' : 'var(--bg3)', border: `1px solid ${form.muscles.includes(key) ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'var(--text)', cursor: 'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Description (optionnel)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Exécution, conseils..." rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Photo 1 (position départ)</label>
                <ImageDropZone value={form.image1} onChange={v => setForm(f => ({ ...f, image1: v }))} label="Photo départ" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Photo 2 (position arrivée)</label>
                <ImageDropZone value={form.image2} onChange={v => setForm(f => ({ ...f, image2: v }))} label="Photo arrivée" />
              </div>
            </div>
            <button className="btn-primary" onClick={saveExercise} disabled={saving || !form.name.trim()} style={{ padding: 14 }}>
              {saving ? 'Sauvegarde...' : 'CRÉER L\'EXERCICE'}
            </button>
          </div>
        </div>
      )}

      {/* Liste exercices */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
            <p>Aucun exercice trouvé</p>
            {isCoach && <p style={{ fontSize: 12, marginTop: 8 }}>Crée ton premier exercice custom !</p>}
          </div>
        )}
        {filtered.map(ex => {
          const muscles = JSON.parse(ex.muscles || '[]')
          const isOpen = expanded === ex.id
          return (
            <div key={ex.id} className="card" style={{ overflow: 'hidden' }}>
              <div onClick={() => setExpanded(isOpen ? null : ex.id)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                {(ex.image1 || ex.image2) && (
                  <img src={ex.image1 || ex.image2} alt={ex.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--border)' }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{ex.category} · {ex.equipment}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isCoach && (
                    <button onClick={e => { e.stopPropagation(); deleteExercise(ex.id) }} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  )}
                  {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text2)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text2)' }} />}
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px' }}>
                  {/* Photos */}
                  {(ex.image1 || ex.image2) && (
                    <div style={{ display: 'grid', gridTemplateColumns: ex.image1 && ex.image2 ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 14 }}>
                      {ex.image1 && <img src={ex.image1} alt="Position départ" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />}
                      {ex.image2 && <img src={ex.image2} alt="Position arrivée" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />}
                    </div>
                  )}
                  {/* Muscles */}
                  {muscles.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 6 }}>Muscles ciblés</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {muscles.map(m => (
                          <span key={m} style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                            {MUSCLE_GROUPS[m] || m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Description */}
                  {ex.description && (
                    <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text2)' }}>{ex.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
