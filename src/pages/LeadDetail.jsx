import { useState } from 'react'
import {
  ArrowLeft, Phone, Mail, Copy, Check, MapPin, Zap,
  Image, DollarSign, Heart, Search, RotateCcw, MessageSquare,
  Clock, TrendingUp, Home, ExternalLink
} from 'lucide-react'
import { leads } from '../data/mockData'

function IntentRing({ score, size = 80 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 80 ? '#f97316' : score >= 50 ? '#f59e0b' : '#60a5fa'
  const label = score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold'
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${progress} ${circumference - progress}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" textAnchor="middle" dy=".35em" fill="white" fontSize={size / 3.8} fontWeight="800" fontFamily="Inter, sans-serif">{score}</text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

const activityIcons = {
  photos: Image,
  financial: DollarSign,
  save: Heart,
  inquiry: Mail,
  search: Search,
  revisit: RotateCcw,
  calculator: DollarSign,
}

const activityColors = {
  photos: 'text-purple-400 bg-purple-500/15',
  financial: 'text-green-400 bg-green-500/15',
  save: 'text-pink-400 bg-pink-500/15',
  inquiry: 'text-blue-400 bg-blue-500/15',
  search: 'text-cyan-400 bg-cyan-500/15',
  revisit: 'text-orange-400 bg-orange-500/15',
  calculator: 'text-emerald-400 bg-emerald-500/15',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors font-medium"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function LeadDetail({ leadId, setPage }) {
  const lead = leads.find(l => l.id === leadId)
  const [activeTab, setActiveTab] = useState('text')

  if (!lead) return (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      Lead not found.
    </div>
  )

  const activeDraft = lead.smartDrafts.find(d => d.channel.toLowerCase() === activeTab)

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Back */}
      <button
        onClick={() => setPage('leads')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Leads
      </button>

      {/* Lead Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0 ${
            lead.temperature === 'hot' ? 'bg-orange-500/20 text-orange-300 border-2 border-orange-500/30' :
            lead.temperature === 'warm' ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/30' :
            'bg-blue-500/20 text-blue-300 border-2 border-blue-500/30'
          }`}>
            {lead.initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-2xl font-bold text-white">{lead.name}</h2>
              {lead.isAlerted && (
                <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                  ⚠ Alert Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap text-sm text-gray-400 mb-3">
              <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={13} /> {lead.phone}
              </a>
              <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail size={13} /> {lead.email}
              </a>
              <span className="flex items-center gap-1.5 text-gray-500">
                <Clock size={13} /> Active {lead.lastActive}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 font-medium">Source: {lead.source}</span>
              {lead.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Intent Score */}
          <div className="flex-shrink-0">
            <IntentRing score={lead.intentScore} size={88} />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Phone size={14} /> Call Now
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-sm font-semibold transition-colors border border-gray-700"
            >
              <Mail size={14} /> Send Email
            </a>
          </div>
        </div>

        {/* Summary */}
        {lead.alertMessage ? (
          <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-300 font-medium">⚠ {lead.alertMessage}</p>
          </div>
        ) : (
          <div className="mt-4 p-3.5 bg-gray-800/60 rounded-xl">
            <p className="text-sm text-gray-300 leading-relaxed">{lead.summary}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Activity + Properties */}
        <div className="col-span-2 space-y-6">
          {/* Activity Timeline */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={16} className="text-orange-400" />
              Behavioral Activity
            </h3>
            <div className="space-y-3">
              {lead.activity.map((item, i) => {
                const Icon = activityIcons[item.type] || Zap
                const colors = activityColors[item.type] || 'text-gray-400 bg-gray-700'
                return (
                  <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${item.highlight ? 'bg-orange-500/5 border border-orange-500/10' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${item.highlight ? 'text-white font-medium' : 'text-gray-300'}`}>{item.event}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{item.time}</p>
                    </div>
                    {item.highlight && (
                      <span className="text-xs bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Signal</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Smart Drafts */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-400" />
              Smart Draft
            </h3>
            <p className="text-xs text-gray-500 mb-4">AI-suggested message based on {lead.name.split(' ')[0]}'s behavior</p>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-800 rounded-xl p-1 mb-4 w-fit">
              {lead.smartDrafts.map(draft => (
                <button
                  key={draft.channel}
                  onClick={() => setActiveTab(draft.channel.toLowerCase())}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === draft.channel.toLowerCase()
                      ? 'bg-gray-700 text-white shadow'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {draft.channel}
                </button>
              ))}
            </div>

            {activeDraft && (
              <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                {activeDraft.subject && (
                  <p className="text-xs text-gray-500 mb-1">Subject: <span className="text-gray-300 font-medium">{activeDraft.subject}</span></p>
                )}
                <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{activeDraft.message}</p>
                <div className="flex justify-end mt-3">
                  <CopyButton text={activeDraft.message} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Score Breakdown + Properties */}
        <div className="space-y-5">
          {/* Score Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-400" />
              Intent Score Breakdown
            </h3>
            <div className="space-y-4">
              <ScoreBar label="📸 Depth" value={lead.scoreBreakdown.depth} color="bg-gradient-to-r from-purple-500 to-purple-400" />
              <ScoreBar label="🕐 Recency" value={lead.scoreBreakdown.recency} color="bg-gradient-to-r from-blue-500 to-cyan-400" />
              <ScoreBar label="💰 Financial" value={lead.scoreBreakdown.financial} color="bg-gradient-to-r from-green-500 to-emerald-400" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Overall Score</span>
                <span className="text-xl font-black text-white">{lead.intentScore}</span>
              </div>
            </div>
          </div>

          {/* Properties of Interest */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Home size={16} className="text-green-400" />
              Properties of Interest
            </h3>
            <div className="space-y-2">
              {lead.properties.map(prop => (
                <div key={prop} className="flex items-center gap-2.5 p-2.5 bg-gray-800/60 rounded-xl border border-gray-700/50">
                  <MapPin size={13} className="text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300 flex-1 min-w-0 truncate">{prop}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3">Contact Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <a href={`tel:${lead.phone}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">{lead.phone}</a>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <a href={`mailto:${lead.email}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors break-all">{lead.email}</a>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Source</p>
                <p className="text-sm text-gray-300">{lead.source}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
