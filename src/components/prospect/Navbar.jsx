import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import { REALTOR } from '../../config'

export default function Navbar({ onContactClick }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-lg tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            {REALTOR.company}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {['Listings', 'About', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === 'Contact') { onContactClick?.(); return }
                document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                scrolled ? 'text-slate-700' : 'text-white/90'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          onClick={onContactClick}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
        >
          Get in Touch
        </button>
      </div>
    </header>
  )
}
