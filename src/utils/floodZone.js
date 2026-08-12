// FEMA National Flood Hazard Layer lookup — public, keyless ArcGIS REST
// endpoint. Verified live: layer 28 is "Flood Hazard Zones" and returns
// FLD_ZONE codes (e.g. "X" = minimal risk, "AE"/"VE" = high-risk flood zones).
const FEMA_NFHL_URL =
  'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query'

const ZONE_INFO = {
  VE: { label: 'High-Risk Coastal (VE)', risk: 'high' },
  V: { label: 'High-Risk Coastal (V)', risk: 'high' },
  AE: { label: 'High-Risk Flood Zone (AE)', risk: 'high' },
  A: { label: 'High-Risk Flood Zone (A)', risk: 'high' },
  AO: { label: 'High-Risk — Shallow Flooding (AO)', risk: 'high' },
  AH: { label: 'High-Risk — Shallow Flooding (AH)', risk: 'high' },
  X: { label: 'Minimal Risk (Zone X)', risk: 'low' },
  D: { label: 'Undetermined Risk (Zone D)', risk: 'unknown' },
}

const cache = new Map()

// Looks up the FEMA flood zone for a point. Returns null (not an error
// object) on any failure so callers can render nothing rather than a
// broken badge — this hits a live third-party government service and
// should never block or break the listing UI.
export async function getFloodZone(lat, lng) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
  if (cache.has(key)) return cache.get(key)

  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'FLD_ZONE,ZONE_SUBTY',
    returnGeometry: 'false',
    f: 'json',
  })

  try {
    const res = await fetch(`${FEMA_NFHL_URL}?${params.toString()}`)
    if (!res.ok) throw new Error(`FEMA NFHL ${res.status}`)
    const data = await res.json()
    const zone = data?.features?.[0]?.attributes?.FLD_ZONE

    const result = zone
      ? { code: zone, ...(ZONE_INFO[zone] || { label: `Zone ${zone}`, risk: 'unknown' }) }
      : { code: null, label: 'No FEMA flood data available', risk: 'unknown' }

    cache.set(key, result)
    return result
  } catch (err) {
    console.warn('FEMA flood zone lookup failed (non-fatal):', err.message)
    return null
  }
}
