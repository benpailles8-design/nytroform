import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { Send, ArrowLeft } from 'lucide-react'

export default function Messages() {
  const { user, isCoach, profile } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [clients, setClients] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isCoach) fetchClients()
    else loadConversation(user.id)
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv)
      // Realtime
      const channel = supabase.channel(`messages_${selectedConv}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConv}`
        }, payload => {
          setMessages(prev => [...prev, payload.new])
          scrollToBottom()
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [selectedConv])

  useEffect(() => { scrollToBottom() }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'client')
    setClients(data || [])
  }

  async function fetchConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .or(`client_id.eq.${user.id},coach_id.eq.${user.id}`)
    setConversations(data || [])
    if (!isCoach && data?.[0]) {
      setSelectedConv(data[0].id)
    }
  }

  async function loadConversation(clientId) {
    // Trouver ou créer conversation
    let { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('client_id', isCoach ? clientId : user.id)
      .single()

    if (!data) {
      const { data: created } = await supabase.from('conversations').insert({
        client_id: isCoach ? clientId : user.id,
        coach_id: isCoach ? user.id : null
      }).select().single()
      data = created
    }

    if (data) {
      setSelectedConv(data.id)
    }
  }

  async function fetchMessages(convId) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConv) return
    await supabase.from('messages').insert({
      conversation_id: selectedConv,
      sender_id: user.id,
      sender_name: profile?.full_name || 'Moi',
      content: newMessage.trim(),
      is_coach: isCoach
    })
    setNewMessage('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedClient = clients.find(c => {
    const conv = conversations.find(cv => cv.id === selectedConv)
    return conv && c.id === conv.client_id
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {selectedConv && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isCoach && (
              <button onClick={() => setSelectedConv(null)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: '28px', lineHeight: 1 }}>MESSAGES</h1>
              {selectedClient && <p style={{ fontSize: '12px', color: 'var(--text2)' }}>{selectedClient.full_name}</p>}
              {!isCoach && <p style={{ fontSize: '12px', color: 'var(--text2)' }}>Ton coach</p>}
            </div>
          </div>
        )}
        {!selectedConv && isCoach && <h1 style={{ fontSize: '36px' }}>MESSAGES</h1>}
      </div>

      {/* Liste clients (coach sans conv sélectionnée) */}
      {isCoach && !selectedConv && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Sélectionner un client</p>
          {clients.map(client => (
            <div
              key={client.id}
              onClick={() => loadConversation(client.id)}
              className="card"
              style={{ padding: '16px', marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '18px' }}>
                {client.full_name?.charAt(0)}
              </div>
              <span style={{ fontWeight: 600 }}>{client.full_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      {selectedConv && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text2)', marginTop: '40px' }}>
                <p>Aucun message pour l'instant</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Commencez la conversation ! 💪</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === user.id
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    background: isMe ? 'var(--accent)' : 'var(--bg3)',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                  }}>
                    {!isMe && (
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        {msg.sender_name}
                      </p>
                    )}
                    <p style={{ fontSize: '14px', lineHeight: 1.4 }}>{msg.content}</p>
                    <p style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input message */}
          <div style={{ padding: '12px 16px max(16px, env(safe-area-inset-bottom))', background: 'var(--bg2)', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ton message..."
              rows={1}
              style={{ flex: 1, resize: 'none', padding: '10px 14px', fontSize: '14px', maxHeight: '120px', overflow: 'auto' }}
            />
            <button
              className="btn-primary"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              style={{ padding: '10px', flexShrink: 0, opacity: newMessage.trim() ? 1 : 0.5 }}
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
