import { Flame, Phone, Mail, MapPin } from 'lucide-react'
import { REALTOR } from '../../config'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">{REALTOR.company}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Helping Austin families find the home they deserve. Licensed, local, and genuinely invested in your outcome.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-300">Contact</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {REALTOR.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {REALTOR.email}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {REALTOR.location}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-300">Quick Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              {['Listings', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() =>
                      document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="hover:text-orange-400 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} {REALTOR.company}. All rights reserved.</p>
          <p>Powered by Ignite Lead Intelligence</p>
        </div>
      </div>
    </footer>
  )
}
