import { Bell, TrendingDown, Ghost, RefreshCw, Phone, Mail, ArrowRight } from 'lucide-react'
import { alerts, leads } from '../data/mockData'

const alertConfig = {
  cooling: {
    icon: TrendingDown,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    label: 'Cooling Fast',
  },
  ghosting: {
    icon: Ghost,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    badge: 'bg-red-500/15 text-red-400 border-red-500/20',
    label: 'Ghosting Risk',
  },
  reengagement: {
    icon: RefreshCw,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    label: 'Re-engage Now',
  },
}

function IntentRing({ score, size = 56 }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 80 ? '#f97316' : score >= 50 ? '#f59e0b' : '#60a5fa'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${progress} ${circumference - progress}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fill="white" fontSize={size / 4} fontWeight="700" fontFamily="Inter, sans-serif">{score}</text>
    </svg>
  )
}

export default function Alerts({ setPage, setSelectedLeadId }) {
  const totalLeads = leads.length
  const hotCount = leads.filter(l => l.temperature === 'hot').length

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Bell size={22} className="text-red-400" />
          Active Alerts
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {alerts.length} lead{alerts.length !== 1 ? 's' : ''} need your attention right now
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Bell size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-base font-medium">No active alerts</p>
          <p className="text-sm mt-1">All your leads are looking healthy.</p>
        </div>
      ) : (
        <>
          {/* Alert summary strip */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Object.entries(alertConfig).map(([type, cfg]) => {
              const count = alerts.filter(a => a.alertType === type).length
              const Icon = cfg.icon
              return (
                <div key={type} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex items-center gap-4`}>
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Alert Cards */}
          <div className="space-y-4">
            {alerts.map(lead => {
              const cfg = alertConfig[lead.alertType] || alertConfig.reengagement
              const Icon = cfg.icon
              const draft = lead.smartDrafts?.[0]

              return (
                <div
                  key={lead.id}
                  className={`bg-gray-900 border ${cfg.border} rounded-2xl p-6`}
                >
                  <div className="flex items-start gap-5">
                    {/* Alert icon */}
                    <div className={`w-11 h-11 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={20} className={cfg.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-white">{lead.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-300 mb-3 leading-relaxed">{lead.alertMessage}</p>

                      {/* Last activity */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span>Last active: <span className="text-gray-300 font-medium">{lead.lastActive}</span></span>
                        <span>Source: <span className="text-gray-300 font-medium">{lead.source}</span></span>
                        <span>Score: <span className="text-gray-300 font-medium">{lead.intentScore}</span></span>
                      </div>

                      {/* Suggested draft preview */}
                      {draft && (
                        <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl p-3.5 mb-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-gray-400">💬 Suggested {draft.channel}</span>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{draft.message}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => { setSelectedLeadId(lead.id); setPage('lead-detail') }}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                          View Full Profile <ArrowRight size={13} />
                        </button>
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/15 border border-green-500/20 hover:bg-green-500/25 text-green-400 rounded-xl text-sm font-semibold transition-colors"
                        >
                          <Phone size={13} /> Call
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/15 border border-blue-500/20 hover:bg-blue-500/25 text-blue-400 rounded-xl text-sm font-semibold transition-colors"
                        >
                          <Mail size={13} /> Email
                        </a>
                      </div>
                    </div>

                    {/* Score ring */}
                    <div className="flex-shrink-0">
                      <IntentRing score={lead.intentScore} size={60} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Healthy leads note */}
      <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
        <p className="text-sm text-gray-400">
          <span className="text-gray-200 font-semibold">{totalLeads - alerts.length} other leads</span> are being monitored and are currently healthy.
          <span className="text-green-400 font-medium"> {hotCount} hot leads</span> are active and scored 80+.
        </p>
      </div>
    </div>
  )
}
