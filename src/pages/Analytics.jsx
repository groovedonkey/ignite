import { useMemo } from 'react'
import { BarChart3, Users, TrendingUp, CheckCircle2, Flame } from 'lucide-react'
import { STAGES } from '../utils/prospectActions'

function leadCreatedMs(lead) {
  return lead.createdAt?.toDate ? lead.createdAt.toDate().getTime() : (lead.createdAt?.seconds ? lead.createdAt.seconds * 1000 : null)
}

function Bar({ label, count, max, color = 'bg-orange-500' }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-bold text-white">{count}</span>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function Analytics({ leads = [] }) {
  const data = useMemo(() => {
    const bySource = {}
    const byStage = {}
    for (const l of leads) {
      bySource[l.source] = (bySource[l.source] || 0) + 1
      const stage = l.stage || 'new'
      byStage[stage] = (byStage[stage] || 0) + 1
    }

    const hot = leads.filter(l => l.temperature === 'hot').length
    const warm = leads.filter(l => l.temperature === 'warm').length
    const cold = leads.filter(l => l.temperature === 'cold').length
    const contacted = leads.filter(l => l.status === 'contacted').length
    const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + l.intentScore, 0) / leads.length) : 0

    // New leads per week for the last 8 weeks, from real createdAt timestamps.
    const now = Date.now()
    const weekMs = 7 * 24 * 60 * 60 * 1000
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = now - (8 - i) * weekMs
      const end = start + weekMs
      const count = leads.filter(l => {
        const ms = leadCreatedMs(l)
        return ms && ms >= start && ms < end
      }).length
      return { label: i === 7 ? 'This wk' : `${8 - i}w ago`, count }
    })

    return { bySource, byStage, hot, warm, cold, contacted, avgScore, weeks }
  }, [leads])

  const maxSource = Math.max(1, ...Object.values(data.bySource))
  const maxStage = Math.max(1, ...Object.values(data.byStage))
  const maxWeek = Math.max(1, ...data.weeks.map(w => w.count))

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 size={22} className="text-orange-400" />
          Analytics
        </h2>
        <p className="text-sm text-gray-400 mt-1">Current snapshot of your pipeline — trends fill in as more leads come through.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Leads" value={leads.length} color="bg-purple-600" />
        <StatCard icon={Flame} label="Hot Leads" value={data.hot} sub={`${data.warm} warm · ${data.cold} cold`} color="bg-gradient-to-br from-orange-500 to-red-600" />
        <StatCard icon={TrendingUp} label="Avg Intent Score" value={data.avgScore} color="bg-blue-600" />
        <StatCard
          icon={CheckCircle2}
          label="Contact Rate"
          value={leads.length ? `${Math.round((data.contacted / leads.length) * 100)}%` : '—'}
          sub={`${data.contacted} of ${leads.length} contacted`}
          color="bg-green-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {Object.entries(data.bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
              <Bar key={source} label={source} count={count} max={maxSource} color="bg-blue-500" />
            ))}
            {Object.keys(data.bySource).length === 0 && <p className="text-sm text-gray-600">No leads yet.</p>}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Pipeline by Stage</h3>
          <div className="space-y-3">
            {STAGES.map(s => (
              <Bar key={s.id} label={s.label} count={data.byStage[s.id] || 0} max={maxStage} color="bg-orange-500" />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">New Leads — Last 8 Weeks</h3>
        <div className="flex items-end gap-2.5 h-32">
          {data.weeks.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(4, Math.round((w.count / maxWeek) * 100))}%` }}
                  title={`${w.count} new leads`}
                />
              </div>
              <span className="text-xs text-gray-500">{w.count}</span>
              <span className="text-[10px] text-gray-600">{w.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
