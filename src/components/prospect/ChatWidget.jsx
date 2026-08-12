import { useState, useRef, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { MessageCircle, X, Send, Flame } from 'lucide-react'
import { functions } from '../../firebase'
import { REALTOR } from '../../config'

const chatWithAgent = httpsCallable(functions, 'chatWithAgent')

const GREETING = `Hi! I'm here to help with questions about the local market or ${REALTOR.name.split(' ')[0]}'s listings. What can I help with?`

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', text: GREETING }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    setError(false)

    try {
      const { data } = await chatWithAgent({
        message: text,
        history: nextMessages.slice(-10),
      })
      setMessages(m => [...m, { role: 'assistant', text: data.reply }])
    } catch (err) {
      console.error(err)
      setError(true)
      setMessages(m => [...m, { role: 'assistant', text: `Sorry, I'm having trouble right now — please use the contact form and ${REALTOR.name.split(' ')[0]} will get back to you directly.` }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-slate-900 px-4 py-3.5 flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Flame size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">{REALTOR.company}</p>
              <p className="text-gray-400 text-xs leading-tight">Usually replies within minutes</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question…"
              disabled={sending}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
          {error && (
            <p className="text-xs text-red-500 text-center pb-2 px-3 -mt-1">
              Having trouble connecting — try again or use the contact form.
            </p>
          )}
        </div>
      )}
    </>
  )
}
