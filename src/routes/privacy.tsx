import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy Policy – ReplyAI' }] }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition mb-8 inline-block">← Back to ReplyAI</Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-base leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Overview</h2>
            <p>ReplyAI is designed with privacy in mind. We collect only the minimum data required to operate the service. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
            <p>When you use ReplyAI, we collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-gray-600">
              <li>
                <strong className="text-gray-700">Review text and business information</strong> — the content you enter into the form (business name, business type, tone, and customer review). This is sent to a third-party AI provider to generate replies. It is not stored permanently on our servers after generation.
              </li>
              <li>
                <strong className="text-gray-700">Anonymous usage data</strong> — we record a count of how many reply sets are generated per day (no personally identifying information is attached). This helps us monitor service usage.
              </li>
              <li>
                <strong className="text-gray-700">A random client ID</strong> — stored in your browser's local storage to enforce per-user rate limits. This ID is random and not linked to any personal identity.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data We Do NOT Collect</h2>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>Your name, email address, or contact information</li>
              <li>Account credentials (there are no user accounts)</li>
              <li>Payment information</li>
              <li>Your IP address (beyond what is processed by our hosting infrastructure)</li>
              <li>Cookies (we use local storage only for the rate-limit client ID)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Third-Party AI Providers</h2>
            <p>The review text you submit is sent to a third-party AI provider (one of: Groq, Google Gemini, Anthropic Claude, or OpenAI) to generate reply suggestions. These providers process your data according to their own privacy policies. We recommend you do not include sensitive personal information in the review text you submit.</p>
            <p className="mt-2">Relevant provider privacy policies:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500 text-sm">
              <li><a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Groq Privacy Policy</a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Google Privacy Policy</a></li>
              <li><a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Anthropic Privacy Policy</a></li>
              <li><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">OpenAI Privacy Policy</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Infrastructure</h2>
            <p>ReplyAI runs on <a href="https://www.convex.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Convex</a> (backend) and is hosted on cloud infrastructure. Our infrastructure providers may collect standard server-level logs (e.g. access timestamps, error logs) as part of normal operation.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <p>Review text you submit is not stored after a reply is generated. Anonymous request counts are retained for up to 48 hours for rate limiting and are then automatically purged. The random client ID in your browser persists until you clear your local storage.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p>Since we do not collect personal data linked to your identity, most data rights (access, correction, deletion) are satisfied automatically. If you have any concerns, please contact us using the information below.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
            <p>ReplyAI is not directed at children under 13. We do not knowingly collect any information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will post the updated policy on this page with a revised date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>If you have any questions about this Privacy Policy, please reach out via the contact information available on the site.</p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex gap-4 text-sm text-gray-400">
          <Link to="/terms" className="hover:text-gray-600 transition">Terms of Service</Link>
          <Link to="/" className="hover:text-gray-600 transition">← Back to app</Link>
        </div>
      </div>
    </main>
  )
}
