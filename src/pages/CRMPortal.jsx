import { useState } from 'react'
import { useProspects } from '../hooks/useProspects'
import Sidebar from '../components/Sidebar'
import Dashboard from './Dashboard'
import Leads from './Leads'
import LeadDetail from './LeadDetail'
import Alerts from './Alerts'

export default function CRMPortal() {
  const [page, setPage] = useState('dashboard')
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const { leads, loading: leadsLoading } = useProspects()

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
      <Sidebar page={page} setPage={handleSetPage} alertCount={alertCount} />
      <main className="flex-1 flex flex-col min-w-0">
        {renderPage()}
      </main>
    </div>
  )
}
