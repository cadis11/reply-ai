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
    situationType: v.optional(v.string()),
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
      Google: "This is a Google reply. Professional and public-facing.",
      Facebook: "This is a Facebook post/comment reply. Warm, community-focused.",
      "Twitter / X": "This is a Twitter/X reply. Concise, direct, under 280 chars ideally.",
      YouTube: "This is a YouTube comment reply. Engaging and measured.",
      Instagram: "This is an Instagram comment. Warm and visual in tone.",
      LinkedIn: "This is a LinkedIn reply. Professional and credible.",
      "News / Media": "This is a response to a news article or media story. Formal, press-statement style.",
      Other: "General reply. Balanced and professional.",
    };

    const isPolitical = [
      'Politician / Candidate', 'Minister / MP', 'Mayor / Local Official',
      'Public Figure', 'Media Personality', 'Activist / NGO Leader'
    ].includes(args.businessType);

    const situationGuidance: Record<string, string> = {
      'Constituent Complaint': 'A constituent is raising a complaint. Acknowledge the issue with empathy, show accountability, and outline next steps.',
      'Opposition Attack': 'This is a political attack from opposition. Respond with facts, dignity, and without escalating — defend without attacking.',
      'Misinformation / Rumor': 'This is misinformation or a rumor. Calmly correct the record with facts. Be firm but not aggressive.',
      'Policy Criticism': 'This is criticism of a policy. Acknowledge the perspective, explain the rationale, and invite dialogue.',
      'Personal Attack': 'This is a personal attack. Respond with composure and dignity. Do not descend to personal insults.',
      'Positive Support': 'This is positive support from a follower/voter. Express genuine gratitude and reinforce shared values.',
      'Press / Media Question': 'This is a media or press question. Respond in a professional, clear, press-statement style.',
      'Crisis Response': 'This is a crisis situation. Respond calmly, take responsibility where appropriate, state concrete actions being taken.',
      'General Review': 'This is a general comment or review. Respond professionally and authentically.',
    };

    const situation = args.situationType ?? 'General Review';
    const situationContext = situationGuidance[situation] ?? situationGuidance['General Review'];
    const platformContext = platformGuidance[args.platform] ?? platformGuidance['Other'];

    const prompt = isPolitical
      ? `You are an expert political communications advisor helping ${args.businessType} "${args.businessName}" craft responses to public comments and media.

Platform: ${args.platform}
Platform context: ${platformContext}
Situation: ${situation}
Situation guidance: ${situationContext}
Reply tone: ${args.tone}
Sentiment of the comment: ${args.reviewSentiment}
The comment/post/article: "${args.reviewText}"

Generate exactly 3 distinct reply variations. Each reply must:
- Be written in the voice of ${args.businessType} "${args.businessName}"
- Directly address the specific content of the comment (never generic)
- Match the "${args.tone}" tone
- Follow the situation guidance strictly
- Be appropriate length for ${args.platform} (Twitter/X: under 240 chars; others: 60-130 words)
- Sound human, authentic, and politically credible — not robotic
- For attacks/misinformation: be firm and factual without being inflammatory
- For complaints: show genuine empathy and accountability
- Never use hollow phrases like "I hear your concerns" or "Thank you for your feedback"
- Never make promises that cannot be kept

Make each variation meaningfully different in structure, opening, and emphasis.

Return ONLY a valid JSON array of exactly 3 strings. No markdown, no code fences, no explanation.
Format: ["Reply one", "Reply two", "Reply three"]`
      : `You are an ORM expert helping "${args.businessName}" (${args.businessType}) craft responses to customer reviews.

Platform: ${args.platform}
Platform context: ${platformContext}
Reply tone: ${args.tone}
Review sentiment: ${args.reviewSentiment}
Customer review: "${args.reviewText}"

Generate exactly 3 distinct reply variations. Each reply must:
- Directly reference specific points from the review
- Use the name "${args.businessName}" naturally
- Match the "${args.tone}" tone
- Be 60-120 words
- Feel human and authentic
- For negative: acknowledge, apologize, offer resolution
- For positive: express genuine gratitude
- For neutral: thank and invite back

Make each variation meaningfully different.

Return ONLY a valid JSON array of exactly 3 strings. No markdown, no code fences.
Format: ["Reply one", "Reply two", "Reply three"]`;

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
