import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { Flame } from 'lucide-react'
import { auth } from './firebase'
import { REALTOR } from './config'
import ProspectSite from './pages/ProspectSite'
import CRMPortal from './pages/CRMPortal'
import CRMLogin from './pages/CRMLogin'

// Firestore rules only grant read/write on prospects, tasks, and activity
// to a request whose auth token email matches REALTOR.allowedEmail — so the
// portal is useless without a real signed-in session. Gate it here rather
// than trusting the route: an unauthenticated (or wrong-account) visitor
// sees the login screen instead of a portal full of permission errors.
function usePortalAuth() {
  const [state, setState] = useState({ loading: true, user: null })
  useEffect(() => onAuthStateChanged(auth, (user) => setState({ loading: false, user })), [])
  return state
}

function PortalGate() {
  const { loading, user } = usePortalAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center animate-pulse">
          <Flame size={18} className="text-white" />
        </div>
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  if (!user || user.email !== REALTOR.allowedEmail) {
    return <CRMLogin />
  }

  return <CRMPortal />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProspectSite />} />
      <Route path="/portal/login" element={<Navigate to="/portal" replace />} />
      <Route path="/portal/*" element={<PortalGate />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
