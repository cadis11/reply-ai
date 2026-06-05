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
  credibility: v.optional(v.string()),
});

// ── Credibility classifier ─────────────────────────────────────────────────
function classifyCredibility(source: string): string {
  const s = source.toLowerCase();
  const major = ["setopati", "ratopati", "onlinekhabar", "ekantipur", "kathmandupost", "republica", "myrepublica", "himalayan", "nagarik", "annapurna"];
  const international = ["bbc", "reuters", "apnews", "aljazeera", "wsj", "nytimes", "guardian", "ndtv", "indiatimes", "hindustantimes"];
  if (major.some((m) => s.includes(m))) return "nepal_major";
  if (international.some((m) => s.includes(m))) return "international";
  // Any source with "nepal" in name is minor Nepal media
  if (s.includes("nepal") || s.includes("np")) return "nepal_minor";
  return "unknown";
}

// ── Relevance check — does the title actually mention the search query? ─────
function isRelevant(title: string, query: string): boolean {
  const titleLower = title.toLowerCase();
  // Split query into meaningful words (3+ chars)
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
  if (words.length === 0) return true;
  // At least one query word must appear in the title
  return words.some((w) => titleLower.includes(w));
}

// ── Clean RSS description — strip HTML, URLs, source suffixes ──────────────
function cleanSnippet(raw: string): string {
  // Remove HTML tags
  let clean = raw.replace(/<[^>]*>/g, " ");
  // Remove URLs
  clean = clean.replace(/https?:\/\/\S+/g, "");
  // Remove encoded entities
  clean = clean.replace(/&[a-z]+;/gi, " ");
  // Collapse whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  // If what's left is very short or looks like junk, return empty
  if (clean.length < 20) return "";
  return clean;
}

// ── Parse pubDate to ISO string ────────────────────────────────────────────
function parseDate(dateStr: string): string | undefined {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  } catch {
    return undefined;
  }
}

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
      credibility?: string;
    }> = [];

    // ── RSS parser helper ────────────────────────────────────────────────
    const parseRSS = (xml: string, maxItems: number) => {
      const itemRegex    = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex   = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(?!<!\[CDATA\[)(.*?)<\/title>/s;
      const linkRegex    = /<link>(.*?)<\/link>/s;
      const descRegex    = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/;
      const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
      const sourceRegex  = /<source[^>]*>(.*?)<\/source>/;

      const parsed: typeof results = [];
      let match;

      while ((match = itemRegex.exec(xml)) !== null && parsed.length < maxItems) {
        const item = match[1];

        const titleMatch = titleRegex.exec(item);
        const linkMatch  = linkRegex.exec(item);
        const descMatch  = descRegex.exec(item);
        const dateMatch  = pubDateRegex.exec(item);
        const srcMatch   = sourceRegex.exec(item);

        const rawTitle = (titleMatch?.[1] ?? titleMatch?.[2] ?? "").trim();
        const url      = (linkMatch?.[1] ?? "").trim();
        const rawDesc  = (descMatch?.[1]  ?? descMatch?.[2]  ?? "").trim();
        const pubDate  = (dateMatch?.[1]  ?? "").trim();
        const source   = (srcMatch?.[1]   ?? "Google News").trim();

        // Strip " - Source Name" suffix that Google News appends to titles
        const title = rawTitle.replace(/\s[-–]\s[^-–]+$/, "").trim();

        if (!title || !url) continue;

        // ── Relevance gate — skip if title doesn't mention the query ──
        if (!isRelevant(title, args.query)) continue;

        const snippet = cleanSnippet(rawDesc) || "";

        parsed.push({
          title,
          source,
          url,
          snippet,
          sentiment: detectSentiment(title + " " + snippet),
          platform: "news",
          publishedAt: parseDate(pubDate),
          credibility: classifyCredibility(source),
        });
      }

      return parsed;
    };

    // ── 1. Google News RSS — Nepal-specific ───────────────────────────────
    try {
      const encoded = encodeURIComponent(`${args.query} Nepal`);
      const rssUrl  = `https://news.google.com/rss/search?q=${encoded}&hl=en-NP&gl=NP&ceid=NP:en`;

      const res = await fetch(rssUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NepORM/1.0)",
          "Accept": "application/rss+xml, application/xml, text/xml",
        },
      });

      if (res.ok) {
        const xml   = await res.text();
        const items = parseRSS(xml, 12);
        results.push(...items);
      }
    } catch {
      // continue to fallback
    }

    // ── 2. Fallback — search exact name without "Nepal" suffix ────────────
    if (results.length < 5) {
      try {
        const encoded = encodeURIComponent(args.query);
        const rssUrl  = `https://news.google.com/rss/search?q=${encoded}&hl=en-NP&gl=NP&ceid=NP:en`;

        const res = await fetch(rssUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; NepORM/1.0)" },
        });

        if (res.ok) {
          const xml   = await res.text();
          const items = parseRSS(xml, 8);
          // Deduplicate by URL
          for (const item of items) {
            if (!results.some((r) => r.url === item.url)) {
              results.push(item);
            }
          }
        }
      } catch {
        // all failed
      }
    }

    // ── Sort by newest first ───────────────────────────────────────────────
    results.sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
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
    "investigation", "probe", "impeach", "sued", "lawsuit", "arrest",
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
