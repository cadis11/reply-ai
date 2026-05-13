"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

function detectSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const pos = ["support", "win", "success", "good", "best", "amazing", "proud", "victory", "achieve", "praised", "commend", "approve", "excellent", "congratul", "strong", "great"];
  const neg = ["scandal", "corrupt", "fail", "resign", "arrest", "attack", "accuse", "fraud", "incompetent", "lie", "wrong", "crisis", "bad", "terrible", "protest", "anger", "condemn", "controversial", "impeach", "bribery", "abuse", "criticism"];
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
  const newsDomains = ["bbc.", "cnn.", "reuters.", "apnews.", "theguardian.", "nytimes.", "aljazeera.", "ndtv.", "timesofindia.", "kathmandupost.", "myrepublica.", "ekantipur.", "onlinekhabar.", "setopati.", "ratopati.", "hindustantimes.", "thehindu.", "dawn.com", "thedailystar.", "straitstimes.", "abc.net", "france24.", "dw.com", "voanews."];
  for (const d of newsDomains) { if (url.includes(d)) return "news"; }
  return "web";
}

// GDELT — completely free, no API key, no signup
async function searchGDELT(query: string) {
  try {
    const encoded = encodeURIComponent(`"${query}"`);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}&mode=ArtList&maxrecords=15&format=json&timespan=1month`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ReplyAI/2.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    const articles = data?.articles ?? [];
    return articles.map((a: any, i: number) => ({
      id: `gdelt-${i}-${Date.now()}`,
      source: classifySource(a.url ?? "") as "news" | "youtube" | "reddit" | "web",
      title: (a.title ?? "Untitled").slice(0, 200),
      snippet: (a.seendescription ?? a.title ?? "").slice(0, 300),
      url: a.url ?? "#",
      publishedAt: a.seendate ? (() => {
        try {
          const d = a.seendate.toString();
          return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}T${d.slice(9,11)}:${d.slice(11,13)}:${d.slice(13,15)}Z`;
        } catch { return undefined; }
      })() : undefined,
      sentiment: detectSentiment((a.title ?? "") + " " + (a.seendescription ?? "")) as "positive" | "negative" | "neutral",
    }));
  } catch { return []; }
}

// Reddit — completely free, no API key, no signup
async function searchReddit(query: string) {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://www.reddit.com/search.json?q=${encoded}&sort=new&limit=10&type=link`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ReplyAI/2.0 (reputation monitoring)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    const posts = data?.data?.children ?? [];
    return posts.map((post: any) => {
      const p = post.data;
      const text = (p.title ?? "") + " " + (p.selftext ?? "");
      return {
        id: `reddit-${p.id ?? Math.random()}`,
        source: "reddit" as const,
        title: (p.title ?? "Untitled").slice(0, 200),
        snippet: p.selftext
          ? p.selftext.slice(0, 200) + (p.selftext.length > 200 ? "..." : "")
          : `r/${p.subreddit ?? "reddit"} · ${p.score ?? 0} upvotes`,
        url: `https://www.reddit.com${p.permalink ?? ""}`,
        publishedAt: p.created_utc
          ? new Date(p.created_utc * 1000).toISOString()
          : undefined,
        sentiment: detectSentiment(text) as "positive" | "negative" | "neutral",
      };
    });
  } catch { return []; }
}

export const searchMentions = action({
  args: { query: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      source: v.union(v.literal("news"), v.literal("youtube"), v.literal("reddit"), v.literal("web")),
      title: v.string(),
      snippet: v.string(),
      url: v.string(),
      publishedAt: v.optional(v.string()),
      sentiment: v.optional(v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral"))),
    })
  ),
  handler: async (_ctx, args) => {
    const query = args.query.trim();
    if (!query) return [];

    // Run both in parallel — both 100% free, no keys
    const [gdeltResults, redditResults] = await Promise.all([
      searchGDELT(query),
      searchReddit(query),
    ]);

    // Merge and deduplicate by title
    const seen = new Set<string>();
    const merged = [];
    for (const r of [...gdeltResults, ...redditResults]) {
      const key = r.title.toLowerCase().slice(0, 50);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(r);
      }
    }

    // Sort newest first
    merged.sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return merged.slice(0, 20);
  },
});
