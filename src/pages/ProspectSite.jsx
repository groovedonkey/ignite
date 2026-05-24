import { useState } from 'react'
import Navbar from '../components/prospect/Navbar'
import Hero from '../components/prospect/Hero'
import Listings from '../components/prospect/Listings'
import MortgageCalculator from '../components/prospect/MortgageCalculator'
import ContactForm from '../components/prospect/ContactForm'
import Footer from '../components/prospect/Footer'
import { Shield, Award, Clock, Users, Home, TrendingUp, MapPin, Waves } from 'lucide-react'
import { REALTOR } from '../config'

const VALUES = [
  { icon: Shield, title: 'Local Expert', desc: "Deep roots in Brunswick and the Golden Isles — I know every neighborhood, every street, every hidden gem." },
  { icon: Award, title: 'Top Negotiator', desc: 'Consistently close at or above asking for sellers, and below list for buyers.' },
  { icon: Clock, title: 'Always Available', desc: "Real estate doesn't run 9-5. Neither do I. Reach me any time." },
  { icon: Users, title: 'People First', desc: 'No pressure tactics. Just honest advice and a genuine interest in your goals.' },
]

const MARKET_STATS = [
  { icon: Home, label: 'Median Home Price', value: '$389K', sub: 'Brunswick metro area' },
  { icon: TrendingUp, label: 'Price Growth', value: '+8.2%', sub: 'Year over year' },
  { icon: MapPin, label: 'Avg Days on Market', value: '31 days', sub: 'Homes selling fast' },
  { icon: Waves, label: 'Coastal Properties', value: '240+', sub: 'Active listings' },
]

export default function ProspectSite() {
  const [showModal, setShowModal] = useState(false)

  function openContact() {
    setShowModal(true)
  }

  return (
    <div className="bg-white text-gray-900">
      <Navbar onContactClick={openContact} />
      <Hero onContactClick={openContact} />

      {/* Market Stats Bar */}
      <section className="bg-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MARKET_STATS.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-sm font-medium text-gray-300 mt-0.5">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Listings onContactClick={openContact} />

      <MortgageCalculator onContactClick={openContact} />

      {/* About section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">About Me</p>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                I'm {REALTOR.name}. Brunswick is home — and I'll help you make it yours.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Whether you're relocating to the Georgia coast, upgrading to a waterfront home on St. Simons, or investing in the Golden Isles market — I bring the local expertise, market data, and personal attention to make your transaction seamless.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                I've closed hundreds of transactions from Brunswick's historic districts to Jekyll Island's oceanfront condos. My clients aren't just deals — they're relationships I take seriously long after the keys are handed over.
              </p>
              <button
                onClick={openContact}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
              >
                Let's Talk
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-3">Ready to Start?</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Your Golden Isles chapter starts here.</h2>
          <p className="text-slate-400 text-lg mb-10">
            Fill out a quick form and I'll reach out personally — usually within the hour.
          </p>
          <button
            onClick={openContact}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
          >
            Request Contact
          </button>
        </div>
      </section>

      <Footer />

      {/* Contact modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 z-10">
            <ContactForm onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
