import { useState } from 'react'
import { Menu, Flame } from 'lucide-react'
import { useProspects } from '../hooks/useProspects'
import { useTasks, taskTiming } from '../hooks/useTasks'
import Sidebar from '../components/Sidebar'
import Dashboard from './Dashboard'
import Leads from './Leads'
import LeadDetail from './LeadDetail'
import Alerts from './Alerts'
import Pipeline from './Pipeline'
import Calendar from './Calendar'
import Tasks from './Tasks'
import Analytics from './Analytics'

export default function CRMPortal() {
  const [page, setPage] = useState('dashboard')
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { leads, loading: leadsLoading } = useProspects()
  const { tasks, loading: tasksLoading } = useTasks()

  const handleSetPage = (p) => {
    setPage(p)
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }

  const alertCount = leads.filter(l => l.isAlerted).length
  const taskCount = tasks.filter(t => {
    if (t.completed) return false
    const { bucket } = taskTiming(t)
    return bucket === 'overdue' || bucket === 'today'
  }).length

  const renderPage = () => {
    const sharedProps = { leads, loading: leadsLoading, tasks, tasksLoading, setPage: handleSetPage, setSelectedLeadId }
    switch (page) {
      case 'dashboard':   return <Dashboard {...sharedProps} />
      case 'leads':       return <Leads {...sharedProps} />
      case 'lead-detail': return <LeadDetail leadId={selectedLeadId} leads={leads} tasks={tasks} setPage={handleSetPage} />
      case 'pipeline':    return <Pipeline {...sharedProps} />
      case 'calendar':    return <Calendar {...sharedProps} />
      case 'tasks':       return <Tasks {...sharedProps} />
      case 'alerts':      return <Alerts {...sharedProps} />
      case 'analytics':   return <Analytics {...sharedProps} />
      default:            return <Dashboard {...sharedProps} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        page={page}
        setPage={handleSetPage}
        alertCount={alertCount}
        taskCount={taskCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-base">Ignite</span>
          </div>
          {alertCount > 0 && (
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
              {alertCount} alert{alertCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <main className="flex-1 flex flex-col min-w-0">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
