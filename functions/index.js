const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
const { GoogleGenerativeAI } = require('@google/generative-ai')

admin.initializeApp()

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY')
const EMAIL_USER = defineSecret('EMAIL_USER')
const EMAIL_PASS = defineSecret('EMAIL_PASS')
const EMAIL_HOST = defineSecret('EMAIL_HOST')

const REALTOR_EMAIL = 'dro@groovedonkey.com'
const REALTOR_NAME = 'Pedro Gonzalez'
const CRM_URL = 'https://ignite-crm.web.app/portal'

exports.onProspectCreated = onDocumentCreated(
  { document: 'prospects/{prospectId}', secrets: [GEMINI_API_KEY, EMAIL_USER, EMAIL_PASS, EMAIL_HOST] },
  async (event) => {
    const prospect = event.data.data()
    const prospectId = event.params.prospectId

    const firstName = prospect.firstName || 'the prospect'
    const listingTitles = (prospect.listingsViewed || []).map(l => l.title).join(', ') || 'no specific listings'
    const timeMin = Math.round((prospect.timeOnSite || 0) / 60)
    const intent = prospect.intent || 'unspecified'
    const budget = prospect.budget || 'not specified'
    const message = prospect.message || ''

    let aiSuggestion = null

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value())
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const usedCalculator = prospect.usedCalculator === true

    const prompt = `You are helping a real estate agent craft a personalized first-contact message.

A prospect named ${firstName} ${prospect.lastName || ''} just submitted a contact request on the agent's website.

Here is what you know about them:
- Intent: ${intent}
- Budget: ${budget}
- Listings they viewed: ${listingTitles}
- Time spent on site: ${timeMin} minute(s)
- Used the mortgage calculator: ${usedCalculator ? 'Yes — they ran the numbers, strong financial intent signal' : 'No'}
- Their message: "${message}"

Write a warm, natural, 1-2 sentence outreach message the agent (${REALTOR_NAME}) can use as a text, email opener, or conversation starter. If they used the mortgage calculator, reference the financial research angle. Reference something specific from their visit if possible. Do NOT use generic sales language. Be conversational and genuine. Return ONLY the message text, no quotes, no explanation.`

      const result = await model.generateContent(prompt)
      aiSuggestion = result.response.text().trim()

      await event.data.ref.update({ aiSuggestion, aiGeneratedAt: admin.firestore.FieldValue.serverTimestamp() })
    } catch (err) {
      console.error('Gemini error:', err)
    }

    const emailUser = EMAIL_USER.value()
    const emailPass = EMAIL_PASS.value()

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: (EMAIL_HOST.value() || 'mail.groovedonkey.com').trim(),
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPass },
        })

        const listingSection = (prospect.listingsViewed || []).length > 0
          ? `\n📋 Listings Viewed:\n${prospect.listingsViewed.map(l => `  • ${l.title} — $${l.price?.toLocaleString()}`).join('\n')}`
          : '\n📋 Listings Viewed: None logged'

        const aiSection = aiSuggestion
          ? `\n💬 Suggested Opener (Gemini AI):\n"${aiSuggestion}"`
          : '\n💬 Suggested Opener: Generating...'

        const emailBody = `
🔥 NEW CONTACT REQUEST — Ignite Lead Intelligence

─────────────────────────────────
👤 PROSPECT
Name: ${prospect.firstName} ${prospect.lastName || ''}
Email: ${prospect.email}
Phone: ${prospect.phone || 'Not provided'}
Intent: ${intent}
Budget: ${budget}
─────────────────────────────────
📊 SITE ACTIVITY
Time on site: ${timeMin} min
Listings viewed: ${(prospect.listingsViewed || []).length}${listingSection}
─────────────────────────────────
💬 Their Message:
${message || '(no message)'}
─────────────────────────────────
${aiSection}
─────────────────────────────────
🔗 View in CRM: ${CRM_URL}
        `.trim()

        await transporter.sendMail({
          from: `Ignite CRM <${emailUser}>`,
          to: REALTOR_EMAIL,
          subject: `🔥 New Contact: ${prospect.firstName} ${prospect.lastName || ''} — ${intent} (${budget})`,
          text: emailBody,
        })
      } catch (err) {
        console.error('Email error:', err)
      }
    } else {
      console.log('Email not configured — skipping notification. Set EMAIL_USER and EMAIL_PASS env vars to enable.')
    }
  }
)

// ── AI chat widget (prospect-facing) ────────────────────────────────────────
// Called from the public site's ChatWidget. Keeps the Gemini key server-side
// and gives the model just enough context to answer like a local expert
// without pretending to have live MLS access it doesn't have yet.
const CHAT_SYSTEM_PROMPT = `You are a friendly, knowledgeable assistant on ${REALTOR_NAME}'s real estate website (${REALTOR_NAME}, ${REALTOR_NAME.split(' ')[0]}'s Golden Isles real estate business, serving Brunswick, St. Simons Island, Jekyll Island, and Sea Island, GA).

Your job: answer visitor questions about the local market, buying/selling process, financing basics, and the site's tools (listings, mortgage calculator) in 1-3 short sentences. Be warm and conversational, never pushy.

Important limits:
- You do NOT have access to live, real-time MLS inventory. If asked about a specific address or "what's for sale right now," say you don't have live listings in this chat and offer to connect them with ${REALTOR_NAME} directly, or point them to the Listings section on the page.
- Do not invent prices, addresses, or availability.
- For anything requiring real commitment (scheduling a showing, discussing a specific offer, contract questions), direct them to submit the contact form or reach ${REALTOR_NAME} directly — don't try to complete that yourself.
- Keep replies short — this is a chat widget, not an email.`

exports.chatWithAgent = onCall(
  { secrets: [GEMINI_API_KEY], cors: true },
  async (request) => {
    const message = (request.data?.message || '').toString().trim().slice(0, 1000)
    const history = Array.isArray(request.data?.history) ? request.data.history.slice(-10) : []

    if (!message) {
      throw new HttpsError('invalid-argument', 'A message is required.')
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value())
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: CHAT_SYSTEM_PROMPT })

      const chat = model.startChat({
        history: history
          .filter(m => m && m.role && m.text)
          .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.text).slice(0, 1000) }] })),
      })

      const result = await chat.sendMessage(message)
      const reply = result.response.text().trim()
      return { reply }
    } catch (err) {
      console.error('chatWithAgent error:', err)
      throw new HttpsError('internal', 'The assistant is unavailable right now. Please try the contact form instead.')
    }
  }
)

// ── Live MLS feed (prospect site listings) ──────────────────────────────────
// Proxies the SimplyRETS RESO API server-side so credentials never reach the
// browser. Ships working out of the box against SimplyRETS' public demo
// account (simplyrets/simplyrets — their own documented test credentials,
// returns realistic sample inventory); once a real MLS/IDX SimplyRETS
// subscription exists, set SIMPLYRETS_USER / SIMPLYRETS_PASS as function
// config (functions.config or a .env file next to index.js — no redeploy of
// this code required) and real listings take over automatically.
const SIMPLYRETS_DEMO_USER = 'simplyrets'
const SIMPLYRETS_DEMO_PASS = 'simplyrets'
const PLACEHOLDER_PHOTO = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=80'

let mlsCache = { data: null, ts: 0, live: false }
const MLS_TTL_MS = 10 * 60 * 1000 // 10 min — plenty fresh for a lead-gen site, easy on the API

function titleCase(s) {
  return (s || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase())
}

function transformSimplyRetsListing(raw) {
  const address = raw.address || {}
  const property = raw.property || {}
  const geo = raw.geo || {}
  const mls = raw.mls || {}

  const styleOrType = titleCase(property.style || property.subType || (property.type === 'RES' ? 'Single Family' : property.type) || 'Home')
  const highlights = [property.exteriorFeatures, property.interiorFeatures, property.view ? `${property.view} view` : null]
    .filter(Boolean)
    .join(', ')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean)
    .slice(0, 4)

  return {
    id: String(raw.mlsId || raw.listingId),
    title: `${styleOrType}${address.city ? ` in ${address.city}` : ''}`,
    address: address.full || '',
    city: [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
    lat: geo.lat ?? null,
    lng: geo.lng ?? null,
    price: raw.listPrice ?? 0,
    beds: property.bedrooms ?? 0,
    baths: (property.bathsFull || 0) + (property.bathsHalf ? property.bathsHalf * 0.5 : 0),
    sqft: property.area ?? 0,
    type: property.type === 'RES' ? 'Single Family' : titleCase(property.subType || property.type || 'Residential'),
    status: mls.status || 'Active',
    daysOnMarket: mls.daysOnMarket ?? 0,
    image: (raw.photos && raw.photos[0]) || PLACEHOLDER_PHOTO,
    highlights: highlights.length ? highlights : ['Recently updated', 'Move-in ready'],
    description: (raw.remarks || '').trim() || 'Contact us for full details on this property.',
  }
}

exports.getMlsListings = onCall({ cors: true }, async () => {
  const now = Date.now()
  if (mlsCache.data && now - mlsCache.ts < MLS_TTL_MS) {
    return { listings: mlsCache.data, live: mlsCache.live, source: 'cache' }
  }

  const user = (process.env.SIMPLYRETS_USER || SIMPLYRETS_DEMO_USER).trim()
  const pass = (process.env.SIMPLYRETS_PASS || SIMPLYRETS_DEMO_PASS).trim()
  const usingRealAccount = user !== SIMPLYRETS_DEMO_USER

  try {
    const auth = Buffer.from(`${user}:${pass}`).toString('base64')
    const res = await fetch('https://api.simplyrets.com/properties?limit=24&status=Active', {
      headers: { Authorization: `Basic ${auth}` },
    })
    if (!res.ok) throw new Error(`SimplyRETS ${res.status}`)
    const raw = await res.json()
    const listings = Array.isArray(raw) ? raw.map(transformSimplyRetsListing) : []

    mlsCache = { data: listings, ts: now, live: true }
    return { listings, live: true, source: usingRealAccount ? 'simplyrets' : 'simplyrets-demo' }
  } catch (err) {
    console.error('getMlsListings error:', err)
    // Serve the last good cache rather than nothing, if we have one.
    if (mlsCache.data) return { listings: mlsCache.data, live: mlsCache.live, source: 'stale-cache' }
    return { listings: [], live: false, source: 'error' }
  }
})

// ── Live mortgage rate (Freddie Mac PMMS via FRED) ──────────────────────────
// FRED publishes Freddie Mac's weekly Primary Mortgage Market Survey rate as
// a keyless public CSV — no API key needed, no secret to configure.
let rateCache = { data: null, ts: 0 }
const RATE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hrs — this series only updates weekly

exports.getMortgageRate = onCall({ cors: true }, async () => {
  const now = Date.now()
  if (rateCache.data && now - rateCache.ts < RATE_TTL_MS) {
    return rateCache.data
  }

  try {
    const res = await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US')
    if (!res.ok) throw new Error(`FRED ${res.status}`)
    const csv = await res.text()
    const lines = csv.trim().split('\n').slice(1) // drop header row
    let rate = null
    let date = null
    for (let i = lines.length - 1; i >= 0; i--) {
      const [d, v] = lines[i].split(',')
      const n = parseFloat(v)
      if (Number.isFinite(n)) { rate = n; date = d; break }
    }
    if (rate === null) throw new Error('No numeric rate found in FRED response')

    const result = { rate, date, source: 'FRED · Freddie Mac PMMS (30-yr fixed)', live: true }
    rateCache = { data: result, ts: now }
    return result
  } catch (err) {
    console.error('getMortgageRate error:', err)
    if (rateCache.data) return rateCache.data
    return { rate: null, date: null, source: 'unavailable', live: false }
  }
})
