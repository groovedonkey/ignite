import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// Minimal, dependency-free CSV parser. Handles quoted fields containing
// commas/newlines (RFC 4180 basics) — enough for exports out of a phone's
// contacts app, a spreadsheet, or another CRM.
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field); field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(v => v !== '')) rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  if (rows.length === 0) return []

  const headers = rows[0].map(h => h.trim().toLowerCase())
  return rows.slice(1).map(cols => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = (cols[i] || '').trim() })
    return obj
  })
}

const HEADER_ALIASES = {
  firstname: 'firstName', 'first name': 'firstName', first: 'firstName',
  lastname: 'lastName', 'last name': 'lastName', last: 'lastName',
  email: 'email', 'email address': 'email',
  phone: 'phone', 'phone number': 'phone', mobile: 'phone',
  intent: 'intent', budget: 'budget', notes: 'message', message: 'message',
}

export function normalizeCsvRow(row) {
  const out = {}
  for (const [key, value] of Object.entries(row)) {
    const mapped = HEADER_ALIASES[key]
    if (mapped) out[mapped] = value
  }
  // Support a single combined "name" column by splitting on first space.
  if (!out.firstName && row.name) {
    const [first, ...rest] = row.name.trim().split(' ')
    out.firstName = first
    out.lastName = rest.join(' ')
  }
  return out
}

export async function bulkImportProspects(rows) {
  const results = { imported: 0, skipped: 0, errors: [] }

  for (const raw of rows) {
    const row = normalizeCsvRow(raw)
    if (!row.firstName || !row.email) {
      results.skipped++
      continue
    }
    try {
      await addDoc(collection(db, 'prospects'), {
        firstName: row.firstName,
        lastName: row.lastName || '',
        email: row.email.toLowerCase(),
        phone: row.phone || '',
        intent: row.intent || 'Not sure yet',
        budget: row.budget || 'Not sure yet',
        message: row.message || '',
        sessionId: null,
        listingsViewed: [],
        timeOnSite: 0,
        usedCalculator: false,
        status: 'imported',
        source: 'CSV Import',
        lastContactAt: null,
        aiSuggestion: null,
        aiGeneratedAt: null,
        stage: 'new',
        createdAt: serverTimestamp(),
      })
      results.imported++
    } catch (err) {
      results.errors.push(err.message)
    }
  }

  return results
}
