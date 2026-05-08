import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Dumbbell, User, MessageCircle, LayoutDashboard, Users } from 'lucide-react'

export default function Navbar() {
  const { isCoach, profile } = useAuth()

  const clientLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Séances' },
    { to: '/profile', icon: <User size={20} />, label: 'Profil' },
    { to: '/messages', icon: <MessageCircle size={20} />, label: 'Messages' },
  ]

  const coachLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Séances' },
    { to: '/clients', icon: <Users size={20} />, label: 'Clients' },
    { to: '/messages', icon: <MessageCircle size={20} />, label: 'Messages' },
  ]

  const links = isCoach ? coachLinks : clientLinks

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--accent)' : 'var(--text2)',
            textDecoration: 'none',
            fontSize: '10px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: 500,
            transition: 'color 0.2s',
            padding: '4px 20px',
          })}
        >
          {link.icon}
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
