import { Flame, LayoutDashboard, Users, Bell, ChevronRight } from 'lucide-react'
import { REALTOR } from '../config'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'All Leads', icon: Users },
  { id: 'alerts', label: 'Alerts', icon: Bell },
]

export default function Sidebar({ page, setPage, alertCount = 0 }) {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Ignite</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Lead Intent Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const badge = id === 'alerts' ? alertCount : 0
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className={active ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-300'} />
                {label}
              </div>
              {badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                  {badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-orange-400/60" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-gray-800 pt-4">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {REALTOR.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-200 truncate">{REALTOR.name}</p>
            <p className="text-xs text-gray-500 truncate">Lead Agent</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
