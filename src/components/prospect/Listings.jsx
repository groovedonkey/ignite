import { useState, useMemo } from 'react'
import { LayoutGrid, Map as MapIcon, Radio, CircleDot, SlidersHorizontal } from 'lucide-react'
import { useMlsListings } from '../../hooks/useMlsListings'
import ListingCard from './ListingCard'
import ListingsMap from './ListingsMap'

const PRICE_OPTIONS = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under $300K', min: 0, max: 300000 },
  { label: '$300K–$500K', min: 300000, max: 500000 },
  { label: '$500K–$750K', min: 500000, max: 750000 },
  { label: '$750K–$1M', min: 750000, max: 1000000 },
  { label: '$1M+', min: 1000000, max: Infinity },
]

const BED_OPTIONS = ['Any Beds', '1+', '2+', '3+', '4+', '5+']

function LiveDataBadge({ loading, live }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" /> Loading listings…
      </span>
    )
  }
  return live ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
      <Radio className="w-3 h-3" /> Live MLS Data
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
      <CircleDot className="w-3 h-3" /> Demo Listings
    </span>
  )
}

export default function Listings({ onContactClick }) {
  const [view, setView] = useState('grid')
  const [priceIdx, setPriceIdx] = useState(0)
  const [bedsIdx, setBedsIdx] = useState(0)
  const [type, setType] = useState('Any Type')
  const { listings, loading, live } = useMlsListings()

  const types = useMemo(() => ['Any Type', ...new Set(listings.map(l => l.type).filter(Boolean))], [listings])

  const filtered = useMemo(() => {
    const price = PRICE_OPTIONS[priceIdx]
    const minBeds = bedsIdx > 0 ? bedsIdx : 0
    return listings.filter(l =>
      l.price >= price.min && l.price < price.max &&
      (l.beds || 0) >= minBeds &&
      (type === 'Any Type' || l.type === type)
    )
  }, [listings, priceIdx, bedsIdx, type])

  return (
    <section id="listings" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div className="text-center flex-1 min-w-[280px]">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Featured Listings</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Homes You'll Love</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Handpicked properties across Brunswick and the Golden Isles. Click any listing to explore details.
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <LiveDataBadge loading={loading} live={live} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
          </span>
          <select
            value={priceIdx}
            onChange={e => setPriceIdx(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            {PRICE_OPTIONS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
          </select>
          <select
            value={bedsIdx}
            onChange={e => setBedsIdx(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            {BED_OPTIONS.map((b, i) => <option key={b} value={i}>{b}</option>)}
          </select>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                view === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                view === 'map' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon size={14} /> Map
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 mb-14">
            <p>No listings match those filters right now — try widening your search.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mb-14">
            <ListingsMap listings={filtered} />
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-500 mb-5">Don't see what you're looking for? Let's find it together.</p>
          <button
            onClick={onContactClick}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-md shadow-orange-500/20"
          >
            Request a Custom Search
          </button>
        </div>
      </div>
    </section>
  )
}
