import { useState } from 'react'
import { Bed, Bath, Square, MapPin, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { useSession } from '../../context/SessionContext'

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p)
}

export default function ListingCard({ listing }) {
  const [expanded, setExpanded] = useState(false)
  const { logListingView } = useSession()

  function handleExpand() {
    if (!expanded) logListingView(listing)
    setExpanded(!expanded)
  }

  const statusColor = listing.status === 'Active'
    ? 'bg-emerald-500'
    : listing.status === 'Coming Soon'
    ? 'bg-sky-500'
    : 'bg-amber-500'

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`${statusColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
            {listing.status}
          </span>
          {listing.daysOnMarket <= 7 && listing.daysOnMarket > 0 && (
            <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              New
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full">
          {formatPrice(listing.price)}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{listing.address}, {listing.city}</span>
        </div>

        <div className="flex items-center gap-4 text-gray-700 text-sm mb-4">
          <span className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-orange-500" />
            {listing.beds} bd
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-orange-500" />
            {listing.baths} ba
          </span>
          <span className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-orange-500" />
            {listing.sqft.toLocaleString()} sqft
          </span>
        </div>

        <button
          onClick={handleExpand}
          className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors"
        >
          {expanded ? 'Show less' : 'See details'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{listing.description}</p>
            <ul className="grid grid-cols-2 gap-2">
              {listing.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
