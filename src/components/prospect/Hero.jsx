import { ArrowDown } from 'lucide-react'
import { REALTOR } from '../../config'

export default function Hero({ onContactClick }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&auto=format&fit=crop&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          Now serving Austin, TX
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          Find Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
            Perfect Home
          </span>
        </h1>

        <p className="text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
          {REALTOR.name} at {REALTOR.company} — {REALTOR.tagline}. Expert guidance from search to close.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() =>
              document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
          >
            View Listings
          </button>
          <button
            onClick={onContactClick}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all"
          >
            Talk to {REALTOR.name.split(' ')[0]}
          </button>
        </div>
      </div>

      <button
        onClick={() =>
          document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
        }
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ArrowDown className="w-6 h-6" />
      </button>
    </section>
  )
}
