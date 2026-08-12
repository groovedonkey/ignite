import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'
import { mockListings } from '../data/mockListings'

const getMlsListings = httpsCallable(functions, 'getMlsListings')

// Fetches live MLS inventory via the getMlsListings Cloud Function (which
// proxies SimplyRETS server-side). Falls back to local mock listings if the
// function is unreachable (e.g. running the Vite dev server without the
// Firebase emulator) so the site never renders empty.
export function useMlsListings() {
  const [listings, setListings] = useState(mockListings)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMlsListings()
      .then(({ data }) => {
        if (cancelled) return
        if (data?.listings?.length) {
          setListings(data.listings)
          setLive(Boolean(data.live))
        } else {
          setListings(mockListings)
          setLive(false)
        }
      })
      .catch((err) => {
        console.warn('getMlsListings unavailable, showing demo listings:', err.message)
        if (!cancelled) { setListings(mockListings); setLive(false) }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { listings, loading, live }
}
