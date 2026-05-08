import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { Send, ArrowLeft, Search } from 'lucide-react'

export default function Messages() {
  const { user, isCoach, profile } = useAuth()
  const [clients, setClients] = useState([])
  const [selectedConv, setSelectedConv] = useState(null) // { convId, clientId, clientName }
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [lastMessages, setLastMessages] = useState({})
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  useEffect(() => {
    if (isCoach) fetchClients()
    else initClientConv()
  }, [])

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.convId)
      subscribeToMessages(selectedConv.convId)
    }
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [selectedConv?.convId])

  useEffect(() => { scrollToBottom() }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'client').order('full_name')
    setClients(data || [])
    // Charger dernier message pour chaque client
    for (const c of (data || [])) {
      const conv = await getOrCreateConv(c.id, false)
      if (conv) {
        const { data: msgs } = await supabase.from('messages').select('content, created_at').eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1)
        if (msgs?.[0]) setLastMessages(prev => ({ ...prev, [c.id]: msgs[0] }))
      }
    }
  }

  async function initClientConv() {
    const conv = await getOrCreateConv(user.id, true)
    if (conv) setSelectedConv({ convId: conv.id, clientId: user.id, clientName: 'Mon coach' })
  }

  async function getOrCreateConv(clientId, create = true) {
    const { data } = await supabase.from('conversations').select('*').eq('client_id', clientId).maybeSingle()
    if (data) return data
    if (!create) return null
    const { data: created } = await supabase.from('conversations').insert({ client_id: clientId, coach_id: null }).select().single()
    return created
  }

  async function openConv(client) {
    const conv = await getOrCreateConv(client.id, true)
    if (conv) setSelectedConv({ convId: conv.id, clientId: client.id, clientName: client.full_name })
  }

  async function fetchMessages(convId) {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true })
    setMessages(data || [])
  }

  function subscribeToMessages(convId) {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    channelRef.current = supabase.channel(`conv_${convId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        payload => { setMessages(prev => [...prev, payload.new]) })
      .subscribe()
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConv || sending) return
    setSending(true)
    await supabase.from('messages').insert({
      conversation_id: selectedConv.convId,
      sender_id: user.id,
      sender_name: profile?.full_name || 'Coach',
      content: newMessage.trim(),
      is_coach: isCoach
    })
    setNewMessage('')
    setSending(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const filteredClients = clients.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const avatarColor = (name) => `hsl(${(name?.charCodeAt(0) || 0) * 15 % 360}, 60%, 35%)`

  // Vue liste clients (coach)
  if (isCoach && !selectedConv) {
    return (
      <div style={{ padding: '0 0 100px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ padding: '24px 16px 16px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>MESSAGES</h1>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..." style={{ paddingLeft: '36px' }} />
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>
          {filteredClients.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text2)' }}>Aucun client trouvé</p>
            </div>
          ) : filteredClients.map(client => (
            <div key={client.id} onClick={() => openConv(client)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: avatarColor(client.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '22px', flexShrink: 0 }}>
                {client.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, marginBottom: '2px' }}>{client.full_name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lastMessages[client.id]?.content || 'Aucun message'}
                </p>
              </div>
              {lastMessages[client.id] && (
                <p style={{ fontSize: '10px', color: 'var(--text2)', flexShrink: 0 }}>
                  {new Date(lastMessages[client.id].created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Vue conversation
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isCoach && (
          <button onClick={() => setSelectedConv(null)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={22} />
          </button>
        )}
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarColor(selectedConv?.clientName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '18px', flexShrink: 0 }}>
          {selectedConv?.clientName?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1 }}>{selectedConv?.clientName}</p>
          <p style={{ fontSize: '11px', color: '#06d6a0', marginTop: '2px' }}>● En ligne</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text2)', marginTop: '60px' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>💬</p>
            <p style={{ fontWeight: 600 }}>Aucun message</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Commencez la conversation !</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === user.id
          const prevMsg = messages[i - 1]
          const showName = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id)
          const showTime = !messages[i + 1] || new Date(messages[i + 1].created_at) - new Date(msg.created_at) > 5 * 60 * 1000

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              {showName && <p style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', marginLeft: '4px' }}>{msg.sender_name}</p>}
              <div style={{
                maxWidth: '78%',
                background: isMe ? 'var(--accent)' : 'var(--bg3)',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '10px 14px',
                border: isMe ? 'none' : '1px solid var(--border)'
              }}>
                <p style={{ fontSize: '14px', lineHeight: 1.45, wordBreak: 'break-word' }}>{msg.content}</p>
              </div>
              {showTime && (
                <p style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '4px', marginLeft: '4px', marginRight: '4px' }}>
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 16px max(16px, env(safe-area-inset-bottom))', background: 'var(--bg2)', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message..."
          rows={1}
          style={{ flex: 1, resize: 'none', padding: '10px 14px', fontSize: '14px', maxHeight: '100px', overflow: 'auto', borderRadius: '20px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: newMessage.trim() ? 'var(--accent)' : 'var(--bg3)',
            border: '1px solid var(--border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s'
          }}
        >
          <Send size={17} style={{ color: newMessage.trim() ? 'white' : 'var(--text2)' }} />
        </button>
      </div>
    </div>
  )
}
