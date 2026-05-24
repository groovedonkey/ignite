import { mockListings } from '../../data/mockListings'
import ListingCard from './ListingCard'

export default function Listings({ onContactClick }) {
  return (
    <section id="listings" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Featured Listings</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Homes You'll Love</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Handpicked properties across Austin. Click any listing to explore details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
          {mockListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

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
