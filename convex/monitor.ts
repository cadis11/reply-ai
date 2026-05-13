"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

interface MonitorResult {
  id: string;
  source: "news" | "youtube" | "reddit" | "web";
  title: string;
  snippet: string;
  url: string;
  publishedAt?: string;
  sentiment?: "positive" | "negative" | "neutral";
}

function detectSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const pos = ["great", "excellent", "support", "win", "congratul", "success", "good", "best", "love", "amazing", "proud", "strong", "victory", "achieve", "praised", "commend", "approve"];
  const neg = ["scandal", "corrupt", "fail", "resign", "arrest", "attack", "accuse", "fraud", "incompetent", "lie", "lied", "wrong", "crisis", "bad", "terrible", "protest", "anger", "condemn", "controversial", "criticism", "resign", "impeach", "bribery", "abuse"];
  let p = 0, n = 0;
  for (const w of pos) { if (lower.includes(w)) p++; }
  for (const w of neg) { if (lower.includes(w)) n++; }
  if (p > n) return "positive";
  if (n > p) return "negative";
  return "neutral";
}

function classifySource(url: string): "news" | "youtube" | "reddit" | "web" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("reddit.com")) return "reddit";
  const newsDomains = ["bbc.", "cnn.", "reuters.", "apnews.", "theguardian.", "nytimes.", "washingtonpost.", "aljazeera.", "ndtv.", "timesofindia.", "kathmandutribune.", "kathmandupost.", "myrepublica.", "ekantipur.", "onlinekhabar.", "setopati.", "ratopati.", "hindustantimes.", "thehindu.", "dawn.com", "tribune.com", "thedailystar.", "bdnews24.", "straitstimes."];
  for (const d of newsDomains) {
    if (url.includes(d)) return "news";
  }
  return "web";
}

export const searchMentions = action({
  args: {
    query: v.string(),
  },
  returns: v.array(
    v.object({
      id: v.string(),
      source: v.union(
        v.literal("news"),
        v.literal("youtube"),
        v.literal("reddit"),
        v.literal("web")
      ),
      title: v.string(),
      snippet: v.string(),
      url: v.string(),
      publishedAt: v.optional(v.string()),
      sentiment: v.optional(
        v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral"))
      ),
    })
  ),
  handler: async (_ctx, args) => {
    const query = args.query.trim();
    if (!query) return [];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not set. Run: npx convex env set ANTHROPIC_API_KEY your_key");
    }

    const prompt = `Search the web for recent mentions of: "${query}"

Find mentions from:
1. News articles and media coverage
2. YouTube videos
3. Reddit discussions  
4. Any other web sources

Return a JSON array of results. Each result must have:
- title: the headline or title
- url: the actual URL
- snippet: 1-2 sentence description of what was said
- publishedAt: ISO date string if known (otherwise omit)

Return ONLY a valid JSON array. No markdown, no explanation. Maximum 20 results.
Format: [{"title":"...","url":"...","snippet":"...","publishedAt":"..."}]`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
          }
        ],
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Search failed: ${response.status} ${err.slice(0, 200)}`);
    }

    const data = await response.json() as any;

    // Extract text from all content blocks
    const textBlocks = (data.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text as string)
      .join("\n");

    // Parse JSON from response
    let rawResults: any[] = [];
    try {
      const cleaned = textBlocks
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      rawResults = JSON.parse(cleaned);
    } catch {
      // Try regex extraction
      const match = textBlocks.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      if (match) {
        try {
          rawResults = JSON.parse(match[0]);
        } catch {
          return [];
        }
      } else {
        return [];
      }
    }

    if (!Array.isArray(rawResults)) return [];

    const results: MonitorResult[] = rawResults
      .filter((r: any) => r && typeof r.title === "string" && typeof r.url === "string")
      .map((r: any, i: number) => {
        const url = r.url ?? "#";
        const source = classifySource(url);
        const text = (r.title ?? "") + " " + (r.snippet ?? "");
        return {
          id: `result-${i}-${Date.now()}`,
          source,
          title: (r.title ?? "Untitled").slice(0, 200),
          snippet: (r.snippet ?? "").slice(0, 400),
          url,
          publishedAt: r.publishedAt ?? undefined,
          sentiment: detectSentiment(text),
        };
      })
      .slice(0, 20);

    return results;
  },
});
