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
  const [reviewText, setReviewText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [replies, setReplies] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGetReplies = useCallback(async () => {
    if (!businessName.trim() || !reviewText.trim()) return
    setIsLoading(true)
    setReplies([])
    setCopiedIndex(null)
    setError(null)

    try {
      const sentiment = detectReviewType(reviewText)
      const result = await generateReplies({
        businessName: businessName.trim(),
        businessType,
        tone,
        reviewText: reviewText.trim(),
        reviewSentiment: sentiment,
      })
      setReplies(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [businessName, businessType, tone, reviewText, generateReplies])

  const handleCopy = (reply: string, index: number) => {
    copyToClipboard(reply)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ReplyAI</h1>
          </div>
          <p className="text-gray-500 text-base">Professional review replies in seconds</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="space-y-5">
            <div>
              <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">Your Business Name</label>
              <input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Joe's Cafe" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition" />
            </div>
            <div>
              <label htmlFor="businessType" className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
              <select id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value as BusinessType)} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white">
                {BUSINESS_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="tone" className="block text-sm font-semibold text-gray-700 mb-2">Reply Tone</label>
              <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white">
                {TONES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="reviewText" className="block text-sm font-semibold text-gray-700 mb-2">Customer Review</label>
              <textarea id="reviewText" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Paste the customer's review here..." rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none" />
            </div>
            <button type="button" onClick={handleGetReplies} disabled={!businessName.trim() || !reviewText.trim() || isLoading} className="w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold text-base hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {isLoading ? 'Generating...' : 'Get Replies'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded-lg w-20" />
                  <div className="h-8 bg-gray-200 rounded-lg w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && replies.length > 0 && (
          <div className="space-y-4 mb-6">
            <p className="text-sm font-medium text-gray-500 text-center">3 reply variations for {businessName}</p>
            {replies.map((reply, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Variation {i + 1}</span>
                  <button type="button" onClick={() => handleCopy(reply, i)} className={"text-sm font-medium px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 " + (copiedIndex === i ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {copiedIndex === i ? (
                      <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Copied!</>
                    ) : (
                      <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                    )}
                  </button>
                </div>
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{reply}</p>
              </div>
            ))}
            <button type="button" onClick={handleGetReplies} className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Regenerate
            </button>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs mt-12">ReplyAI - Made for small business owners</p>
      </div>
    </main>
  )
}
