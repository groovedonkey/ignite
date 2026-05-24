import { computeScore } from './scoring'

function timeAgo(timestamp) {
  if (!timestamp) return 'Recently'
  const ms = Date.now() - (timestamp.toDate?.().getTime() ?? timestamp.seconds * 1000 ?? Date.now())
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function msAgo(timestamp) {
  if (!timestamp) return 0
  return Date.now() - (timestamp.toDate?.().getTime() ?? timestamp.seconds * 1000 ?? Date.now())
}

export function normalizeProspect(docSnapshot) {
  const raw = docSnapshot.data()
  const docId = docSnapshot.id

  // ── Seeded mock lead (already has intentScore + name) ────────────────────
  if (raw.intentScore !== undefined && raw.name) {
    return {
      ...raw,
      id: docId,
      smartDrafts: raw.smartDrafts?.length
        ? raw.smartDrafts
        : raw.aiSuggestion
          ? [{ channel: 'Text', message: raw.aiSuggestion }]
          : [],
      lastActiveMs: raw.lastActiveMs ?? msAgo(raw.createdAt),
    }
  }

  // ── Real prospect from contact form ───────────────────────────────────────
  const firstName = raw.firstName || ''
  const lastName = raw.lastName || ''
  const name = `${firstName} ${lastName}`.trim() || raw.email || 'Unknown'
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()

  const listingsViewed = raw.listingsViewed || []
  const timeMins = (raw.timeOnSite || 0) / 60
  const score = computeScore(raw)
  const temperature = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'

  const daysSinceCreated = raw.createdAt
    ? (Date.now() - (raw.createdAt.toDate?.().getTime() ?? raw.createdAt.seconds * 1000)) / 86400000
    : 0

  const isAlerted = raw.status === 'new' && daysSinceCreated > 1
  const alertType = isAlerted ? 'reengagement' : null
  const alertMessage = isAlerted
    ? `New contact — ${Math.floor(daysSinceCreated)} day${Math.floor(daysSinceCreated) > 1 ? 's' : ''} without follow-up.`
    : null

  const tags = [
    raw.intent,
    raw.budget && raw.budget !== 'Not sure yet' ? raw.budget : null,
    listingsViewed.length > 0 ? `Viewed ${listingsViewed.length} listing${listingsViewed.length > 1 ? 's' : ''}` : null,
    Math.round(timeMins) > 0 ? `${Math.round(timeMins)} min on site` : null,
  ].filter(Boolean)

  const summary = raw.message ||
    `${name} is interested in ${(raw.intent || 'buying').toLowerCase()}${raw.budget ? ` within ${raw.budget}` : ''}. ` +
    `Viewed ${listingsViewed.length} listing${listingsViewed.length !== 1 ? 's' : ''} and spent ${Math.round(timeMins)} minute${Math.round(timeMins) !== 1 ? 's' : ''} on site.`

  const activity = [
    ...listingsViewed.map((l, i) => ({
      id: i + 1,
      type: 'search',
      event: `Viewed ${l.title}${l.price ? ` — $${l.price.toLocaleString()}` : ''}`,
      time: 'During site visit',
      highlight: true,
    })),
    {
      id: listingsViewed.length + 1,
      type: 'inquiry',
      event: raw.message
        ? `Submitted contact form — "${raw.message.slice(0, 80)}${raw.message.length > 80 ? '…' : ''}"`
        : 'Submitted contact request form',
      time: timeAgo(raw.createdAt),
      highlight: false,
    },
  ]

  const smartDrafts = raw.aiSuggestion
    ? [
        { channel: 'Text', message: raw.aiSuggestion },
        {
          channel: 'Email',
          subject: `Following up on your home search`,
          message: raw.aiSuggestion,
        },
      ]
    : []

  const scoreBreakdown = {
    depth: Math.min(listingsViewed.length * 25, 100),
    recency: Math.max(0, Math.round(100 - daysSinceCreated * 12)),
    financial: raw.budget && raw.budget !== 'Not sure yet' ? 70 : 35,
  }

  return {
    id: docId,
    name,
    initials,
    email: raw.email || '',
    phone: raw.phone || '',
    source: 'Website',
    temperature,
    intentScore: score,
    lastActive: timeAgo(raw.createdAt),
    lastActiveMs: msAgo(raw.createdAt),
    tags,
    summary,
    properties: listingsViewed.map(l => l.title || l.address || 'Unknown listing'),
    scoreBreakdown,
    isAlerted,
    alertType,
    alertMessage,
    activity,
    smartDrafts,
    status: raw.status || 'new',
    createdAt: raw.createdAt,
    lastContactAt: raw.lastContactAt || null,
    intent: raw.intent || '',
    budget: raw.budget || '',
    message: raw.message || '',
    listingsViewed,
    timeOnSite: raw.timeOnSite || 0,
    aiSuggestion: raw.aiSuggestion || null,
    isMockLead: false,
  }
}
