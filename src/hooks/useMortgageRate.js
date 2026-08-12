import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

const getMortgageRate = httpsCallable(functions, 'getMortgageRate')

const FALLBACK_RATE = 6.8

// Fetches the current Freddie Mac 30-yr fixed rate (via FRED, server-side)
// for the mortgage calculator's default slider position. Falls back to a
// reasonable static estimate if the function is unreachable.
export function useMortgageRate() {
  const [rate, setRate] = useState(null)
  const [date, setDate] = useState(null)
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getMortgageRate()
      .then(({ data }) => {
        if (cancelled) return
        if (typeof data?.rate === 'number') {
          setRate(data.rate)
          setDate(data.date)
          setLive(Boolean(data.live))
        } else {
          setRate(FALLBACK_RATE)
          setLive(false)
        }
      })
      .catch((err) => {
        console.warn('getMortgageRate unavailable, using fallback rate:', err.message)
        if (!cancelled) { setRate(FALLBACK_RATE); setLive(false) }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { rate: rate ?? FALLBACK_RATE, date, live, loading }
}
