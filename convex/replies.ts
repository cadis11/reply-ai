"use node";

// AI PROVIDER is now controlled from the Admin Panel (/admin)
// To switch provider: go to /admin → select provider → save
// To add API keys: npx convex env set PROVIDER_API_KEY your_key

import { action, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const checkRateLimitInternal = internalQuery({
  args: { clientId: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
    const entries = await ctx.db
      .query("rateLimits")
      .withIndex("by_clientId_and_timestamp", (q) =>
        q.eq("clientId", args.clientId).gte("timestamp", windowStart)
      )
      .collect();
    return entries.length;
  },
});

export const recordRateLimitInternal = internalMutation({
  args: { clientId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("rateLimits", {
      clientId: args.clientId,
      timestamp: Date.now(),
    });
    // Purge entries older than 2 hours to keep the table lean
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    const old = await ctx.db
      .query("rateLimits")
      .withIndex("by_clientId_and_timestamp", (q) =>
        q.eq("clientId", args.clientId).lt("timestamp", cutoff)
      )
      .collect();
    for (const entry of old) {
      await ctx.db.delete(entry._id);
    }
    return null;
  },
});

interface ProviderConfig {
  url: string;
  apiKeyEnvVar: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
  buildBody: (prompt: string) => object;
  extractText: (data: unknown) => string;
}

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

async function fetchWithTimeoutAndRetry(
  url: string,
  init: RequestInit,
  providerName: string
): Promise<Response> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      // Retry on 429 (provider rate limit) and 5xx (server errors)
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const backoffMs = 1000 * Math.pow(2, attempt); // 1s, 2s
        console.warn(`[ReplyAI] ${providerName} returned ${response.status}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timer);
      const isTimeout = err instanceof Error && err.name === "AbortError";
      lastError = isTimeout
        ? new Error(`Request to ${providerName} timed out after ${REQUEST_TIMEOUT_MS / 1000}s`)
        : (err instanceof Error ? err : new Error(String(err)));

      if (attempt < MAX_RETRIES) {
        const backoffMs = 1000 * Math.pow(2, attempt);
        console.warn(`[ReplyAI] ${providerName} fetch error (attempt ${attempt + 1}/${MAX_RETRIES}): ${lastError.message}. Retrying in ${backoffMs}ms`);
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }
  }

  throw lastError;
}

function toUserFriendlyError(err: unknown, providerName: string): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Rate limit reached")) return err instanceof Error ? err : new Error(msg);
  if (msg.includes("timed out")) return new Error("The AI took too long to respond. Please try again.");
  if (msg.includes("API key") || msg.includes("401") || msg.includes("403")) return new Error("AI provider configuration error. Please contact the site owner.");
  if (msg.includes("429")) return new Error(`The AI provider is busy right now. Please try again in a moment.`);
  if (msg.includes("500") || msg.includes("502") || msg.includes("503")) return new Error("The AI provider is temporarily unavailable. Please try again shortly.");
  if (msg.includes("Could not parse") || msg.includes("Expected array")) return new Error("The AI returned an unexpected response. Please try again.");
  // Log unexpected errors for debugging (visible in Convex dashboard)
  console.error(`[ReplyAI] Unexpected error from ${providerName}:`, msg);
  return new Error("Something went wrong generating your replies. Please try again.");
}

const PROVIDERS: Record<string, ProviderConfig> = {
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    apiKeyEnvVar: "GROQ_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    }),
    buildBody: (prompt) => ({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1200,
    }),
    extractText: (data: any) => data?.choices?.[0]?.message?.content ?? "",
  },

  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    apiKeyEnvVar: "GEMINI_API_KEY",
    buildHeaders: (_apiKey) => ({
      "Content-Type": "application/json",
    }),
    buildBody: (prompt) => ({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 1200 },
    }),
    extractText: (data: any) =>
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
  },

  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    apiKeyEnvVar: "ANTHROPIC_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
    buildBody: (prompt) => ({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
    extractText: (data: any) => data?.content?.[0]?.text ?? "",
  },

  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    apiKeyEnvVar: "OPENAI_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    }),
    buildBody: (prompt) => ({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1200,
    }),
    extractText: (data: any) => data?.choices?.[0]?.message?.content ?? "",
  },
};

export const generateReplies = action({
  args: {
    clientId: v.string(),
    businessName: v.string(),
    businessType: v.string(),
    tone: v.string(),
    reviewText: v.string(),
    reviewSentiment: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    // Enforce per-client rate limit before doing anything expensive
    const recentCount: number = await ctx.runQuery(internal.replies.checkRateLimitInternal, {
      clientId: args.clientId,
    });
    if (recentCount >= RATE_LIMIT_MAX) {
      throw new Error(`Rate limit reached. You can generate up to ${RATE_LIMIT_MAX} sets of replies per hour. Please wait a moment before trying again.`);
    }

    // Read active provider from DB (set via admin panel)
    const settings = await ctx.runQuery(internal.admin.getSettingsInternal);
    const activeProvider = settings?.provider ?? "groq";
    const provider = PROVIDERS[activeProvider];

    if (!provider) {
      throw new Error(`Unknown provider: ${activeProvider}`);
    }

    const apiKey = process.env[provider.apiKeyEnvVar];
    if (!apiKey) {
      throw new Error(
        `${provider.apiKeyEnvVar} is not set. ` +
        `Run: npx convex env set ${provider.apiKeyEnvVar} your_key_here`
      );
    }

    const prompt = `You are an ORM (Online Reputation Management) expert helping small business owners craft professional responses to customer reviews.

Business name: ${args.businessName}
Business type: ${args.businessType}
Reply tone: ${args.tone}
Review sentiment: ${args.reviewSentiment}
Customer review: "${args.reviewText}"

Generate exactly 3 distinct reply variations for this review. Each reply must:
- Directly reference specific points from the customer's review (not generic)
- Use the business name "${args.businessName}" naturally
- Match the "${args.tone}" tone throughout
- Be between 60-120 words
- Feel human and authentic, not robotic or templated
- For negative reviews: acknowledge the issue, apologize sincerely, offer to resolve
- For positive reviews: express genuine gratitude, reinforce what they praised
- For neutral reviews: thank them, address any concerns, invite them back

Make each variation meaningfully different — different opening, different structure, different emphasis.

Return ONLY a valid JSON array of exactly 3 strings. No markdown, no code fences, no explanation, no extra text.
Format exactly: ["Reply one here", "Reply two here", "Reply three here"]`;

    const url = activeProvider === "gemini"
      ? `${provider.url}?key=${apiKey}`
      : provider.url;

    let validated: string[];

    try {
      const response = await fetchWithTimeoutAndRetry(
        url,
        {
          method: "POST",
          headers: provider.buildHeaders(apiKey),
          body: JSON.stringify(provider.buildBody(prompt)),
        },
        activeProvider
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${activeProvider} API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const rawText = provider.extractText(data);

      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      let replies: string[];

      try {
        replies = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\[[\s\S]*?\]/);
        if (match) {
          replies = JSON.parse(match[0]);
        } else {
          throw new Error(
            `Could not parse response as JSON array. Raw: ${rawText.slice(0, 200)}`
          );
        }
      }

      if (!Array.isArray(replies) || replies.length !== 3) {
        throw new Error(
          `Expected array of 3 replies, got: ${JSON.stringify(replies).slice(0, 200)}`
        );
      }

      validated = replies.map((r: unknown, i: number) => {
        if (typeof r !== "string" || (r as string).trim().length === 0) {
          throw new Error(`Reply ${i + 1} is empty or not a string`);
        }
        return (r as string).trim();
      });
    } catch (err) {
      // Re-throw rate limit errors as-is; convert everything else to user-friendly messages
      throw toUserFriendlyError(err, activeProvider);
    }

    // Record rate limit entry and log for today's count
    await Promise.all([
      ctx.runMutation(internal.replies.recordRateLimitInternal, { clientId: args.clientId }),
      ctx.runMutation(internal.admin.logRequest, {
        provider: activeProvider,
        businessType: args.businessType,
      }),
    ]);

    return validated;
  },
});
