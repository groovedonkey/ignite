import { useState } from 'react'
import { Search, Filter, Phone, Mail, ArrowUpDown, Flame } from 'lucide-react'
import { leads } from '../data/mockData'

function IntentRing({ score, size = 52 }) {
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

function TempBadge({ temp }) {
  const map = {
    hot: 'bg-red-500/15 text-red-400 border-red-500/20',
    warm: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    cold: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  }
  const dot = { hot: 'bg-red-400', warm: 'bg-amber-400', cold: 'bg-blue-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${map[temp]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[temp]}`} />
      {temp.charAt(0).toUpperCase() + temp.slice(1)}
    </span>
  )
}

function SourceBadge({ source }) {
  const map = {
    Zillow: 'bg-blue-500/10 text-blue-400',
    Website: 'bg-purple-500/10 text-purple-400',
    Facebook: 'bg-indigo-500/10 text-indigo-400',
    Instagram: 'bg-pink-500/10 text-pink-400',
    Referral: 'bg-green-500/10 text-green-400',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[source] || 'bg-gray-700 text-gray-400'}`}>
      {source}
    </span>
  )
}

const FILTERS = ['All', 'Hot', 'Warm', 'Cold']

export default function Leads({ setPage, setSelectedLeadId }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = leads
    .filter(l => {
      const matchesFilter = filter === 'All' || l.temperature === filter.toLowerCase()
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => sortDir === 'desc' ? b.intentScore - a.intentScore : a.intentScore - b.intentScore)

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">All Leads</h2>
        <p className="text-sm text-gray-400 mt-1">
          {filtered.length} lead{filtered.length !== 1 ? 's' : ''} · sorted by intent score
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors"
        >
          <ArrowUpDown size={14} />
          Score {sortDir === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {/* Lead Cards */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No leads match your search.</p>
          </div>
        )}
        {filtered.map(lead => (
          <button
            key={lead.id}
            onClick={() => { setSelectedLeadId(lead.id); setPage('lead-detail') }}
            className="w-full text-left bg-gray-900 border border-gray-800 hover:border-orange-500/25 rounded-2xl px-5 py-4 flex items-center gap-5 transition-all duration-150 group"
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              lead.temperature === 'hot' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/20' :
              lead.temperature === 'warm' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/20'
            }`}>
              {lead.initials}
            </div>

            {/* Name + details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">{lead.name}</span>
                <TempBadge temp={lead.temperature} />
                {lead.isAlerted && (
                  <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-medium">Alert</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">{lead.email}</span>
                <span className="text-gray-700">·</span>
                <SourceBadge source={lead.source} />
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-600">Active {lead.lastActive}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {lead.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>

            {/* Score bars */}
            <div className="hidden lg:flex flex-col gap-1.5 w-36">
              {[
                { label: 'Depth', val: lead.scoreBreakdown.depth },
                { label: 'Recency', val: lead.scoreBreakdown.recency },
                { label: 'Financial', val: lead.scoreBreakdown.financial },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-14 text-right">{label}</span>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Score ring */}
            <IntentRing score={lead.intentScore} size={52} />

            {/* Quick actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={`tel:${lead.phone}`}
                onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center hover:bg-green-500/25 transition-colors"
                title="Call"
              >
                <Phone size={13} className="text-green-400" />
              </a>
              <a
                href={`mailto:${lead.email}`}
                onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/25 transition-colors"
                title="Email"
              >
                <Mail size={13} className="text-blue-400" />
              </a>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
