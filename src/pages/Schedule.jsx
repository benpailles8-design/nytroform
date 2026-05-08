import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, ChevronRight, Plus, X, Dumbbell, Trash2 } from 'lucide-react'

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_SHORT = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
const DAYS_FULL = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}
function formatDate(year, month, day) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

export default function Schedule() {
  const { user, isCoach } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [events, setEvents] = useState([])
  const [clients, setClients] = useState([])
  const [allSessions, setAllSessions] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_id: '', session_id: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => { fetchAll() }, [year, month])

  async function fetchAll() {
    const start = `${year}-${String(month+1).padStart(2,'0')}-01`
    const end = `${year}-${String(month+1).padStart(2,'0')}-${getDaysInMonth(year,month)}`

    let q = supabase.from('schedule_events').select('*').gte('date', start).lte('date', end)
    if (!isCoach) q = q.eq('client_id', user.id)
    const { data } = await q
    setEvents(data || [])

    if (isCoach) {
      const { data: c } = await supabase.from('profiles').select('id, full_name').eq('role', 'client')
      setClients(c || [])
      const { data: s } = await supabase.from('sessions').select('id, name, client_id')
      setAllSessions(s || [])
    } else {
      const { data: s } = await supabase.from('sessions').select('id, name').eq('client_id', user.id)
      setAllSessions(s || [])
    }
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y-1); setMonth(11) }
    else setMonth(m => m-1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y+1); setMonth(0) }
    else setMonth(m => m+1)
  }

  function openDay(day) {
    setSelectedDay(day)
    setShowForm(false)
    setForm({ client_id: '', session_id: '', note: '' })
  }

  async function saveEvent() {
    if (!form.session_id || !selectedDay) return
    setSaving(true)
    const session = allSessions.find(s => s.id === form.session_id)
    const clientId = isCoach ? form.client_id : user.id
    const client = clients.find(c => c.id === clientId)
    const date = formatDate(year, month, selectedDay)

    await supabase.from('schedule_events').insert({
      coach_id: isCoach ? user.id : null,
      client_id: clientId,
      client_name: client?.full_name || null,
      session_id: form.session_id,
      session_name: session?.name,
      date,
      note: form.note
    })

    setShowForm(false)
    setForm({ client_id: '', session_id: '', note: '' })
    fetchAll()
    setSaving(false)
  }

  async function deleteEvent(id) {
    await supabase.from('schedule_events').delete().eq('id', id)
    setSelectedEvent(null)
    fetchAll()
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const todayStr = formatDate(now.getFullYear(), now.getMonth(), now.getDate())

  const eventsForDay = (day) => {
    const date = formatDate(year, month, day)
    return events.filter(e => e.date === date)
  }

  const dayEvents = selectedDay ? eventsForDay(selectedDay) : []
  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null

  const clientSessions = allSessions.filter(s => !form.client_id || s.client_id === form.client_id)

  return (
    <div style={{ padding: '0 0 100px', maxWidth: '600px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ padding: '24px 16px 16px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>PLANNING</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={prevMonth} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', padding: '8px 12px', cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontSize: '24px', textAlign: 'center' }}>{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', padding: '8px 12px', cursor: 'pointer' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px', marginBottom: '4px' }}>
        {DAYS_SHORT.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grille calendrier */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', padding: '0 16px', marginBottom: '24px' }}>
        {/* Cases vides avant le 1er */}
        {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}

        {/* Jours */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = formatDate(year, month, day)
          const dayEvs = eventsForDay(day)
          const isToday = dateStr === todayStr
          const isSelected = selectedDay === day
          const hasPast = new Date(dateStr) < new Date(todayStr)

          return (
            <div
              key={day}
              onClick={() => openDay(day)}
              style={{
                aspectRatio: '1',
                borderRadius: '10px',
                border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: isSelected ? 'rgba(230,57,70,0.08)' : isToday ? 'rgba(230,57,70,0.04)' : 'var(--card)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '6px 4px',
                transition: 'all 0.15s',
                opacity: hasPast && !dayEvs.length ? 0.4 : 1,
              }}
            >
              <span style={{
                fontSize: '13px',
                fontWeight: isToday ? 700 : 400,
                color: isToday ? 'var(--accent)' : isSelected ? 'var(--accent)' : 'var(--text)',
                lineHeight: 1,
                marginBottom: '4px'
              }}>{day}</span>
              {/* Points événements */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center' }}>
                {dayEvs.slice(0, 3).map((e, idx) => (
                  <div key={idx} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Détail du jour sélectionné */}
      {selectedDay && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '22px', lineHeight: 1 }}>
                {DAYS_FULL[selectedDate.getDay()]} {selectedDay} {MONTHS[month]}
              </h3>
              {dayEvents.length === 0 && <p style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '2px' }}>Aucune séance planifiée</p>}
            </div>
            {isCoach && (
              <button
                className="btn-primary"
                onClick={() => setShowForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
              >
                <Plus size={15} /> Planifier
              </button>
            )}
          </div>

          {/* Liste séances du jour */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="card"
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                onClick={() => setSelectedEvent(event)}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Dumbbell size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '15px' }}>{event.session_name}</p>
                  {isCoach && event.client_name && (
                    <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '2px' }}>👤 {event.client_name}</p>
                  )}
                  {event.note && <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>💬 {event.note}</p>}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/session/${event.session_id}`) }}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  Voir
                </button>
              </div>
            ))}
          </div>

          {/* Formulaire ajout séance */}
          {showForm && isCoach && (
            <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '20px' }}>PLANIFIER UNE SÉANCE</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Client</label>
                  <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value, session_id: '' }))}>
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Séance</label>
                  <select value={form.session_id} onChange={e => setForm(f => ({ ...f, session_id: e.target.value }))} disabled={!form.client_id}>
                    <option value="">-- Choisir une séance --</option>
                    {clientSessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Note (optionnel)</label>
                  <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Ex: Apporter sa ceinture..." />
                </div>
                <button className="btn-primary" onClick={saveEvent} disabled={saving || !form.session_id} style={{ padding: '12px', opacity: !form.session_id ? 0.5 : 1 }}>
                  {saving ? 'Sauvegarde...' : 'CONFIRMER'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal détail événement */}
      {selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelectedEvent(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: '20px 20px 0 0', width: '100%', padding: '24px 20px 40px' }}>
            <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Dumbbell size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '24px', lineHeight: 1 }}>{selectedEvent.session_name}</h2>
                <p style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '4px' }}>
                  {new Date(selectedEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            {isCoach && selectedEvent.client_name && (
              <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '2px' }}>Client</p>
                <p style={{ fontWeight: 700 }}>{selectedEvent.client_name}</p>
              </div>
            )}
            {selectedEvent.note && (
              <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '2px' }}>Note</p>
                <p style={{ fontSize: '14px' }}>{selectedEvent.note}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={() => { setSelectedEvent(null); navigate(`/session/${selectedEvent.session_id}`) }} style={{ flex: 1, padding: '12px' }}>
                Voir la séance
              </button>
              {isCoach && (
                <button onClick={() => deleteEvent(selectedEvent.id)} style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.4)', borderRadius: '8px', color: 'var(--accent)', padding: '12px 16px', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
