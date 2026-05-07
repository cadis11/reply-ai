"use node";

// AI PROVIDER: Google Gemini 2.0 Flash (free tier — 100 req/day, no credit card)
// TO SWITCH TO ANTHROPIC CLAUDE LATER:
// 1. Replace GEMINI_API_KEY with ANTHROPIC_API_KEY in Convex env
// 2. Change fetch URL to: https://api.anthropic.com/v1/messages
// 3. Update request body to Anthropic schema (model: claude-haiku-4-5-20251001)
//    body: { model, max_tokens: 1024, messages: [{ role: "user", content: prompt }] }
//    response path: data.content[0].text

import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateReplies = action({
  args: {
    businessName: v.string(),
    businessType: v.string(),
    tone: v.string(),
    reviewText: v.string(),
    reviewSentiment: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (_ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Run: npx convex env set GEMINI_API_KEY your_key_here"
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 1200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown code fences if Gemini wraps output in ```json ... ```
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let replies: string[];

    try {
      replies = JSON.parse(cleaned);
    } catch {
      // Fallback: extract the first JSON array found anywhere in the response
      const match = cleaned.match(/\[[\s\S]*?\]/);
      if (match) {
        replies = JSON.parse(match[0]);
      } else {
        throw new Error(
          `Could not parse Gemini response as JSON array. Raw response: ${rawText.slice(0, 200)}`
        );
      }
    }

    if (!Array.isArray(replies) || replies.length !== 3) {
      throw new Error(
        `Expected array of 3 replies, got: ${JSON.stringify(replies).slice(0, 200)}`
      );
    }

    // Ensure all items are non-empty strings
    const validated = replies.map((r, i) => {
      if (typeof r !== "string" || r.trim().length === 0) {
        throw new Error(`Reply ${i + 1} is empty or not a string`);
      }
      return r.trim();
    });

    return validated;
  },
});
