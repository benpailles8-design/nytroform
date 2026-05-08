import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, ChevronRight, Plus, X, Clock, Dumbbell } from 'lucide-react'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 7h → 21h

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export default function Schedule() {
  const { user, isCoach } = useAuth()
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))
  const [events, setEvents] = useState([])
  const [sessions, setSessions] = useState([])
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(null) // { day, hour }
  const [form, setForm] = useState({ session_id: '', client_id: '', hour: 9, duration: 60, note: '' })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [weekStart])

  async function fetchAll() {
    const start = formatDate(weekStart)
    const end = formatDate(addDays(weekStart, 7))

    let eventsQuery = supabase.from('schedule_events').select('*').gte('date', start).lt('date', end)
    if (!isCoach) eventsQuery = eventsQuery.eq('client_id', user.id)

    const { data: eventsData } = await eventsQuery
    setEvents(eventsData || [])

    if (isCoach) {
      const { data: clientsData } = await supabase.from('profiles').select('id, full_name').eq('role', 'client')
      setClients(clientsData || [])
      const { data: sessionsData } = await supabase.from('sessions').select('id, name, client_id')
      setSessions(sessionsData || [])
    } else {
      const { data: sessionsData } = await supabase.from('sessions').select('id, name').eq('client_id', user.id)
      setSessions(sessionsData || [])
    }
  }

  async function createEvent() {
    if (!form.session_id || !showForm) return
    setSaving(true)
    const date = formatDate(addDays(weekStart, showForm.day))
    const session = sessions.find(s => s.id === form.session_id)
    const client = clients.find(c => c.id === (form.client_id || session?.client_id))

    const { data: inserted, error: insertError } = await supabase.from('schedule_events').insert({
      coach_id: user.id,
      client_id: form.client_id || session?.client_id,
      client_name: client?.full_name,
      session_id: form.session_id,
      session_name: session?.name,
      date,
      hour: form.hour,
      duration: form.duration,
      note: form.note
    }).select()

    if (insertError) { alert('Erreur: ' + insertError.message); setSaving(false); return }
    setShowForm(null)
    setForm({ session_id: '', client_id: '', hour: 9, duration: 60, note: '' })
    fetchAll()
    setSaving(false)
  }

  async function deleteEvent(id) {
    await supabase.from('schedule_events').delete().eq('id', id)
    setSelectedEvent(null)
    fetchAll()
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = formatDate(new Date())

  const getEventsForSlot = (dayIdx, hour) => {
    const date = formatDate(addDays(weekStart, dayIdx))
    return events.filter(e => e.date === date && e.hour === hour)
  }

  const clientSessions = (clientId) => sessions.filter(s => !clientId || s.client_id === clientId)

  return (
    <div style={{ padding: '0 0 100px', maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>PLANNING</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', padding: '6px 10px', cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, flex: 1, textAlign: 'center' }}>
            {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} — {addDays(weekStart, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', padding: '6px 10px', cursor: 'pointer' }}>
            <ChevronRight size={18} />
          </button>
        </div>
        <button onClick={() => setWeekStart(getMonday(new Date()))} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', marginTop: '8px', padding: 0 }}>
          Aujourd'hui
        </button>
      </div>

      {/* Calendrier */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '480px' }}>
          {/* Header jours */}
          <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
            <div />
            {weekDays.map((day, i) => {
              const isToday = formatDate(day) === today
              return (
                <div key={i} style={{ padding: '10px 4px', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{DAYS[i]}</p>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: isToday ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '2px auto 0',
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: isToday ? 700 : 400 }}>{day.getDate()}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grille heures */}
          {HOURS.map(hour => (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', borderBottom: '1px solid var(--border)', minHeight: '56px' }}>
              <div style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--text2)', fontSize: '11px', paddingTop: '6px' }}>
                {hour}h
              </div>
              {weekDays.map((day, dayIdx) => {
                const slotEvents = getEventsForSlot(dayIdx, hour)
                const isToday = formatDate(day) === today
                return (
                  <div
                    key={dayIdx}
                    style={{
                      borderLeft: '1px solid var(--border)',
                      padding: '3px',
                      background: isToday ? 'rgba(230,57,70,0.02)' : 'transparent',
                      cursor: isCoach ? 'pointer' : 'default',
                      position: 'relative',
                      minHeight: '56px'
                    }}
                    onClick={() => {
                      if (!isCoach || slotEvents.length > 0) return
                      setShowForm({ day: dayIdx, hour })
                      setForm(f => ({ ...f, hour }))
                    }}
                  >
                    {slotEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event) }}
                        style={{
                          background: 'var(--accent)',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          marginBottom: '2px',
                        }}
                      >
                        <p style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {event.session_name}
                        </p>
                        {isCoach && event.client_name && (
                          <p style={{ fontSize: '9px', opacity: 0.8, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {event.client_name}
                          </p>
                        )}
                        <p style={{ fontSize: '9px', opacity: 0.7 }}>{event.hour}h · {event.duration}min</p>
                      </div>
                    ))}
                    {isCoach && slotEvents.length === 0 && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                      >
                        <Plus size={14} style={{ color: 'var(--text2)' }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal création événement */}
      {showForm && isCoach && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowForm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: '20px 20px 0 0', width: '100%', padding: '24px 20px 40px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px' }}>
                PLANIFIER UNE SÉANCE
                <span style={{ fontSize: '14px', color: 'var(--text2)', display: 'block', fontFamily: 'DM Sans', fontWeight: 400 }}>
                  {DAYS_FULL[showForm.day]} à {showForm.hour}h
                </span>
              </h2>
              <button onClick={() => setShowForm(null)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  <option value="">Sélectionner une séance</option>
                  {sessions.filter(s => s.client_id === form.client_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Heure</label>
                  <select value={form.hour} onChange={e => setForm(f => ({ ...f, hour: parseInt(e.target.value) }))}>
                    {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Durée</label>
                  <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}>
                    {[30, 45, 60, 75, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Note (optionnel)</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Ex: Apporter sa ceinture..." />
              </div>
              <button className="btn-primary" onClick={createEvent} disabled={saving || !form.session_id} style={{ padding: '14px', fontSize: '15px', opacity: (!form.session_id) ? 0.5 : 1 }}>
                {saving ? 'Planification...' : 'PLANIFIER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail événement */}
      {selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelectedEvent(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: '20px 20px 0 0', width: '100%', padding: '24px 20px 40px' }}>
            <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', lineHeight: 1 }}>{selectedEvent.session_name}</h2>
                <p style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '2px' }}>
                  {new Date(selectedEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div className="card" style={{ padding: '12px' }}>
                <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '4px' }}>Heure</p>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent)' }}>{selectedEvent.hour}:00</p>
              </div>
              <div className="card" style={{ padding: '12px' }}>
                <p style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '4px' }}>Durée</p>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent)' }}>{selectedEvent.duration} min</p>
              </div>
            </div>

            {selectedEvent.client_name && isCoach && (
              <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '2px' }}>Client</p>
                <p style={{ fontWeight: 700 }}>{selectedEvent.client_name}</p>
              </div>
            )}

            {selectedEvent.note && (
              <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '2px' }}>Note</p>
                <p style={{ fontSize: '14px' }}>{selectedEvent.note}</p>
              </div>
            )}

            {isCoach && (
              <button onClick={() => deleteEvent(selectedEvent.id)} style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.4)', borderRadius: '8px', color: 'var(--accent)', padding: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, width: '100%' }}>
                Supprimer ce créneau
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
