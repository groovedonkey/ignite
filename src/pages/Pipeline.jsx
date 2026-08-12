import { Kanban, Phone, Mail } from 'lucide-react'
import { STAGES, updateStage } from '../utils/prospectActions'

const STAGE_COLOR = {
  new: 'border-t-blue-500',
  contacted: 'border-t-cyan-500',
  showing: 'border-t-purple-500',
  offer: 'border-t-amber-500',
  under_contract: 'border-t-orange-500',
  closed: 'border-t-green-500',
}

function LeadCard({ lead, setSelectedLeadId, setPage }) {
  const nextStageOptions = STAGES.filter(s => s.id !== lead.stage)

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-3.5 transition-colors">
      <button
        onClick={() => { setSelectedLeadId(lead.id); setPage('lead-detail') }}
        className="text-left w-full"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-white text-sm truncate">{lead.name}</span>
          <span className="text-xs font-bold text-gray-500 flex-shrink-0 ml-2">{lead.intentScore}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{lead.source} · {lead.lastActive}</p>
      </button>

      <div className="flex items-center gap-1.5 mt-2.5">
        <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()}
          className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center hover:bg-green-500/25 transition-colors">
          <Phone size={12} className="text-green-400" />
        </a>
        <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()}
          className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/25 transition-colors">
          <Mail size={12} className="text-blue-400" />
        </a>
        <select
          value=""
          onChange={e => e.target.value && updateStage(lead.id, e.target.value)}
          className="ml-auto text-xs bg-gray-800 border border-gray-700 rounded-lg px-1.5 py-1 text-gray-400 focus:outline-none focus:border-orange-500/50"
        >
          <option value="">Move to…</option>
          {nextStageOptions.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function Pipeline({ leads = [], setPage, setSelectedLeadId }) {
  const byStage = STAGES.map(stage => ({
    ...stage,
    leads: leads.filter(l => (l.stage || 'new') === stage.id),
  }))

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Kanban size={22} className="text-orange-400" />
          Pipeline
        </h2>
        <p className="text-sm text-gray-400 mt-1">{leads.length} leads across {STAGES.length} stages</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {byStage.map(stage => (
          <div key={stage.id} className="flex-shrink-0 w-72">
            <div className={`bg-gray-900/60 border-t-2 ${STAGE_COLOR[stage.id]} border-x border-b border-gray-800 rounded-2xl p-3.5 h-full`}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold text-gray-200">{stage.label}</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                  {stage.leads.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {stage.leads.length === 0 ? (
                  <p className="text-xs text-gray-700 text-center py-6">No leads</p>
                ) : (
                  stage.leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} setPage={setPage} setSelectedLeadId={setSelectedLeadId} />
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
