import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAction } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

type Provider = 'groq' | 'gemini' | 'anthropic' | 'openai'

const SESSION_KEY = 'replyai_admin_token'

const PROVIDER_INFO: Record<Provider, { label: string; tier: string; tierColor: string; docsUrl: string }> = {
  groq: {
    label: 'Groq',
    tier: 'Free — 14,400 req/day',
    tierColor: 'text-green-600 bg-green-50',
    docsUrl: 'https://console.groq.com',
  },
  gemini: {
    label: 'Google Gemini',
    tier: 'Free — 1,500 req/day',
    tierColor: 'text-blue-600 bg-blue-50',
    docsUrl: 'https://aistudio.google.com/apikey',
  },
  anthropic: {
    label: 'Anthropic Claude',
    tier: 'Paid — best quality',
    tierColor: 'text-purple-600 bg-purple-50',
    docsUrl: 'https://console.anthropic.com',
  },
  openai: {
    label: 'OpenAI',
    tier: 'Paid — good quality',
    tierColor: 'text-orange-600 bg-orange-50',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
}

function LoginGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAction(api.admin.login)

  const handleLogin = async () => {
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      const token = await login({ password })
      if (token) {
        sessionStorage.setItem(SESSION_KEY, token)
        onSuccess(token)
      } else {
        setError('Incorrect password')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">ReplyAI settings</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition mb-4"
          />
          {error && (
            <p className="text-red-600 text-sm mb-3">{error}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={!password.trim() || loading}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </div>
      </div>
    </main>
  )
}

function AdminDashboard({ sessionToken, onLogout }: { sessionToken: string; onLogout: () => void }) {
  const { data: settings } = useSuspenseQuery(convexQuery(api.admin.getSettings, {}))
  const getApiKeyStatus = useAction(api.admin.getApiKeyStatus)
  const getTodayCount = useAction(api.admin.getTodayCount)
  const updateProvider = useAction(api.admin.updateProvider)
  const logout = useAction(api.admin.logout)

  const [selectedProvider, setSelectedProvider] = useState<Provider>(settings.provider as Provider)
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<string, boolean>>({})
  const [todayCount, setTodayCount] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  const handleSessionExpired = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setSessionExpired(true)
    onLogout()
  }

  useEffect(() => {
    Promise.all([
      getApiKeyStatus({ sessionToken }),
      getTodayCount({ sessionToken }),
    ]).then(([keyStatus, count]) => {
      if (keyStatus === null || count === null) {
        handleSessionExpired()
        return
      }
      setApiKeyStatus(keyStatus)
      setTodayCount(count)
    }).catch(() => {
      // network error — don't log out, just show stale data
    }).finally(() => {
      setLoadingKeys(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const ok = await updateProvider({ sessionToken, provider: selectedProvider })
      if (!ok) {
        handleSessionExpired()
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout({ token: sessionToken })
    } catch {
      // best-effort
    }
    sessionStorage.removeItem(SESSION_KEY)
    onLogout()
  }

  if (sessionExpired) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-gray-500 text-sm">Session expired. Redirecting to login...</p>
      </main>
    )
  }

  const hasChanged = selectedProvider !== settings.provider

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="w-full max-w-xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-0.5">ReplyAI settings</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">← Back to app</a>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 transition">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Requests Today</p>
            <p className="text-3xl font-bold text-gray-900">{todayCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Active Model</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{settings.model}</p>
            <p className="text-xs text-gray-400 mt-0.5">{PROVIDER_INFO[settings.provider as Provider]?.label}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">AI Provider</h2>
          <div className="space-y-3">
            {(Object.keys(PROVIDER_INFO) as Provider[]).map((p) => {
              const info = PROVIDER_INFO[p]
              const isSelected = selectedProvider === p
              const isActive = settings.provider === p
              const keySet = apiKeyStatus[p]

              return (
                <button
                  key={p}
                  onClick={() => setSelectedProvider(p)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-gray-900' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{info.label}</span>
                          {isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.tierColor}`}>
                          {info.tier}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {loadingKeys ? (
                        <span className="text-xs text-gray-400">checking...</span>
                      ) : (
                        <span className={`text-xs font-medium flex items-center gap-1 ${keySet ? 'text-green-600' : 'text-red-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${keySet ? 'bg-green-500' : 'bg-red-400'}`} />
                          {keySet ? 'Key set' : 'No key'}
                        </span>
                      )}
                      <a
                        href={info.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                      >
                        Get key
                      </a>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={!hasChanged || saving || !apiKeyStatus[selectedProvider]}
            className={`w-full mt-5 py-3 rounded-xl font-semibold text-sm transition ${
              saved
                ? 'bg-green-500 text-white'
                : hasChanged && apiKeyStatus[selectedProvider]
                  ? 'bg-gray-900 text-white hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : !apiKeyStatus[selectedProvider] ? 'Set API key first' : hasChanged ? `Switch to ${PROVIDER_INFO[selectedProvider].label}` : 'No changes'}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">How to set API keys</h2>
          <p className="text-xs text-gray-500 mb-3">Run in your Convex terminal:</p>
          <div className="space-y-2">
            {(Object.keys(PROVIDER_INFO) as Provider[]).map((p) => (
              <div key={p} className="bg-gray-50 rounded-lg px-3 py-2 font-mono text-xs text-gray-600">
                npx convex env set {p === 'groq' ? 'GROQ_API_KEY' : p === 'gemini' ? 'GEMINI_API_KEY' : p === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'} your_key_here
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}

function AdminPage() {
  const storedToken = sessionStorage.getItem(SESSION_KEY)
  const [sessionToken, setSessionToken] = useState<string | null>(storedToken)

  const handleLogin = (token: string) => {
    setSessionToken(token)
  }

  const handleLogout = () => {
    setSessionToken(null)
  }

  if (!sessionToken) {
    return <LoginGate onSuccess={handleLogin} />
  }

  return <AdminDashboard sessionToken={sessionToken} onLogout={handleLogout} />
}
