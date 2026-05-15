import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, X, Search, Trash2, ChevronDown, ChevronUp, Image } from 'lucide-react'
import { MUSCLE_GROUPS, EXERCISE_CATEGORIES, EXERCISES } from '../data/exercises'
import BodySVG from '../components/BodySVG'

async function compressImage(file, maxWidth = 600, quality = 0.65) {
  return new Promise((resolve) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = url
  })
}

function ImageSlot({ value, onChange, label, uploading }) {
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
      if (item.type.startsWith('image/')) { await handleFile(item.getAsFile()); break }
    }
  }

  if (value) return (
    <div style={{ position: 'relative' }}>
      <img src={value} alt={label} style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
      <button onClick={() => onChange(null)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={14} />
      </button>
    </div>
  )

  return (
    <label style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '16px 8px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'border-color 0.2s' }}
      onPaste={handlePaste} tabIndex={0}
      onDrop={async e => { e.preventDefault(); await handleFile(e.dataTransfer.files[0]) }}
      onDragOver={e => e.preventDefault()}
    >
      {uploading ? <span style={{ fontSize: 12, color: 'var(--text2)' }}>Compression...</span> : (
        <>
          <Image size={22} style={{ color: 'var(--text2)', opacity: 0.5 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{label}</span>
          <span style={{ fontSize: 10, color: 'var(--text2)', opacity: 0.6 }}>Glisse, colle (Ctrl+V) ou clique</span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={async e => { if (e.target.files[0]) await handleFile(e.target.files[0]) }} />
    </label>
  )
}

export default function ExercisesManager() {
  const { isCoach } = useAuth()
  const [customExercises, setCustomExercises] = useState([])
  const [exerciseImages, setExerciseImages] = useState({}) // images des exercices classiques
  const [exerciseDescs, setExerciseDescs] = useState({}) // descriptions des exercices classiques
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('Tous')
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savingImg, setSavingImg] = useState(null)
  const [editingCustom, setEditingCustom] = useState(null) // id de l'exercice custom en cours d'édition
  const [editForm, setEditForm] = useState({})
  const [form, setForm] = useState({ name: '', category: 'Musculation', muscles: [], equipment: 'Barre', description: '', image1: null, image2: null })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: customs }, { data: imgs }, { data: descs }] = await Promise.all([
      supabase.from('custom_exercises').select('*').order('name'),
      supabase.from('exercise_images').select('*'),
      supabase.from('exercise_descriptions').select('*'),
    ])
    setCustomExercises(customs || [])
    const imgMap = {}
    ;(imgs || []).forEach(d => { imgMap[d.exercise_id] = { image1: d.image1, image2: d.image2 } })
    setExerciseImages(imgMap)
    const descMap = {}
    ;(descs || []).forEach(d => { descMap[d.exercise_id] = d.description })
    setExerciseDescs(descMap)
  }

  async function saveCustomExercise() {
    if (!form.name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('custom_exercises').insert({
      name: form.name.trim(), category: form.category,
      muscles: JSON.stringify(form.muscles), equipment: form.equipment,
      description: form.description, image1: form.image1, image2: form.image2,
    })
    if (error) { alert('Erreur: ' + error.message); setSaving(false); return }
    setForm({ name: '', category: 'Musculation', muscles: [], equipment: 'Barre', description: '', image1: null, image2: null })
    setShowForm(false)
    setSaving(false)
    await fetchAll()
  }

  async function updateCustomExercise() {
    if (!editingCustom) return
    setSaving(true)
    const { error } = await supabase.from('custom_exercises').update({
      name: editForm.name,
      category: editForm.category,
      muscles: JSON.stringify(editForm.muscles),
      equipment: editForm.equipment,
      description: editForm.description,
      image1: editForm.image1,
      image2: editForm.image2,
    }).eq('id', editingCustom)
    if (error) { alert('Erreur: ' + error.message) }
    else { setEditingCustom(null); await fetchAll() }
    setSaving(false)
  }

  function startEdit(ex) {
    setEditingCustom(ex.id)
    setEditForm({
      name: ex.name, category: ex.category,
      muscles: ex.muscles || [], equipment: ex.equipment,
      description: ex.description || '',
      image1: ex.image1 || null, image2: ex.image2 || null,
    })
  }

  async function deleteCustom(id) {
    if (!confirm('Supprimer cet exercice ?')) return
    await supabase.from('custom_exercises').delete().eq('id', id)
    fetchAll()
  }

  async function saveClassicImage(exerciseId, slot, value) {
    setSavingImg(exerciseId + slot)
    const current = exerciseImages[exerciseId] || {}
    const updated = { ...current, [slot]: value }
    await supabase.from('exercise_images').upsert({
      exercise_id: exerciseId, image1: updated.image1 || null, image2: updated.image2 || null
    }, { onConflict: 'exercise_id' })
    setExerciseImages(prev => ({ ...prev, [exerciseId]: updated }))
    setSavingImg(null)
  }

  async function saveClassicDesc(exerciseId, description) {
    await supabase.from('exercise_descriptions').upsert({
      exercise_id: exerciseId, description
    }, { onConflict: 'exercise_id' })
    setExerciseDescs(prev => ({ ...prev, [exerciseId]: description }))
  }

  // Fusionner tous les exercices
  const classicExercises = EXERCISES.map(e => ({
    ...e, isCustom: false,
    image1: exerciseImages[e.id]?.image1 || null,
    image2: exerciseImages[e.id]?.image2 || null,
    description: exerciseDescs[e.id] || '',
  }))
  const customFormatted = customExercises.map(e => ({
    ...e, isCustom: true,
    muscles: JSON.parse(e.muscles || '[]'),
  }))
  const allExercises = [...classicExercises, ...customFormatted]

  const cats = ['Tous', ...EXERCISE_CATEGORIES, 'Custom']
  const filtered = allExercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'Tous' || (filterCat === 'Custom' ? e.isCustom : e.category === filterCat)
    return matchSearch && matchCat
  })

  const allMuscles = Object.entries(MUSCLE_GROUPS)

  return (
    <div style={{ padding: '0 0 100px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 36, lineHeight: 1 }}>EXERCICES</h1>
            <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>{filtered.length} exercice{filtered.length > 1 ? 's' : ''}</p>
          </div>
          {isCoach && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Nouveau
            </button>
          )}
        </div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un exercice..." style={{ paddingLeft: 34 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {cats.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              background: filterCat === cat ? 'var(--accent)' : 'var(--bg3)',
              border: '1px solid var(--border)', borderRadius: 20,
              padding: '4px 12px', fontSize: 12, color: 'var(--text)',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s'
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Formulaire nouvel exercice custom */}
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
                  {['Barre', 'Haltères', 'Machine', 'Câble', 'Poids de corps', 'Kettlebell', 'Élastique', 'Aucun'].map(eq => <option key={eq}>{eq}</option>)}
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
              <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Exécution, conseils..." rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Photo départ</label>
                <ImageSlot value={form.image1} onChange={v => setForm(f => ({ ...f, image1: v }))} label="Position départ" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Photo arrivée</label>
                <ImageSlot value={form.image2} onChange={v => setForm(f => ({ ...f, image2: v }))} label="Position arrivée" />
              </div>
            </div>
            <button className="btn-primary" onClick={saveCustomExercise} disabled={saving || !form.name.trim()} style={{ padding: 14 }}>
              {saving ? 'Sauvegarde...' : "CRÉER L'EXERCICE"}
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
            Aucun exercice trouvé
          </div>
        )}
        {filtered.map(ex => {
          const isOpen = expanded === (ex.isCustom ? ex.id : ex.id)
          const hasPhoto = ex.image1 || ex.image2
          return (
            <div key={ex.isCustom ? ex.id : ex.id} className="card" style={{ overflow: 'hidden' }}>
              <div onClick={() => setExpanded(isOpen ? null : (ex.isCustom ? ex.id : ex.id))}
                style={{ padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                {hasPhoto ? (
                  <img src={ex.image1 || ex.image2} alt={ex.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--border)' }} />
                ) : (
                  <div style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BodySVG activeMuscles={ex.muscles || []} size={40} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</p>
                    {ex.isCustom && <span style={{ fontSize: 9, background: 'var(--accent)', borderRadius: 4, padding: '1px 5px', color: 'white', fontWeight: 700 }}>CUSTOM</span>}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{ex.category} · {ex.equipment}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isCoach && ex.isCustom && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={e => { e.stopPropagation(); if (editingCustom === ex.id) setEditingCustom(null); else { startEdit(ex); setExpanded(ex.id) } }}
                        style={{ background: 'none', border: 'none', color: editingCustom === ex.id ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', padding: 4, fontSize: 13 }}>
                        ✏️
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteCustom(ex.id) }}
                        style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text2)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text2)' }} />}
                </div>
              </div>

              {isOpen && editingCustom === (ex.isCustom ? ex.id : null) && (
                <div style={{ borderTop: '1px solid var(--border)', padding: 16, background: 'rgba(230,57,70,0.03)' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 14 }}>✏️ MODE ÉDITION</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <select value={editForm.category || ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                        {EXERCISE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <select value={editForm.equipment || ''} onChange={e => setEditForm(f => ({ ...f, equipment: e.target.value }))}>
                        {['Barre','Haltères','Machine','Câble','Poids de corps','Kettlebell','Élastique','Aucun'].map(eq => <option key={eq}>{eq}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {Object.entries(MUSCLE_GROUPS).map(([key, label]) => (
                        <button key={key} onClick={() => setEditForm(f => ({ ...f, muscles: (f.muscles||[]).includes(key) ? f.muscles.filter(m=>m!==key) : [...(f.muscles||[]), key] }))}
                          style={{ background: (editForm.muscles||[]).includes(key) ? 'var(--accent)' : 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 9px', fontSize: 11, color: 'var(--text)', cursor: 'pointer' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..." rows={3} style={{ resize: 'vertical' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 5 }}>Photo départ</p>
                        <ImageSlot value={editForm.image1} onChange={v => setEditForm(f => ({ ...f, image1: v }))} label="Position départ" />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 5 }}>Photo arrivée</p>
                        <ImageSlot value={editForm.image2} onChange={v => setEditForm(f => ({ ...f, image2: v }))} label="Position arrivée" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" onClick={updateCustomExercise} disabled={saving} style={{ flex: 1, padding: 12 }}>
                        {saving ? 'Sauvegarde...' : '✅ Sauvegarder'}
                      </button>
                      <button className="btn-ghost" onClick={() => setEditingCustom(null)} style={{ padding: 12 }}>Annuler</button>
                    </div>
                  </div>
                </div>
              )}

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: 16 }}>
                  {/* Photos */}
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 10 }}>
                      📷 Photos d'exécution
                      {isCoach && !ex.isCustom && <span style={{ color: 'var(--accent)', marginLeft: 6 }}>· Modifiable</span>}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {['image1', 'image2'].map((slot, idx) => {
                        const val = slot === 'image1' ? ex.image1 : ex.image2
                        const label = idx === 0 ? 'Position départ' : 'Position arrivée'
                        if (ex.isCustom) {
                          return val ? <img key={slot} src={val} alt={label} style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} /> : null
                        }
                        if (!isCoach && !val) return null
                        return (
                          <div key={slot}>
                            <p style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 4 }}>{label}</p>
                            <ImageSlot
                              value={val}
                              onChange={isCoach ? async (newVal) => await saveClassicImage(ex.id, slot, newVal) : null}
                              label={label}
                              uploading={savingImg === ex.id + slot}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Muscles */}
                  {ex.muscles?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 8 }}>Muscles ciblés</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <BodySVG activeMuscles={ex.muscles} size={60} showBoth={true} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignContent: 'flex-start' }}>
                          {ex.muscles.map(m => (
                            <span key={m} style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                              {MUSCLE_GROUPS[m] || m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {ex.isCustom ? (
                    editingCustom === ex.id ? null : (
                      ex.description && <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
                        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text2)' }}>{ex.description}</p>
                      </div>
                    )
                  ) : isCoach ? (
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 6 }}>Description · <span style={{ color: 'var(--accent)' }}>Modifiable</span></p>
                      <textarea
                        defaultValue={ex.description}
                        onBlur={e => saveClassicDesc(ex.id, e.target.value)}
                        placeholder="Ajouter une description, conseils d'exécution..."
                        rows={3}
                        style={{ resize: 'vertical', fontSize: 13 }}
                      />
                    </div>
                  ) : ex.description ? (
                    <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text2)' }}>{ex.description}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
