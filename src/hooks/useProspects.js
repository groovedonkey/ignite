import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { normalizeProspect } from '../utils/normalizeProspect'

export function useProspects(enabled = true) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(collection(db, 'prospects'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const normalized = snapshot.docs.map(normalizeProspect)
        normalized.sort((a, b) => b.intentScore - a.intentScore)
        setLeads(normalized)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore prospects listener error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [enabled])

  return { leads, loading, error }
}
