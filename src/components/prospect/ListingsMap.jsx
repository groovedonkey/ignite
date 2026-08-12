import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

// Vite doesn't resolve Leaflet's default marker image paths automatically —
// this is the standard workaround.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p)
}

export default function ListingsMap({ listings, onSelect }) {
  const withCoords = listings.filter(l => l.lat && l.lng)
  const center = withCoords.length
    ? [
        withCoords.reduce((s, l) => s + l.lat, 0) / withCoords.length,
        withCoords.reduce((s, l) => s + l.lng, 0) / withCoords.length,
      ]
    : [31.15, -81.45]

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '520px' }}>
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map(listing => (
          <Marker key={listing.id} position={[listing.lat, listing.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-gray-900">{listing.title}</p>
                <p className="text-gray-600">{listing.address}</p>
                <p className="text-orange-600 font-bold mt-1">{formatPrice(listing.price)}</p>
                <button
                  onClick={() => onSelect?.(listing)}
                  className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700 underline"
                >
                  View details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
