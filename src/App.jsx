import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Alerts from './pages/Alerts'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [selectedLeadId, setSelectedLeadId] = useState(null)

  const handleSetPage = (p) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard setPage={handleSetPage} setSelectedLeadId={setSelectedLeadId} />
      case 'leads':
        return <Leads setPage={handleSetPage} setSelectedLeadId={setSelectedLeadId} />
      case 'lead-detail':
        return <LeadDetail leadId={selectedLeadId} setPage={handleSetPage} />
      case 'alerts':
        return <Alerts setPage={handleSetPage} setSelectedLeadId={setSelectedLeadId} />
      default:
        return <Dashboard setPage={handleSetPage} setSelectedLeadId={setSelectedLeadId} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar page={page} setPage={handleSetPage} />
      <main className="flex-1 flex flex-col min-w-0">
        {renderPage()}
      </main>
    </div>
  )
}
