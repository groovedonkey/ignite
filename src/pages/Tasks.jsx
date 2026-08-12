import { useState, useMemo } from 'react'
import {
  CheckCircle2, Circle, Phone, MessageSquare, Mail, Calendar as CalendarIcon,
  StickyNote, Plus, X, AlertCircle, Clock, ListChecks,
} from 'lucide-react'
import { createTask, completeTask, reopenTask, deleteTask, taskTiming, TASK_TYPES } from '../hooks/useTasks'

const TYPE_ICON = { call: Phone, text: MessageSquare, email: Mail, appointment: CalendarIcon, note: StickyNote }
const TYPE_COLOR = {
  call: 'text-green-400 bg-green-500/15 border-green-500/20',
  text: 'text-blue-400 bg-blue-500/15 border-blue-500/20',
  email: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
  appointment: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
  note: 'text-gray-400 bg-gray-500/15 border-gray-500/20',
}

const BUCKET_ORDER = ['overdue', 'today', 'upcoming']
const BUCKET_LABEL = { overdue: 'Overdue', today: 'Today', upcoming: 'Upcoming' }
const BUCKET_COLOR = { overdue: 'text-red-400', today: 'text-orange-400', upcoming: 'text-gray-300' }

function QuickAddForm({ leads, onClose, defaultProspectId }) {
  const [prospectId, setProspectId] = useState(defaultProspectId || '')
  const [type, setType] = useState('call')
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dueTime, setDueTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prospectId) return
    setSaving(true)
    const lead = leads.find(l => l.id === prospectId)
    try {
      await createTask({
        prospectId,
        prospectName: lead?.name || 'Unknown lead',
        type,
        dueAt: `${dueDate}T${dueTime}`,
        notes,
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Schedule a follow-up</h3>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1.5">Lead</label>
          <select
            value={prospectId}
            onChange={e => setProspectId(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50"
          >
            <option value="">Select a lead…</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50"
          >
            {TASK_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-gray-500 mb-1.5">Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1.5">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What's this follow-up about?"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !prospectId}
        className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
      >
        {saving ? 'Scheduling…' : 'Schedule Follow-up'}
      </button>
    </form>
  )
}

function TaskRow({ task, onToggle, onDelete, onOpenLead }) {
  const Icon = TYPE_ICON[task.type] || StickyNote
  const timing = taskTiming(task)

  return (
    <div className={`flex items-start gap-3 bg-gray-900 border rounded-xl p-3.5 transition-colors ${
      task.completed ? 'border-gray-800/60 opacity-50' : 'border-gray-800 hover:border-gray-700'
    }`}>
      <button onClick={() => onToggle(task)} className="mt-0.5 flex-shrink-0 text-gray-500 hover:text-orange-400 transition-colors">
        {task.completed ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} />}
      </button>

      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[task.type] || TYPE_COLOR.note}`}>
        <Icon size={13} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenLead(task.prospectId)}
            className={`text-sm font-semibold hover:underline ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}
          >
            {task.prospectName}
          </button>
          <span className="text-xs text-gray-600">·</span>
          <span className="text-xs text-gray-500 capitalize">{task.type}</span>
        </div>
        {task.notes && <p className="text-xs text-gray-400 mt-0.5">{task.notes}</p>}
        <p className={`text-xs mt-1 font-medium ${
          timing.bucket === 'overdue' && !task.completed ? 'text-red-400' : 'text-gray-500'
        }`}>
          {timing.label}
        </p>
      </div>

      <button onClick={() => onDelete(task.id)} className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0 p-1">
        <X size={14} />
      </button>
    </div>
  )
}

export default function Tasks({ leads = [], tasks = [], loading = false, setPage, setSelectedLeadId }) {
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const grouped = useMemo(() => {
    const open = tasks.filter(t => !t.completed)
    const groups = { overdue: [], today: [], upcoming: [] }
    for (const t of open) {
      const { bucket } = taskTiming(t)
      groups[bucket]?.push(t)
    }
    return groups
  }, [tasks])

  const completedTasks = tasks.filter(t => t.completed)

  function openLead(prospectId) {
    setSelectedLeadId(prospectId)
    setPage('lead-detail')
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ListChecks size={22} className="text-orange-400" />
            Tasks & Follow-ups
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {grouped.overdue.length > 0 && <span className="text-red-400 font-semibold">{grouped.overdue.length} overdue · </span>}
            {grouped.today.length} due today · {grouped.upcoming.length} upcoming
          </p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> Schedule Follow-up
        </button>
      </div>

      {showForm && <QuickAddForm leads={leads} onClose={() => setShowForm(false)} />}

      {loading ? (
        <p className="text-sm text-gray-600">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ListChecks size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-base font-medium">No follow-ups scheduled</p>
          <p className="text-sm mt-1">Schedule your first one, or open a lead and use "Next Step."</p>
        </div>
      ) : (
        <div className="space-y-8">
          {BUCKET_ORDER.map(bucket => (
            grouped[bucket].length > 0 && (
              <div key={bucket}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${BUCKET_COLOR[bucket]}`}>
                  {bucket === 'overdue' && <AlertCircle size={13} />}
                  {bucket === 'today' && <Clock size={13} />}
                  {BUCKET_LABEL[bucket]} ({grouped[bucket].length})
                </h3>
                <div className="space-y-2">
                  {grouped[bucket].map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={t => (t.completed ? reopenTask(t.id) : completeTask(t.id))}
                      onDelete={deleteTask}
                      onOpenLead={openLead}
                    />
                  ))}
                </div>
              </div>
            )
          ))}

          {completedTasks.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted(s => !s)}
                className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showCompleted ? 'Hide' : 'Show'} Completed ({completedTasks.length})
              </button>
              {showCompleted && (
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={t => (t.completed ? reopenTask(t.id) : completeTask(t.id))}
                      onDelete={deleteTask}
                      onOpenLead={openLead}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
