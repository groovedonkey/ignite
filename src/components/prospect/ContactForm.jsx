import { useState, useRef } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useSession } from '../../context/SessionContext'
import { Send, CheckCircle, X } from 'lucide-react'

const INTENTS = ['Buying', 'Selling', 'Renting', 'Just browsing']
const BUDGETS = ['Under $300K', '$300K–$500K', '$500K–$750K', '$750K–$1M', '$1M+', 'Not sure yet']

export default function ContactForm({ onClose }) {
  const { getSessionSummary } = useSession()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    intent: '', budget: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.intent) {
      setError('Please fill in your name, email, and what you\'re looking for.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const session = getSessionSummary()
      await addDoc(collection(db, 'prospects'), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        intent: form.intent,
        budget: form.budget,
        message: form.message.trim(),
        sessionId: session.sessionId,
        listingsViewed: session.listingsViewed,
        timeOnSite: session.timeOnSite,
        usedCalculator: session.usedCalculator,
        status: 'new',
        lastContactAt: null,
        aiSuggestion: null,
        aiGeneratedAt: null,
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're on the radar!</h3>
        <p className="text-gray-500 mb-6">
          I'll be in touch shortly. Keep an eye on your inbox.
        </p>
        <button
          onClick={onClose}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Let's Connect</h2>
          <p className="text-gray-500 text-sm mt-1">Tell me what you're looking for — I'll reach out personally.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={e => set('firstName', e.target.value)}
              placeholder="Jane"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={e => set('lastName', e.target.value)}
              placeholder="Smith"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="jane@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="(512) 555-0100"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I'm interested in... *</label>
          <div className="flex flex-wrap gap-2">
            {INTENTS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => set('intent', i)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  form.intent === i
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget range</label>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => set('budget', b)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  form.budget === b
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anything else?</label>
          <textarea
            value={form.message}
            onChange={e => set('message', e.target.value)}
            placeholder="Neighborhood preferences, timeline, must-haves..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send My Request
            </>
          )}
        </button>
      </form>
    </div>
  )
}
