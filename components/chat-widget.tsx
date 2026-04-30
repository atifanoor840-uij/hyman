"use client"
import { useState } from "react"
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "faqs">("home")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  const mainFaqs = [
    { q: "What is Dragon Funded?", a: "An evaluation-based prop program offering simulated evaluations and funded accounts upon passing." },
    { q: "How does the evaluation work?", a: "Two phases with profit targets and risk rules. Pass both to receive a funded account." },
    { q: "When are payouts processed?", a: "Twice per month on the 1st and 15th, if eligibility requirements are met." },
    { q: "What platforms are supported?", a: "We support MetaTrader 5 (MT5) and MetaTrader 4 (MT4)." },
    { q: "Main trading rules?", a: "5% daily loss, 10% max drawdown, news restrictions, and minimum trading days." },
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-[300px] sm:w-[360px] md:w-[380px] lg:w-[400px] max-w-[calc(100vw-2rem)] h-[450px] sm:h-[480px] md:h-[500px] lg:h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
          {/* Header */}
          <div className="relative px-4 pt-4 pb-3 bg-gradient-to-b from-[#DEBF74]/10 via-transparent to-transparent border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#DEBF74] flex items-center justify-center shadow-md">
                  <img src="https://res.cloudinary.com/dufcjjaav/image/upload/v1760892554/dragon_funded_logo-01-01-01_bkaqko.png" alt="Dragon Funded" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900">Dragon Funded</div>
                  <div className="text-xs text-gray-600">How can we help?</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-4 flex-1 overflow-y-auto">
            {activeTab === "home" && (
              <div className="space-y-3">
                <button onClick={() => setActiveTab("faqs")} className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">Browse FAQs</div>
                      <div className="text-xs text-gray-600">Quick answers</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            )}

            

            {activeTab === "faqs" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-700">FAQs</div>
                  <a href="/faqs" className="text-xs text-[#DEBF74] hover:text-[#DEBF74]/80 font-medium hover:underline">View all</a>
                </div>
                <div className="space-y-2">
                  {mainFaqs.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full text-left px-3 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-900 text-xs font-medium pr-2 leading-tight">{item.q}</span>
                          <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-3 pb-3 text-xs text-gray-600 leading-relaxed border-t border-gray-200 bg-white">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabbar */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setActiveTab("home")} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${activeTab==='home' ? 'bg-[#DEBF74] text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Home</span>
              </button>
              <button onClick={() => setActiveTab("faqs")} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${activeTab==='faqs' ? 'bg-[#DEBF74] text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>FAQs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-[0_6px_20px_rgba(222,191,116,0.3)] bg-[#DEBF74] text-[#111827] font-semibold hover:bg-[#DEBF74]/90 transition-all duration-200 border-0 hover:shadow-[0_8px_25px_rgba(222,191,116,0.4)] hover:scale-105"
        aria-label="Open chat"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM7 9h10v2H7V9Zm0-4h10v2H7V5Zm0 8h7v2H7v-2Z"/>
        </svg>
      </button>
    </div>
  )
}
