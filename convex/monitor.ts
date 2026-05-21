"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

const resultShape = v.object({
  title: v.string(),
  source: v.string(),
  url: v.string(),
  snippet: v.string(),
  sentiment: v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral")),
  platform: v.string(),
  publishedAt: v.optional(v.string()),
});

export const searchMentions = action({
  args: {
    query: v.string(),
    userId: v.id("users"),
  },
  returns: v.object({
    results: v.array(resultShape),
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    const results: Array<{
      title: string;
      source: string;
      url: string;
      snippet: string;
      sentiment: "positive" | "negative" | "neutral";
      platform: string;
      publishedAt?: string;
    }> = [];

    const searchQuery = `${args.query} Nepal`;

    // ── 1. Google News RSS ─────────────────────────────────────────────────
    try {
      const encoded = encodeURIComponent(searchQuery);
      const rssUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-NP&gl=NP&ceid=NP:en`;
      
      const res = await fetch(rssUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NepORM/1.0)",
          "Accept": "application/rss+xml, application/xml, text/xml",
        },
      });

      if (res.ok) {
        const xml = await res.text();
        
        // Parse RSS items with regex
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
        const linkRegex = /<link>(.*?)<\/link>/;
        const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
        const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
        const sourceRegex = /<source[^>]*>(.*?)<\/source>/;

        let match;
        let count = 0;
        while ((match = itemRegex.exec(xml)) !== null && count < 12) {
          const item = match[1];
          
          const titleMatch = titleRegex.exec(item);
          const linkMatch  = linkRegex.exec(item);
          const descMatch  = descRegex.exec(item);
          const dateMatch  = pubDateRegex.exec(item);
          const srcMatch   = sourceRegex.exec(item);

          const title   = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
          const url     = (linkMatch?.[1] || "").trim();
          const desc    = (descMatch?.[1]  || descMatch?.[2]  || "").trim();
          const pubDate = (dateMatch?.[1]  || "").trim();
          const source  = (srcMatch?.[1]   || "Google News").trim();

          // Strip HTML tags from description
          const cleanDesc = desc.replace(/<[^>]*>/g, "").trim();
          const snippet   = cleanDesc.slice(0, 200) || title;

          if (title && url) {
            results.push({
              title,
              source,
              url,
              snippet,
              sentiment: detectSentiment(title + " " + snippet),
              platform: "news",
              publishedAt: pubDate || undefined,
            });
            count++;
          }
        }
      }
    } catch {
      // Google News failed — continue to Bing
    }

    // ── 2. Bing News Search API (if key is set) ────────────────────────────
    const bingKey = process.env.BING_NEWS_API_KEY;
    if (bingKey && results.length < 8) {
      try {
        const encoded = encodeURIComponent(searchQuery);
        const bingUrl = `https://api.bing.microsoft.com/v7.0/news/search?q=${encoded}&mkt=en-NP&count=10&freshness=Month`;
        
        const res = await fetch(bingUrl, {
          headers: {
            "Ocp-Apim-Subscription-Key": bingKey,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const articles = data.value ?? [];
          
          for (const art of articles.slice(0, 8)) {
            // Avoid duplicates
            const isDupe = results.some((r) => r.title === art.name);
            if (isDupe) continue;

            results.push({
              title: art.name ?? "No title",
              source: art.provider?.[0]?.name ?? "Bing News",
              url: art.url ?? "",
              snippet: art.description ?? art.name ?? "",
              sentiment: detectSentiment((art.name ?? "") + " " + (art.description ?? "")),
              platform: "news",
              publishedAt: art.datePublished ?? undefined,
            });
          }
        }
      } catch {
        // Bing failed — continue
      }
    }

    // ── 3. Google News RSS fallback — broader search ───────────────────────
    // If still no results, try without "Nepal" suffix
    if (results.length === 0) {
      try {
        const encoded = encodeURIComponent(args.query);
        const rssUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en&gl=US&ceid=US:en`;
        
        const res = await fetch(rssUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; NepORM/1.0)" },
        });

        if (res.ok) {
          const xml = await res.text();
          const itemRegex = /<item>([\s\S]*?)<\/item>/g;
          const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
          const linkRegex  = /<link>(.*?)<\/link>/;
          const descRegex  = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
          const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
          const sourceRegex  = /<source[^>]*>(.*?)<\/source>/;

          let match;
          let count = 0;
          while ((match = itemRegex.exec(xml)) !== null && count < 8) {
            const item      = match[1];
            const titleMatch = titleRegex.exec(item);
            const linkMatch  = linkRegex.exec(item);
            const descMatch  = descRegex.exec(item);
            const dateMatch  = pubDateRegex.exec(item);
            const srcMatch   = sourceRegex.exec(item);

            const title   = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
            const url     = (linkMatch?.[1] || "").trim();
            const desc    = (descMatch?.[1] || descMatch?.[2] || "").trim();
            const pubDate = (dateMatch?.[1] || "").trim();
            const source  = (srcMatch?.[1]  || "Google News").trim();
            const cleanDesc = desc.replace(/<[^>]*>/g, "").trim();

            if (title && url) {
              results.push({
                title,
                source,
                url,
                snippet: cleanDesc.slice(0, 200) || title,
                sentiment: detectSentiment(title + " " + cleanDesc),
                platform: "news",
                publishedAt: pubDate || undefined,
              });
              count++;
            }
          }
        }
      } catch {
        // all failed
      }
    }

    // Sort: negative first (most urgent for ORM), then neutral, then positive
    results.sort((a, b) => {
      const order = { negative: 0, neutral: 1, positive: 2 };
      return order[a.sentiment] - order[b.sentiment];
    });

    return {
      results: results.slice(0, 15),
      success: true,
    };
  },
});

function detectSentiment(text: string): "positive" | "negative" | "neutral" {
  const t = text.toLowerCase();

  const negativeWords = [
    "corrupt", "corruption", "scam", "fraud", "resign", "arrested", "attack",
    "fail", "failure", "scandal", "controversy", "lie", "fake", "cheat",
    "bribe", "bribery", "crime", "criminal", "accused", "protest", "criticism",
    "dismiss", "fired", "removed", "sacked", "defeated", "abuse", "murder",
    "crisis", "danger", "problem", "opposition", "controversial", "allegation",
    "accused", "investigation", "probe", "impeach", "sued", "lawsuit", "arrest",
    "bhrastachar", "birodh", "dosh", "kasur", "galti", "jhuto", "nindaa",
  ];

  const positiveWords = [
    "good", "great", "excellent", "success", "winner", "won", "best",
    "congratulations", "support", "achievement", "development", "progress",
    "praised", "thank", "thanks", "respected", "honest", "clean", "transparent",
    "elected", "victory", "award", "honored", "appreciated", "celebrated",
    "ramro", "sajilo", "sahi", "badhai", "safal", "unnati", "vikas", "jit",
  ];

  let neg = 0, pos = 0;
  for (const w of negativeWords) if (t.includes(w)) neg++;
  for (const w of positiveWords) if (t.includes(w)) pos++;

  if (neg > pos) return "negative";
  if (pos > neg) return "positive";
  return "neutral";
}
