"use node";

// AI PROVIDER is now controlled from the Admin Panel (/admin)
// To switch provider: go to /admin → select provider → save
// To add API keys: npx convex env set PROVIDER_API_KEY your_key

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

interface ProviderConfig {
  url: string;
  apiKeyEnvVar: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
  buildBody: (prompt: string) => object;
  extractText: (data: unknown) => string;
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
    businessName: v.string(),
    businessType: v.string(),
    tone: v.string(),
    platform: v.string(),
    reviewText: v.string(),
    reviewSentiment: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
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

    const platformGuidance: Record<string, string> = {
      Google: "This is a Google review reply. Keep it professional and public-facing. Responses on Google affect search ranking and first impressions.",
      Facebook: "This is a Facebook post/comment reply. Replies can be slightly warmer and more conversational. Facebook audiences value community tone.",
      Yelp: "This is a Yelp review reply. Be factual, honest, and professional. Yelp users are often price/value-sensitive.",
      TripAdvisor: "This is a TripAdvisor review reply. Focus on the experience and hospitality. Travelers read these before booking.",
      Trustpilot: "This is a Trustpilot review reply. Be transparent and professional. These replies are heavily indexed and read by potential buyers.",
      Other: "This is a general review or social media reply. Use a balanced, professional tone.",
    };
    const platformContext = platformGuidance[args.platform] ?? platformGuidance["Other"];

    const prompt = `You are an ORM (Online Reputation Management) expert helping business owners craft professional responses to customer reviews and social media posts.

Business name: ${args.businessName}
Business type: ${args.businessType}
Reply tone: ${args.tone}
Platform: ${args.platform}
Platform context: ${platformContext}
Review sentiment: ${args.reviewSentiment}
Customer review/post: "${args.reviewText}"

Generate exactly 3 distinct reply variations for this review. Each reply must:
- Directly reference specific points from the customer's review (not generic)
- Use the business name "${args.businessName}" naturally
- Match the "${args.tone}" tone throughout
- Be between 60-120 words
- Feel human and authentic, not robotic or templated
- Be appropriate for ${args.platform} (follow platform context above)
- For negative reviews: acknowledge the issue, apologize sincerely, offer to resolve
- For positive reviews: express genuine gratitude, reinforce what they praised
- For neutral reviews: thank them, address any concerns, invite them back

Make each variation meaningfully different — different opening, different structure, different emphasis.

Return ONLY a valid JSON array of exactly 3 strings. No markdown, no code fences, no explanation, no extra text.
Format exactly: ["Reply one here", "Reply two here", "Reply three here"]`;

    const url = activeProvider === "gemini"
      ? `${provider.url}?key=${apiKey}`
      : provider.url;

    const response = await fetch(url, {
      method: "POST",
      headers: provider.buildHeaders(apiKey),
      body: JSON.stringify(provider.buildBody(prompt)),
    });

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

    const validated = replies.map((r: unknown, i: number) => {
      if (typeof r !== "string" || (r as string).trim().length === 0) {
        throw new Error(`Reply ${i + 1} is empty or not a string`);
      }
      return (r as string).trim();
    });

    // Log this request for today's count
    await ctx.runMutation(internal.admin.logRequest, {
      provider: activeProvider,
      businessType: args.businessType,
    });

    return validated;
  },
});
