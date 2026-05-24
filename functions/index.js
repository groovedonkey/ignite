const { onDocumentCreated } = require('firebase-functions/v2/firestore')
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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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
          host: (EMAIL_HOST.value() || 'smtp.gmail.com').trim(),
          port: 587,
          secure: false,
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
