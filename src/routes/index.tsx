import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'

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

// Full templates for Restaurant and Cafe, generic for others
const TEMPLATES: Record<string, Record<string, Record<Tone, string>>> = {}

TEMPLATES['Restaurant'] = {
  Positive: {
    Professional: "Dear Valued Guest, Thank you for your wonderful review. We are delighted to hear that you had an excellent experience at our restaurant. Your satisfaction is our greatest reward, and we look forward to welcoming you back soon. Warm regards, The Restaurant Team",
    Friendly: "Hi! Thank you so much - we really appreciate you taking the time to share your kind words! Everyone here was so happy to hear you had a great time. We would love to welcome you back soon. See you again!",
    Apologetic: "Dear Guest, Thank you for your feedback. We are glad you enjoyed your visit, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again, and we look forward to seeing you soon.",
    Empathetic: "Hi there! Thank you for sharing such a thoughtful review - we are truly grateful for your kind words. It means a lot to our whole team to hear that we made your dining experience special. We look forward to creating more great memories for you soon.",
    Enthusiastic: "Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful for your wonderful words. Cannot wait to welcome you back - you made our day!",
  },
  Negative: {
    Professional: "Dear Guest, Thank you for bringing this to our attention. We sincerely apologize for the experience you had. We take all feedback seriously and have shared this with our team to ensure improvements are made. Please contact us directly so we can discuss this further. Sincerely, Restaurant Management",
    Friendly: "Hi there, I am truly sorry to hear that your experience was not what you expected. That really is not good enough, and we want to make it right. Please reach out to us directly so we can personally address your concerns. Thank you for giving us the chance to improve.",
    Apologetic: "Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right for you.",
    Empathetic: "Hi there, I can only imagine how disappointing that experience must have been for you, and I am so sorry. Your trust means everything to us, and we are committed to making things right. Please reach out to us directly - we truly want to fix this.",
    Enthusiastic: "Oh no! I am so sorry to hear you had a rough experience - that is not the kind of visit we want anyone to have! We are on it right away and want to personally make this better for you. Please reach out so we can sort it out together!",
  },
  Neutral: {
    Professional: "Dear Guest, Thank you for your review. We value your feedback and are continually looking for ways to improve our restaurant experience. We hope to welcome you back soon and exceed your expectations. Best regards, The Restaurant Team",
    Friendly: "Hi there! Thank you for sharing your feedback - we always appreciate hearing from our guests. We are always working to make every visit better, and your words help us get there. Come back and see us anytime!",
    Apologetic: "Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving every aspect of your experience. We hope to have the pleasure of serving you again in the future.",
    Empathetic: "Hi there, thank you for sharing your experience with us. We understand that every visit is different, and we truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.",
    Enthusiastic: "Hey! Thank you so much for the feedback - we really appreciate you letting us know how your visit went! We are always fired up to get better and better for you. Cannot wait to see you again and show you what we have been working on!",
  },
}

TEMPLATES['Cafe'] = {
  Positive: {
    Professional: "Dear Valued Guest, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our cafe. Your satisfaction is our greatest reward, and we look forward to serving you again soon. Warm regards, The Cafe Team",
    Friendly: "Hi! Thank you so much - we really appreciate your kind words! Our baristas were so happy to hear you loved your visit. We would love to welcome you back soon for another great cup.",
    Apologetic: "Dear Guest, Thank you for your positive feedback. We are glad you enjoyed your time with us, and we appreciate your support. We will keep working hard to maintain the quality you expect. Thank you again!",
    Empathetic: "Hi there! Thank you for sharing such a warm review - we truly appreciate it. It means so much to our whole team to hear that we made your cafe visit special. We look forward to seeing you again soon!",
    Enthusiastic: "Yay! Thank you so much! We are absolutely thrilled to hear you loved your time at our cafe! Our team is so excited and grateful. Cannot wait to make you your next favorite drink - see you soon!",
  },
  Negative: {
    Professional: "Dear Guest, Thank you for bringing this to our attention. We sincerely apologize for the experience you had. We take all feedback seriously and have shared this with our team. Please contact us directly so we can discuss this further. Sincerely, Cafe Management",
    Friendly: "Hi there, I am truly sorry to hear that. That is not the experience we want for any of our guests. Please reach out to us directly so we can personally address your concerns. Thank you for giving us the chance to do better.",
    Apologetic: "Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard we hold ourselves to, and we sincerely apologize. We have addressed this with our team. Please contact us so we can make this right.",
    Empathetic: "Hi there, I can only imagine how disappointing that experience was for you, and I am so sorry. Your trust means everything to us. Please reach out to us directly - we truly want to fix this for you.",
    Enthusiastic: "Oh no! I am so sorry to hear you had a rough time - that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!",
  },
  Neutral: {
    Professional: "Dear Guest, Thank you for your review. We value your feedback and are continually looking for ways to improve the cafe experience. We hope to welcome you back soon. Best regards, The Cafe Team",
    Friendly: "Hi there! Thank you for sharing your feedback - we always appreciate hearing from our guests. We are always working to improve, and your words help us get there. Come back and see us anytime!",
    Apologetic: "Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.",
    Empathetic: "Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.",
    Enthusiastic: "Hey! Thank you so much for the feedback - we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again!",
  },
}

TEMPLATES['Salon'] = {
  Positive: {
    Professional: "Dear Guest, Thank you for your wonderful review. We are thrilled to hear that you had a fantastic experience at our salon. Our team is committed to providing exceptional service, and your feedback truly motivates us. We look forward to seeing you again. Warm regards, The Salon Team",
    Friendly: "Hi! Your kind words really made our whole day! We are so happy you loved your visit. Our stylists genuinely enjoy making clients look and feel amazing. Cannot wait to see you again!",
    Apologetic: "Dear Guest, Thank you for your positive feedback. We are glad you enjoyed your visit, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!",
    Empathetic: "Hi there! Thank you for sharing such a thoughtful review - we are truly grateful for your kind words. It means a lot to our whole team to hear that we made your salon visit special. We look forward to seeing you again!",
    Enthusiastic: "Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back - you made our day!",
  },
  Negative: {
    Professional: "Dear Guest, We apologize for the disappointing experience you had at our salon. Your feedback has been shared with our team, and we are taking immediate steps to ensure this does not happen again. Please contact us directly so we can personally address your concerns. Sincerely, Salon Management",
    Friendly: "Hi there, I am so sorry to hear your visit did not meet your expectations. That is not the experience we want for any of our clients. I would love to talk with you directly and make things right - please reach out. Your trust means everything to us.",
    Apologetic: "Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right for you.",
    Empathetic: "Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us, and we are committed to making things right. Please reach out to us directly - we truly want to fix this.",
    Enthusiastic: "Oh no! I am so sorry to hear you had a rough experience - that is not the kind of visit we want anyone to have! We are on it right away and want to personally make this better for you. Please reach out so we can sort it out together!",
  },
  Neutral: {
    Professional: "Dear Guest, Thank you for your feedback. At our salon, we are committed to continuously improving our services. Your input is invaluable in helping us achieve that goal. We hope to have the opportunity to serve you again in the future. Best regards, Salon Team",
    Friendly: "Hi there! Thank you for sharing your thoughts - we always love hearing from our clients. We would love to welcome you back and show you the full salon experience. Come back anytime!",
    Apologetic: "Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving every aspect of your experience. We hope to have the pleasure of serving you again in the future.",
    Empathetic: "Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.",
    Enthusiastic: "Hey! Thank you so much for the feedback - we really appreciate you letting us know how your visit went! We are always fired up to get better and better for you. Cannot wait to see you again!",
  },
}

// Generic templates for all other business types
const GENERIC: Record<string, Record<Tone, string>> = {
  Positive: {
    Professional: "Dear Valued Customer, Thank you for your wonderful feedback. We are delighted to hear that you had a great experience. Your satisfaction is our greatest reward, and we look forward to serving you again soon. Warm regards, The Team",
    Friendly: "Hi! Thank you so much - we really appreciate you taking the time to share your experience. We are thrilled to hear you had a great visit. We would love to welcome you back soon!",
    Apologetic: "Dear Customer, Thank you for your positive feedback. We are glad you enjoyed your visit, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!",
    Empathetic: "Hi there! Thank you for sharing such a kind review - we truly appreciate it. It means so much to our whole team to hear that we made your visit special. We look forward to seeing you again!",
    Enthusiastic: "Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back - you made our day!",
  },
  Negative: {
    Professional: "Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Management",
    Friendly: "Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us - we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.",
    Apologetic: "Dear Customer, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.",
    Empathetic: "Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly - we truly want to fix this.",
    Enthusiastic: "Oh no! I am so sorry to hear you had a rough experience - that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!",
  },
  Neutral: {
    Professional: "Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to welcome you back soon. Best regards, The Team",
    Friendly: "Hi there! Thank you for sharing your feedback - we always appreciate hearing from our customers. We are always working to improve, and your words help us get there. Come back anytime!",
    Apologetic: "Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.",
    Empathetic: "Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.",
    Enthusiastic: "Hey! Thank you so much for the feedback - we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again!",
  },
}

// Fill in all other business types with generic templates
const otherTypes = ['Barbershop', 'Spa', 'Clinic', 'Dental', 'Pharmacy', 'Retail Store', 'Boutique', 'Gym', 'Hotel', 'Cleaning Service', 'Plumber', 'Electrician', 'Mechanic', 'Landscaper', 'Pet Grooming', 'Photographer', 'Event Venue', 'Spiritual Shop', 'Wellness Center', 'E-commerce Store', 'Jewellery Store', 'Real Estate', 'Online Boutique', 'Other']
for (const type of otherTypes) {
  TEMPLATES[type] = {
    Positive: { ...GENERIC.Positive },
    Negative: { ...GENERIC.Negative },
    Neutral: { ...GENERIC.Neutral },
  }
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

function fillTemplate(template: string, businessName: string): string {
  const name = businessName.trim()
  return template
    .replace(/The Restaurant Team/g, "The " + name + " Team")
    .replace(/The Cafe Team/g, "The " + name + " Team")
    .replace(/The Salon Team/g, "The " + name + " Team")
    .replace(/Clinic Team/g, name + " Team")
    .replace(/The Team/g, "The " + name + " Team")
    .replace(/Restaurant Management/g, name + " Management")
    .replace(/Cafe Management/g, name + " Management")
    .replace(/Salon Management/g, name + " Management")
    .replace(/Management/g, name + " Management")
}

function generateVariations(baseTemplate: string, businessName: string): string[] {
  const filled = fillTemplate(baseTemplate, businessName)
  const sentences = filled.split(/[.?!]+/).filter(s => s.trim().length > 5)
  const v1 = filled
  const v2 = sentences.slice(0, 2).join('. ') + '.'
  const v3 = filled + " We read every review carefully, and yours truly helped us understand what matters most to customers like you. Thank you for being part of the " + businessName.trim() + " community."
  return [v1, v2, v3]
}

function Home() {
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType>('Restaurant')
  const [tone, setTone] = useState<Tone>('Professional')
  const [reviewText, setReviewText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [replies, setReplies] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGetReplies = useCallback(() => {
    if (!businessName.trim() || !reviewText.trim()) return
    setIsLoading(true)
    setReplies([])
    setCopiedIndex(null)
    setTimeout(() => {
      const detected = detectReviewType(reviewText)
      const key = businessType === 'Other' ? 'Other' : businessType
      const template = TEMPLATES[key]?.[detected]?.[tone]
      if (!template) { setIsLoading(false); return }
      setReplies(generateVariations(template, businessName))
      setIsLoading(false)
    }, 800)
  }, [businessName, businessType, tone, reviewText])

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
