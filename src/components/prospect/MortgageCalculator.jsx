import { useState, useEffect, useCallback } from 'react'
import { Calculator, DollarSign, Percent, Calendar, TrendingUp } from 'lucide-react'
import { useSession } from '../../context/SessionContext'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Slider({ label, value, min, max, step, format, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-orange-600">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-500"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

export default function MortgageCalculator({ onContactClick }) {
  const { logCalculatorUse } = useSession()

  const [homePrice, setHomePrice] = useState(450000)
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [interestRate, setInterestRate] = useState(6.8)
  const [termYears, setTermYears] = useState(30)
  const [hasLogged, setHasLogged] = useState(false)

  const downPayment = Math.round(homePrice * (downPaymentPct / 100))
  const loanAmount = homePrice - downPayment
  const monthlyRate = interestRate / 100 / 12
  const numPayments = termYears * 12

  const monthlyPayment = monthlyRate === 0
    ? loanAmount / numPayments
    : (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)

  const totalPaid = monthlyPayment * numPayments
  const totalInterest = totalPaid - loanAmount

  const handleInteract = useCallback(() => {
    if (!hasLogged) {
      logCalculatorUse()
      setHasLogged(true)
    }
  }, [hasLogged, logCalculatorUse])

  useEffect(() => {
    if (hasLogged) return
    const timer = setTimeout(() => {
      logCalculatorUse()
      setHasLogged(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [hasLogged, logCalculatorUse])

  const pctPrincipal = Math.round((loanAmount / totalPaid) * 100)
  const pctInterest = 100 - pctPrincipal

  return (
    <section id="calculator" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Plan Your Purchase</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Calculator className="w-9 h-9 text-orange-500" />
            Mortgage Calculator
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Get a quick estimate of your monthly payment. Ready to talk numbers with a real expert?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Controls */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8" onChange={handleInteract}>
            <Slider
              label="Home Price"
              value={homePrice}
              min={150000}
              max={2000000}
              step={5000}
              format={v => formatCurrency(v)}
              onChange={v => { setHomePrice(v); handleInteract() }}
            />
            <Slider
              label={`Down Payment (${downPaymentPct}% = ${formatCurrency(downPayment)})`}
              value={downPaymentPct}
              min={3}
              max={50}
              step={1}
              format={v => `${v}%`}
              onChange={v => { setDownPaymentPct(v); handleInteract() }}
            />
            <Slider
              label="Interest Rate"
              value={interestRate}
              min={3}
              max={12}
              step={0.1}
              format={v => `${v.toFixed(1)}%`}
              onChange={v => { setInterestRate(v); handleInteract() }}
            />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">Loan Term</label>
              <div className="flex gap-3">
                {[10, 15, 20, 30].map(y => (
                  <button
                    key={y}
                    onClick={() => { setTermYears(y); handleInteract() }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      termYears === y
                        ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
                    }`}
                  >
                    {y} yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Main payment card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 text-white shadow-lg shadow-orange-500/20">
              <p className="text-orange-100 text-sm font-medium mb-1">Estimated Monthly Payment</p>
              <p className="text-5xl font-extrabold mb-4">{formatCurrency(monthlyPayment)}<span className="text-2xl font-normal text-orange-100">/mo</span></p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/15 rounded-2xl p-3">
                  <p className="text-orange-100 text-xs mb-1">Loan Amount</p>
                  <p className="font-bold text-lg">{formatCurrency(loanAmount)}</p>
                </div>
                <div className="bg-white/15 rounded-2xl p-3">
                  <p className="text-orange-100 text-xs mb-1">Down Payment</p>
                  <p className="font-bold text-lg">{formatCurrency(downPayment)}</p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" /> Loan Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm text-gray-600">Principal</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(loanAmount)}</span>
                    <span className="text-xs text-gray-400 ml-2">{pctPrincipal}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-sm text-gray-600">Total Interest</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalInterest)}</span>
                    <span className="text-xs text-gray-400 ml-2">{pctInterest}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex mt-1">
                  <div className="bg-orange-500 h-full" style={{ width: `${pctPrincipal}%` }} />
                  <div className="bg-amber-400 h-full flex-1" />
                </div>
                <div className="flex justify-between text-xs font-semibold pt-1 border-t border-gray-100">
                  <span className="text-gray-500">Total Cost</span>
                  <span className="text-gray-900">{formatCurrency(totalPaid)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center px-2">
              * Estimate only. Does not include taxes, insurance, HOA, or PMI. Consult a lender for an official quote.
            </p>

            <button
              onClick={onContactClick}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Get Pre-Qualified — Talk to Pedro
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
