import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Home,
})

// ─── TYPES ────────────────────────────────────────────────────────────────────

type PersonType =
  | 'Politician / Candidate'
  | 'Minister / MP'
  | 'Mayor / Local Official'
  | 'Public Figure'
  | 'Media Personality'
  | 'Activist / NGO Leader'
  | 'Small Business'
  | 'Other'

type Tone =
  | 'Diplomatic'
  | 'Firm & Factual'
  | 'Empathetic'
  | 'Crisis Control'
  | 'Grateful'
  | 'Professional'
  | 'Friendly'

type Platform = 'Facebook' | 'Twitter / X' | 'YouTube' | 'Instagram' | 'LinkedIn' | 'Google' | 'News / Media' | 'Other'

type SituationType =
  | 'Constituent Complaint'
  | 'Opposition Attack'
  | 'Misinformation / Rumor'
  | 'Policy Criticism'
  | 'Personal Attack'
  | 'Positive Support'
  | 'Press / Media Question'
  | 'Crisis Response'
  | 'General Review'

type MonitorResult = {
  id: string
  source: 'news' | 'youtube' | 'reddit' | 'web'
  title: string
  snippet: string
  url: string
  publishedAt?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PLATFORMS: { value: Platform; icon: string; color: string }[] = [
  { value: 'Facebook',     icon: 'f',  color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { value: 'Twitter / X',  icon: '𝕏',  color: 'border-gray-700 bg-gray-900 text-white' },
  { value: 'YouTube',      icon: '▶',  color: 'border-red-400 bg-red-50 text-red-700' },
  { value: 'Instagram',    icon: '◈',  color: 'border-pink-400 bg-pink-50 text-pink-700' },
  { value: 'LinkedIn',     icon: 'in', color: 'border-blue-600 bg-blue-50 text-blue-800' },
  { value: 'Google',       icon: 'G',  color: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'News / Media', icon: '📰', color: 'border-orange-400 bg-orange-50 text-orange-700' },
  { value: 'Other',        icon: '•',  color: 'border-gray-300 bg-gray-50 text-gray-600' },
]

const PERSON_TYPES: PersonType[] = [
  'Politician / Candidate', 'Minister / MP', 'Mayor / Local Official',
  'Public Figure', 'Media Personality', 'Activist / NGO Leader',
  'Small Business', 'Other',
]

const SITUATION_TYPES: SituationType[] = [
  'Constituent Complaint', 'Opposition Attack', 'Misinformation / Rumor',
  'Policy Criticism', 'Personal Attack', 'Positive Support',
  'Press / Media Question', 'Crisis Response', 'General Review',
]

const TONES: Tone[] = [
  'Diplomatic', 'Firm & Factual', 'Empathetic',
  'Crisis Control', 'Grateful', 'Professional', 'Friendly',
]

const SITUATION_ICONS: Record<SituationType, string> = {
  'Constituent Complaint': '😤',
  'Opposition Attack': '⚔️',
  'Misinformation / Rumor': '🚫',
  'Policy Criticism': '📋',
  'Personal Attack': '🎯',
  'Positive Support': '👏',
  'Press / Media Question': '🎤',
  'Crisis Response': '🔥',
  'General Review': '⭐',
}

const SENTIMENT_CONFIG = {
  positive: { label: '😊 Positive', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  negative: { label: '😔 Negative', bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200' },
  neutral:  { label: '😐 Neutral',  bg: 'bg-gray-50',  text: 'text-gray-500',  border: 'border-gray-200' },
}

const SOURCE_CONFIG = {
  news:    { label: 'News',    icon: '📰', color: 'bg-orange-100 text-orange-700' },
  youtube: { label: 'YouTube', icon: '▶',  color: 'bg-red-100 text-red-700' },
  reddit:  { label: 'Reddit',  icon: '🔴', color: 'bg-orange-100 text-orange-800' },
  web:     { label: 'Web',     icon: '🌐', color: 'bg-blue-100 text-blue-700' },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase()
  const pos = ['great', 'excellent', 'support', 'win', 'congratul', 'success', 'good', 'best', 'love', 'amazing', 'proud', 'strong']
  const neg = ['scandal', 'corrupt', 'fail', 'resign', 'arrest', 'attack', 'accuse', 'fraud', 'incompetent', 'lie', 'lied', 'wrong', 'crisis', 'bad', 'terrible', 'protest', 'anger']
  let p = 0, n = 0
  for (const w of pos) { if (lower.includes(w)) p++ }
  for (const w of neg) { if (lower.includes(w)) n++ }
  if (p > n) return 'positive'
  if (n > p) return 'negative'
  return 'neutral'
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  })
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

function Home() {
  const generateReplies = useAction(api.replies.generateReplies)
  const searchMentions = useAction(api.monitor.searchMentions)

  const [activeTab, setActiveTab] = useState<'reply' | 'monitor'>('reply')

  // Reply tab state
  const [name, setName] = useState('')
  const [personType, setPersonType] = useState<PersonType>('Politician / Candidate')
  const [platform, setPlatform] = useState<Platform>('Facebook')
  const [situation, setSituation] = useState<SituationType>('General Review')
  const [tone, setTone] = useState<Tone>('Diplomatic')
  const [commentText, setCommentText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [replies, setReplies] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [replyError, setReplyError] = useState<string | null>(null)

  // Monitor tab state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<MonitorResult[]>([])
  const [monitorError, setMonitorError] = useState<string | null>(null)
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')
  const [replyingTo, setReplyingTo] = useState<MonitorResult | null>(null)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [isQuickGenerating, setIsQuickGenerating] = useState(false)
  const [quickCopied, setQuickCopied] = useState<number | null>(null)

  // ── Reply tab handlers ──────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!name.trim() || !commentText.trim()) return
    setIsGenerating(true)
    setReplies([])
    setCopiedIndex(null)
    setReplyError(null)
    try {
      const result = await generateReplies({
        businessName: name.trim(),
        businessType: personType,
        tone,
        platform,
        reviewText: commentText.trim(),
        reviewSentiment: detectSentiment(commentText) === 'positive' ? 'Positive' : detectSentiment(commentText) === 'negative' ? 'Negative' : 'Neutral',
        situationType: situation,
      })
      setReplies(result)
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [name, personType, platform, situation, tone, commentText, generateReplies])

  const handleCopy = (text: string, index: number) => {
    copyToClipboard(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // ── Monitor tab handlers ────────────────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setResults([])
    setMonitorError(null)
    setReplyingTo(null)
    setQuickReplies([])
    try {
      const data = await searchMentions({ query: searchQuery.trim() })
      setResults(data as MonitorResult[])
    } catch (err) {
      setMonitorError(err instanceof Error ? err.message : 'Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, searchMentions])

  const handleQuickReply = useCallback(async (result: MonitorResult) => {
    setReplyingTo(result)
    setQuickReplies([])
    setIsQuickGenerating(true)
    try {
      const sourcePlatform: Platform =
        result.source === 'youtube' ? 'YouTube' :
        result.source === 'reddit' ? 'Other' :
        result.source === 'news' ? 'News / Media' : 'Other'

      const detectedSentiment = result.sentiment ?? detectSentiment(result.title + ' ' + result.snippet)
      const sentimentLabel = detectedSentiment === 'positive' ? 'Positive' : detectedSentiment === 'negative' ? 'Negative' : 'Neutral'

      const autoSituation: SituationType =
        detectedSentiment === 'negative' ? 'Policy Criticism' :
        detectedSentiment === 'positive' ? 'Positive Support' : 'General Review'

      const data = await generateReplies({
        businessName: searchQuery.trim(),
        businessType: personType,
        tone,
        platform: sourcePlatform,
        reviewText: `${result.title}. ${result.snippet}`,
        reviewSentiment: sentimentLabel,
        situationType: autoSituation,
      })
      setQuickReplies(data)
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Failed to generate reply.')
    } finally {
      setIsQuickGenerating(false)
    }
  }, [searchQuery, personType, tone, generateReplies])

  const filteredResults = filterSentiment === 'all'
    ? results
    : results.filter(r => (r.sentiment ?? detectSentiment(r.title + r.snippet)) === filterSentiment)

  const isReplyReady = name.trim().length > 0 && commentText.trim().length > 0

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* ── Header ── */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">ReplyAI</h1>
              <p className="text-xs text-gray-400 leading-none mt-0.5">ORM for public figures</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('reply')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${activeTab === 'reply' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✍️ Reply
            </button>
            <button
              onClick={() => setActiveTab('monitor')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${activeTab === 'monitor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🔍 Monitor
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1 — REPLY GENERATOR
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'reply' && (
          <div className="space-y-5">

            {/* Name + Person Type */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name / Organisation</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Minister Sanjay Thapa"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Who are you?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PERSON_TYPES.map(pt => (
                    <button
                      key={pt}
                      onClick={() => setPersonType(pt)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition text-center ${
                        personType === pt
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-200'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORMS.map(({ value, icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setPlatform(value)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition text-xs font-semibold ${
                      platform === value ? `${color} ring-2 ring-offset-1 ring-emerald-300 shadow-sm` : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span className="leading-none text-center px-1">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Situation + Tone */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What type of comment is this?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SITUATION_TYPES.map(sit => (
                    <button
                      key={sit}
                      onClick={() => setSituation(sit)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                        situation === sit
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-200'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span>{SITUATION_ICONS[sit]}</span>
                      <span>{sit}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reply Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition ${
                        tone === t
                          ? 'bg-slate-800 border-slate-800 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Paste the comment / post / article
              </label>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Paste the comment, social media post, or news excerpt here..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={!isReplyReady || isGenerating}
                className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-green-700 transition shadow-sm flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating replies…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Generate {platform} Replies</>
                )}
              </button>
            </div>

            {/* Error */}
            {replyError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{replyError}</div>
            )}

            {/* Loading skeletons */}
            {isGenerating && (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                    <div className="flex justify-between mb-3"><div className="h-4 bg-gray-100 rounded w-20"/><div className="h-7 bg-gray-100 rounded w-14"/></div>
                    <div className="space-y-2"><div className="h-3 bg-gray-100 rounded w-full"/><div className="h-3 bg-gray-100 rounded w-5/6"/><div className="h-3 bg-gray-100 rounded w-4/6"/></div>
                  </div>
                ))}
              </div>
            )}

            {/* Replies */}
            {!isGenerating && replies.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-600 px-1">3 reply variations — {platform}</p>
                {replies.map((reply, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-emerald-200 transition">
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i+1}</span>
                        Variation {i+1}
                      </span>
                      <button
                        onClick={() => handleCopy(reply, i)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                          copiedIndex === i ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        {copiedIndex === i ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{reply}</p>
                  </div>
                ))}
                <button
                  onClick={handleGenerate}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  Regenerate
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2 — MONITOR & SEARCH
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'monitor' && (
          <div className="space-y-5">

            {/* Search Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Search mentions across News, YouTube & Reddit</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. Minister Sanjay Thapa, KP Sharma Oli..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-green-700 transition flex items-center gap-2"
                >
                  {isSearching ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : '🔍'}
                  {isSearching ? 'Searching…' : 'Search'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Searches News (Mediastack), YouTube, and Reddit simultaneously</p>
            </div>

            {/* Error */}
            {monitorError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{monitorError}</div>
            )}

            {/* Loading */}
            {isSearching && (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0"/>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-3/4"/>
                        <div className="h-3 bg-gray-100 rounded w-full"/>
                        <div className="h-3 bg-gray-100 rounded w-2/3"/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {!isSearching && results.length > 0 && (
              <div className="space-y-4">
                {/* Filter bar */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">{results.length} mentions found for "<span className="text-emerald-600">{searchQuery}</span>"</p>
                  <div className="flex gap-1.5">
                    {(['all', 'negative', 'positive', 'neutral'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilterSentiment(f)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                          filterSentiment === f
                            ? f === 'negative' ? 'bg-red-100 text-red-700 border-red-200'
                            : f === 'positive' ? 'bg-green-100 text-green-700 border-green-200'
                            : f === 'neutral' ? 'bg-gray-200 text-gray-700 border-gray-300'
                            : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {f === 'all' ? `All (${results.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredResults.map(result => {
                  const sentiment = result.sentiment ?? detectSentiment(result.title + ' ' + result.snippet)
                  const src = SOURCE_CONFIG[result.source]
                  const sentConf = SENTIMENT_CONFIG[sentiment]
                  return (
                    <div key={result.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-emerald-200 transition">
                      <div className="flex items-start gap-3">
                        {/* Source icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${src.color}`}>
                          {src.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-gray-900 hover:text-emerald-600 transition line-clamp-2 leading-snug"
                            >
                              {result.title}
                            </a>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${sentConf.bg} ${sentConf.text} ${sentConf.border}`}>
                              {sentConf.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{result.snippet}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${src.color}`}>{src.label}</span>
                              {result.publishedAt && <span className="text-xs text-gray-400">{timeAgo(result.publishedAt)}</span>}
                            </div>
                            <button
                              onClick={() => handleQuickReply(result)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                            >
                              ✍️ Generate Reply
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick reply panel */}
                      {replyingTo?.id === result.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {isQuickGenerating ? (
                            <div className="space-y-2 animate-pulse">
                              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl"/>)}
                            </div>
                          ) : quickReplies.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-500 mb-2">3 reply suggestions:</p>
                              {quickReplies.map((r, i) => (
                                <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                  <p className="flex-1 text-xs text-gray-700 leading-relaxed">{r}</p>
                                  <button
                                    onClick={() => {
                                      copyToClipboard(r)
                                      setQuickCopied(i)
                                      setTimeout(() => setQuickCopied(null), 2000)
                                    }}
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 border transition ${
                                      quickCopied === i ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    {quickCopied === i ? '✓' : 'Copy'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty state */}
            {!isSearching && results.length === 0 && !monitorError && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500 font-medium">Search for any politician or public figure</p>
                <p className="text-gray-400 text-sm mt-1">Results from News, YouTube, and Reddit appear here</p>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  )
}
