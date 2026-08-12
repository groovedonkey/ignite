import { useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, X, Phone, MessageSquare, Mail,
  Calendar as CalendarIcon, StickyNote, CalendarDays, Circle, CheckCircle2,
} from 'lucide-react'
import { createTask, completeTask, reopenTask, deleteTask, taskTiming, TASK_TYPES } from '../hooks/useTasks'

const TYPE_ICON = { call: Phone, text: MessageSquare, email: Mail, appointment: CalendarIcon, note: StickyNote }
const TYPE_DOT = {
  call: 'bg-green-400', text: 'bg-blue-400', email: 'bg-purple-400',
  appointment: 'bg-orange-400', note: 'bg-gray-400',
}
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function taskDate(task) {
  if (!task.dueAt) return null
  return task.dueAt.toDate ? task.dueAt.toDate() : new Date(task.dueAt.seconds * 1000)
}

function QuickAddForm({ leads, defaultDate, onClose }) {
  const [prospectId, setProspectId] = useState('')
  const [type, setType] = useState('call')
  const [dueDate, setDueDate] = useState(defaultDate)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-md space-y-4 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">New Event</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div>
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

        <div className="grid grid-cols-2 gap-3">
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
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50" />
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-500 mb-1.5">Time</label>
              <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Notes (optional)</label>
          <input
            type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="What's this about?"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !prospectId}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
        >
          {saving ? 'Saving…' : 'Add to Calendar'}
        </button>
      </form>
    </div>
  )
}

export default function Calendar({ leads = [], tasks = [], setPage, setSelectedLeadId }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedKey, setSelectedKey] = useState(() => toKey(new Date()))
  const [showForm, setShowForm] = useState(false)

  const byDay = useMemo(() => {
    const map = {}
    for (const t of tasks) {
      const d = taskDate(t)
      if (!d) continue
      const key = toKey(d)
      ;(map[key] ||= []).push(t)
    }
    for (const key in map) map[key].sort((a, b) => taskDate(a) - taskDate(b))
    return map
  }, [tasks])

  const weeks = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const gridStart = new Date(year, month, 1 - startOffset)
    const days = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      return d
    })
    const out = []
    for (let i = 0; i < 42; i += 7) out.push(days.slice(i, i + 7))
    return out
  }, [cursor])

  const todayKey = toKey(new Date())
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selectedTasks = byDay[selectedKey] || []
  const selectedDateObj = new Date(`${selectedKey}T00:00:00`)

  function openLead(prospectId) {
    setSelectedLeadId(prospectId)
    setPage('lead-detail')
  }

  function changeMonth(delta) {
    setCursor(c => { const d = new Date(c); d.setMonth(d.getMonth() + delta); return d })
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {showForm && (
        <QuickAddForm leads={leads} defaultDate={selectedKey} onClose={() => setShowForm(false)} />
      )}

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarDays size={22} className="text-orange-400" />
            Calendar
          </h2>
          <p className="text-sm text-gray-400 mt-1">Every scheduled call, text, email, and appointment in one view.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Month grid */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{monthLabel}</h3>
            <div className="flex items-center gap-1.5">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); setSelectedKey(toKey(new Date())) }}
                className="px-3 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
              >
                Today
              </button>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {weeks.flat().map((day, i) => {
              const key = toKey(day)
              const inMonth = day.getMonth() === cursor.getMonth()
              const dayTasks = byDay[key] || []
              const isToday = key === todayKey
              const isSelected = key === selectedKey
              return (
                <button
                  key={i}
                  onClick={() => setSelectedKey(key)}
                  className={`text-left rounded-xl p-2 min-h-[84px] border transition-colors ${
                    isSelected ? 'border-orange-500/50 bg-orange-500/10' : 'border-gray-800 hover:border-gray-700'
                  } ${inMonth ? 'bg-gray-900' : 'bg-gray-900/40'}`}
                >
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold mb-1 ${
                    isToday ? 'bg-orange-500 text-white' : inMonth ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {day.getDate()}
                  </span>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map(t => (
                      <div key={t.id} className={`flex items-center gap-1 text-[10px] truncate ${t.completed ? 'opacity-40 line-through' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOT[t.type] || TYPE_DOT.note}`} />
                        <span className="truncate">{t.prospectName}</span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-[10px] text-gray-600 font-medium">+{dayTasks.length - 3} more</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Day panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-fit">
          <h3 className="text-sm font-bold text-white mb-1">
            {selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {selectedTasks.length === 0 ? 'Nothing scheduled' : `${selectedTasks.length} event${selectedTasks.length > 1 ? 's' : ''}`}
          </p>

          {selectedTasks.length === 0 ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-6 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors text-sm"
            >
              <Plus size={14} /> Add event
            </button>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map(task => {
                const Icon = TYPE_ICON[task.type] || StickyNote
                const timing = taskTiming(task)
                return (
                  <div key={task.id} className={`flex items-start gap-2.5 bg-gray-800/50 border rounded-xl p-3 ${
                    task.completed ? 'border-gray-800/60 opacity-50' : 'border-gray-800'
                  }`}>
                    <button onClick={() => task.completed ? reopenTask(task.id) : completeTask(task.id)} className="mt-0.5 text-gray-500 hover:text-orange-400 transition-colors flex-shrink-0">
                      {task.completed ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} />}
                    </button>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${TYPE_DOT[task.type] || TYPE_DOT.note} bg-opacity-15`}>
                      <Icon size={11} className="text-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button onClick={() => openLead(task.prospectId)} className="text-sm font-semibold text-white hover:underline truncate block">
                        {task.prospectName}
                      </button>
                      <p className="text-xs text-gray-500">{timing.label}{task.notes ? ` — ${task.notes}` : ''}</p>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                )
              })}
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors text-xs font-medium mt-3"
              >
                <Plus size={12} /> Add another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
