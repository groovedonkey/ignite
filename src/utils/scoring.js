export function computeScore(prospect) {
  const now = Date.now()

  const listingScore = Math.min((prospect.listingsViewed?.length || 0) * 20, 40)
  const timeScore = Math.min(((prospect.timeOnSite || 0) / 60) * 3, 20)

  const createdMs =
    prospect.createdAt?.toDate?.().getTime() ||
    prospect.createdAt?.seconds * 1000 ||
    now
  const daysSinceCreated = (now - createdMs) / (1000 * 60 * 60 * 24)
  const recencyBonus = Math.max(0, 7 - daysSinceCreated) * 3

  const lastContactMs = prospect.lastContactAt?.toDate?.().getTime() ||
    (prospect.lastContactAt?.seconds ? prospect.lastContactAt.seconds * 1000 : null)
  const contactPenalty = lastContactMs
    ? Math.max(0, ((now - lastContactMs) / (1000 * 60 * 60 * 24) - 3) * 4)
    : 0

  const newBonus = prospect.status === 'new' ? 15 : 0

  const raw = listingScore + timeScore + recencyBonus + newBonus - contactPenalty
  return Math.max(0, Math.min(100, Math.round(raw)))
}

export function getScoreMeta(score) {
  if (score >= 70) return { label: 'Hot', bg: 'bg-red-500', text: 'text-red-400', ring: 'ring-red-500/30' }
  if (score >= 40) return { label: 'Warm', bg: 'bg-orange-500', text: 'text-orange-400', ring: 'ring-orange-500/30' }
  return { label: 'Cool', bg: 'bg-sky-500', text: 'text-sky-400', ring: 'ring-sky-500/30' }
}
