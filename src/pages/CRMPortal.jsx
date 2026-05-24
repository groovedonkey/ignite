import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { Navigate } from 'react-router-dom'
import { auth } from '../firebase'
import { REALTOR } from '../config'
import { useProspects } from '../hooks/useProspects'
import Sidebar from '../components/Sidebar'
import Dashboard from './Dashboard'
import Leads from './Leads'
import LeadDetail from './LeadDetail'
import Alerts from './Alerts'

export default function CRMPortal() {
  const [user, setUser] = useState(undefined)
  const [page, setPage] = useState('dashboard')
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const isAuthed = !!user && user.email === REALTOR.allowedEmail
  const { leads, loading: leadsLoading } = useProspects(isAuthed)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u))
  }, [])

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || user.email !== REALTOR.allowedEmail) {
    return <Navigate to="/portal/login" replace />
  }

  const handleSetPage = (p) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  const alertCount = leads.filter(l => l.isAlerted).length

  const renderPage = () => {
    const sharedProps = { leads, loading: leadsLoading, setPage: handleSetPage, setSelectedLeadId }
    switch (page) {
      case 'dashboard':   return <Dashboard {...sharedProps} />
      case 'leads':       return <Leads {...sharedProps} />
      case 'lead-detail': return <LeadDetail leadId={selectedLeadId} leads={leads} setPage={handleSetPage} />
      case 'alerts':      return <Alerts {...sharedProps} />
      default:            return <Dashboard {...sharedProps} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar page={page} setPage={handleSetPage} user={user} alertCount={alertCount} />
      <main className="flex-1 flex flex-col min-w-0">
        {renderPage()}
      </main>
    </div>
  )
}
