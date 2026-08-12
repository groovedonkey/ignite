import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function useActivity(prospectId) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!prospectId) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    const q = query(collection(db, 'prospects', prospectId, 'activity'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEntries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Firestore activity listener error:', err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [prospectId])

  return { entries, loading }
}

export async function logActivity(prospectId, { channel, notes }) {
  return addDoc(collection(db, 'prospects', prospectId, 'activity'), {
    channel, // 'call' | 'text' | 'email' | 'note'
    notes: notes || '',
    createdAt: serverTimestamp(),
    loggedBy: 'agent',
  })
}
