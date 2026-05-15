import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateSession from './pages/CreateSession'
import SessionDetail from './pages/SessionDetail'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Clients from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import Schedule from './pages/Schedule'
import ExercisesManager from './pages/ExercisesManager'
import ResetPassword from './pages/ResetPassword'
import Progression from './pages/Progression'
import Navbar from './components/Navbar'

function ProtectedRoute({ children, coachOnly = false }) {
  const { user, loading, isCoach } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '48px', color: 'var(--accent)' }}>NYTROFORM</div>
      <div style={{ color: 'var(--text2)', fontSize: '13px' }}>Chargement...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  if (coachOnly && !isCoach) return <Navigate to="/dashboard" />
  return children
}

function AppLayout({ children }) {
  return <>{children}<Navbar /></>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/create-session" element={<ProtectedRoute coachOnly><AppLayout><CreateSession /></AppLayout></ProtectedRoute>} />
      <Route path="/session/:id" element={<ProtectedRoute><AppLayout><SessionDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute coachOnly><AppLayout><Clients /></AppLayout></ProtectedRoute>} />
      <Route path="/client/:clientId" element={<ProtectedRoute coachOnly><AppLayout><ClientProfile /></AppLayout></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><AppLayout><Schedule /></AppLayout></ProtectedRoute>} />
      <Route path="/progression" element={<ProtectedRoute><AppLayout><Progression /></AppLayout></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><AppLayout><ExercisesManager /></AppLayout></ProtectedRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
