import { Flame, Users, TrendingUp, Bell, ArrowRight, Phone, Mail } from 'lucide-react'
import { REALTOR } from '../config'

function IntentRing({ score, size = 64 }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 80 ? '#f97316' : score >= 50 ? '#f59e0b' : '#60a5fa'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth="5" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${progress} ${circumference - progress}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fill="white" fontSize={size / 4.2} fontWeight="700" fontFamily="Inter, sans-serif">
        {score}
      </text>
    </svg>
  )
}

function TempBadge({ temp }) {
  const map = {
    hot: 'bg-red-500/15 text-red-400 border-red-500/20',
    warm: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    cold: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${map[temp]}`}>
      {temp.charAt(0).toUpperCase() + temp.slice(1)}
    </span>
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

export default function Dashboard({ leads = [], loading = false, setPage, setSelectedLeadId }) {
  const priorityContacts = [...leads].sort((a, b) => b.intentScore - a.intentScore).slice(0, 5)
  const alerts = leads.filter(l => l.isAlerted)
  const stats = {
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.temperature === 'hot').length,
    avgScore: leads.length ? Math.round(leads.reduce((s, l) => s + l.intentScore, 0) / leads.length) : 0,
    activeAlerts: alerts.length,
  }
  const agentName = REALTOR.name.split(' ')[0]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 font-medium mb-1">{today}</p>
        <h2 className="text-3xl font-bold text-white">Good morning, {agentName} 👋</h2>
        {loading && <p className="text-xs text-gray-600 mt-1">Loading leads…</p>}
        <p className="text-gray-400 mt-1">You have <span className="text-orange-400 font-semibold">{stats.activeAlerts} alerts</span> and <span className="text-orange-400 font-semibold">{stats.hotLeads} hot leads</span> ready for action today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Leads" value={stats.totalLeads} sub="In your pipeline" color="bg-purple-600" />
        <StatCard icon={Flame} label="Hot Leads" value={stats.hotLeads} sub="Score 80+" color="bg-gradient-to-br from-orange-500 to-red-600" />
        <StatCard icon={TrendingUp} label="Avg Intent Score" value={stats.avgScore} sub="Across all leads" color="bg-blue-600" />
        <StatCard icon={Bell} label="Active Alerts" value={stats.activeAlerts} sub="Needs attention" color="bg-red-600" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Priority Contacts */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame size={18} className="text-orange-400" />
                Priority Contacts
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">Your top 5 by intent score right now</p>
            </div>
            <button
              onClick={() => setPage('leads')}
              className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {priorityContacts.map((lead, index) => (
              <button
                key={lead.id}
                onClick={() => { setSelectedLeadId(lead.id); setPage('lead-detail') }}
                className="w-full bg-gray-900 border border-gray-800 hover:border-orange-500/30 hover:bg-gray-900/80 rounded-2xl p-4 flex items-center gap-4 transition-all duration-150 text-left group"
              >
                {/* Rank */}
                <span className="text-2xl font-black text-gray-700 w-6 text-center flex-shrink-0">
                  {index + 1}
                </span>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-red-600/30 border border-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-300 flex-shrink-0">
                  {lead.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white">{lead.name}</span>
                    <TempBadge temp={lead.temperature} />
                  </div>
                  <p className="text-xs text-gray-400 truncate">{lead.summary}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {lead.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                    <span className="text-xs text-gray-600">· {lead.lastActive}</span>
                  </div>
                </div>

                {/* Score */}
                <IntentRing score={lead.intentScore} size={56} />

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={e => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center hover:bg-green-500/25 transition-colors"
                  >
                    <Phone size={14} className="text-green-400" />
                  </a>
                  <a
                    href={`mailto:${lead.email}`}
                    onClick={e => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/25 transition-colors"
                  >
                    <Mail size={14} className="text-blue-400" />
                  </a>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Alerts + Score legend */}
        <div className="space-y-5">
          {/* Active Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell size={17} className="text-red-400" />
                Active Alerts
              </h3>
              <button
                onClick={() => setPage('alerts')}
                className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium transition-colors"
              >
                All <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {alerts.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => { setSelectedLeadId(lead.id); setPage('lead-detail') }}
                  className="w-full text-left bg-gray-900 border border-red-500/20 rounded-xl p-3.5 hover:border-red-500/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-300">
                      {lead.initials}
                    </div>
                    <span className="font-semibold text-white text-sm">{lead.name}</span>
                    <span className="ml-auto text-xs font-bold text-gray-400">{lead.intentScore}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{lead.alertMessage}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      lead.alertType === 'ghosting' ? 'bg-red-500/15 text-red-400' :
                      lead.alertType === 'cooling' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-blue-500/15 text-blue-400'
                    }`}>
                      {lead.alertType === 'ghosting' ? 'Ghosting Risk' :
                       lead.alertType === 'cooling' ? 'Cooling Fast' : 'Re-engage'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Score Legend */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Intent Score Guide</h4>
            <div className="space-y-2.5">
              {[
                { label: 'Hot', range: '80–100', color: 'bg-red-500', desc: 'Call today' },
                { label: 'Warm', range: '50–79', color: 'bg-amber-500', desc: 'Follow up this week' },
                { label: 'Cold', range: '0–49', color: 'bg-blue-500', desc: 'Nurture & monitor' },
              ].map(({ label, range, color, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-300">{label}</span>
                    <span className="text-xs text-gray-600 ml-1.5">{range}</span>
                  </div>
                  <span className="text-xs text-gray-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick signal breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Signal Breakdown</h4>
            <div className="space-y-3">
              {[
                { label: 'Depth', desc: 'Photos & time on page', icon: '📸' },
                { label: 'Recency', desc: 'Frequency & timing', icon: '🕐' },
                { label: 'Financial', desc: 'Calculator & pre-approval', icon: '💰' },
              ].map(({ label, desc, icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-300">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
