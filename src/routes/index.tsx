import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Home,
})

type BusinessType =
  | 'Restaurant' | 'Cafe' | 'Salon' | 'Barbershop' | 'Spa' | 'Clinic'
  | 'Dental' | 'Pharmacy' | 'Retail Store' | 'Boutique' | 'Gym' | 'Hotel'
  | 'Cleaning Service' | 'Plumber' | 'Electrician' | 'Mechanic' | 'Landscaper'
  | 'Pet Grooming' | 'Photographer' | 'Event Venue'
  | 'Spiritual Shop' | 'Wellness Center' | 'E-commerce Store'
  | 'Jewellery Store' | 'Real Estate' | 'Online Boutique' | 'Other'

type Tone = 'Professional' | 'Friendly' | 'Apologetic' | 'Empathetic' | 'Enthusiastic'

type Platform = 'Google' | 'Facebook' | 'Yelp' | 'TripAdvisor' | 'Trustpilot' | 'Other'

const PLATFORMS: { value: Platform; icon: string; selectedColor: string }[] = [
  { value: 'Google',      icon: 'G',  selectedColor: 'border-blue-400 bg-blue-50 text-blue-700 ring-blue-300' },
  { value: 'Facebook',    icon: 'f',  selectedColor: 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-indigo-300' },
  { value: 'Yelp',        icon: 'Y',  selectedColor: 'border-red-400 bg-red-50 text-red-700 ring-red-300' },
  { value: 'TripAdvisor', icon: 'T',  selectedColor: 'border-green-400 bg-green-50 text-green-700 ring-green-300' },
  { value: 'Trustpilot',  icon: '★',  selectedColor: 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-emerald-300' },
  { value: 'Other',       icon: '•',  selectedColor: 'border-gray-400 bg-gray-100 text-gray-700 ring-gray-300' },
]

function detectReviewType(reviewText: string): 'Positive' | 'Negative' | 'Neutral' {
  const lower = reviewText.toLowerCase()
  const positiveWords = ['love', 'great', 'amazing', 'excellent', 'fantastic', 'wonderful', 'awesome', 'best', 'perfect', 'incredible', 'delicious', 'friendly', 'helpful', 'beautiful', 'recommend', 'impressed', 'outstanding', 'brilliant', 'lovely', 'enjoyed', 'satisfied', 'happy', 'pleased', 'thank', 'thanks', 'appreciate']
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'poor', 'disappointed', 'rude', 'slow', 'cold', 'broken', 'wrong', 'never', 'hate', 'annoyed', 'frustrated', 'unhappy', 'upset', 'problem', 'issue', 'complaint', 'refund', 'waste', 'overpriced']
  let posCount = 0, negCount = 0
  for (const w of positiveWords) { if (lower.includes(w)) posCount++ }
  for (const w of negativeWords) { if (lower.includes(w)) negCount++ }
  if (posCount > negCount) return 'Positive'
  if (negCount > posCount) return 'Negative'
  return 'Neutral'
}

const TONES: Tone[] = ['Professional', 'Friendly', 'Apologetic', 'Empathetic', 'Enthusiastic']
const BUSINESS_TYPES: BusinessType[] = [
  'Restaurant', 'Cafe', 'Salon', 'Barbershop', 'Spa', 'Clinic', 'Dental',
  'Pharmacy', 'Retail Store', 'Boutique', 'Gym', 'Hotel', 'Cleaning Service',
  'Plumber', 'Electrician', 'Mechanic', 'Landscaper', 'Pet Grooming',
  'Photographer', 'Event Venue', 'Spiritual Shop', 'Wellness Center',
  'E-commerce Store', 'Jewellery Store', 'Real Estate', 'Online Boutique', 'Other',
]

const SENTIMENT_CONFIG = {
  Positive: { label: '😊 Positive', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Negative: { label: '😔 Negative', bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200' },
  Neutral:  { label: '😐 Neutral',  bg: 'bg-gray-50',  text: 'text-gray-500',  border: 'border-gray-200' },
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  })
}

function Home() {
  const generateReplies = useAction(api.replies.generateReplies)

  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType>('Restaurant')
  const [tone, setTone] = useState<Tone>('Professional')
  const [platform, setPlatform] = useState<Platform>('Google')
  const [reviewText, setReviewText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [replies, setReplies] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sentiment = reviewText.trim() ? detectReviewType(reviewText) : null
  const isReady = businessName.trim().length > 0 && reviewText.trim().length > 0

  const handleGetReplies = useCallback(async () => {
    if (!businessName.trim() || !reviewText.trim()) return
    setIsLoading(true)
    setReplies([])
    setCopiedIndex(null)
    setError(null)
    try {
      const reviewSentiment = detectReviewType(reviewText)
      const result = await generateReplies({
        businessName: businessName.trim(),
        businessType,
        tone,
        platform,
        reviewText: reviewText.trim(),
        reviewSentiment,
      })
      setReplies(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [businessName, businessType, tone, platform, reviewText, generateReplies])

  const handleCopy = (reply: string, index: number) => {
    copyToClipboard(reply)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ReplyAI</h1>
          </div>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">AI-powered replies for every platform — tailored to your business in seconds.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-5">
          <div className="space-y-5">

            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Himalayan Kitchen"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
              />
            </div>

            {/* Platform Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Review Platform</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PLATFORMS.map(({ value, icon, selectedColor }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPlatform(value)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition font-medium text-xs ${
                      platform === value
                        ? selectedColor + ' ring-2 ring-offset-1 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                    }`}
                  >
                    <span className="text-base font-bold leading-none">{icon}</span>
                    <span className="leading-none">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Type + Tone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="businessType" className="block text-sm font-semibold text-gray-700 mb-1.5">Business Type</label>
                <select id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value as BusinessType)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white text-sm">
                  {BUSINESS_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="tone" className="block text-sm font-semibold text-gray-700 mb-1.5">Reply Tone</label>
                <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white text-sm">
                  {TONES.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
            </div>

            {/* Review Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reviewText" className="block text-sm font-semibold text-gray-700">Customer Review</label>
                {sentiment && (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${SENTIMENT_CONFIG[sentiment].bg} ${SENTIMENT_CONFIG[sentiment].text} ${SENTIMENT_CONFIG[sentiment].border}`}>
                    {SENTIMENT_CONFIG[sentiment].label}
                  </span>
                )}
              </div>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Paste the customer's review or social media post here..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleGetReplies}
              disabled={!isReady || isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating replies…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate {platform} Replies
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="space-y-4 mb-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-100 rounded-lg w-24" />
                  <div className="h-8 bg-gray-100 rounded-lg w-16" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-11/12" />
                  <div className="h-3 bg-gray-100 rounded w-4/6" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Replies */}
        {!isLoading && replies.length > 0 && (
          <div className="space-y-4 mb-5">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-gray-700">
                {platform} replies for <span className="text-green-600">{businessName}</span>
              </p>
              {sentiment && (
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${SENTIMENT_CONFIG[sentiment].bg} ${SENTIMENT_CONFIG[sentiment].text} ${SENTIMENT_CONFIG[sentiment].border}`}>
                  {SENTIMENT_CONFIG[sentiment].label}
                </span>
              )}
            </div>
            {replies.map((reply, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-green-200 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm font-semibold text-gray-700">Variation {i + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(reply, i)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 border ${
                      copiedIndex === i
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    {copiedIndex === i ? (
                      <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Copied!</>
                    ) : (
                      <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                    )}
                  </button>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{reply}</p>
              </div>
            ))}
            <button
              type="button"
              onClick={handleGetReplies}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Regenerate
            </button>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs mt-8">ReplyAI — Reputation management for businesses, media & public figures</p>
      </div>
    </main>
  )
}
