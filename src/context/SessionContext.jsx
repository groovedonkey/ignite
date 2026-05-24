import { createContext, useContext, useRef, useState } from 'react'
import { getOrCreateSessionId } from '../utils/session'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [sessionId] = useState(getOrCreateSessionId)
  const sessionStartRef = useRef(Date.now())
  const viewedListingsRef = useRef([])

  function logListingView(listing) {
    const already = viewedListingsRef.current.find(l => l.id === listing.id)
    if (!already) {
      viewedListingsRef.current = [
        ...viewedListingsRef.current,
        { id: listing.id, title: listing.title, price: listing.price, address: listing.address },
      ]
    }
  }

  function getSessionSummary() {
    return {
      sessionId,
      listingsViewed: viewedListingsRef.current,
      timeOnSite: Math.round((Date.now() - sessionStartRef.current) / 1000),
    }
  }

  return (
    <SessionContext.Provider value={{ sessionId, logListingView, getSessionSummary }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
