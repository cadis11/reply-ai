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

    const q = encodeURIComponent(args.query);

    try {
      // ── GDELT news search ──────────────────────────────────────────────────
      const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}%20sourcecountry:NP&mode=artlist&maxrecords=15&format=json&sort=DateDesc`;
      const gdeltRes = await fetch(gdeltUrl);

      if (gdeltRes.ok) {
        const gdeltData = await gdeltRes.json();
        const articles = gdeltData.articles ?? [];
        for (const art of articles.slice(0, 10)) {
          const snippet: string = art.title ?? "";
          const sentiment = detectSentiment(snippet + " " + (art.seendate ?? ""));
          results.push({
            title: art.title ?? "No title",
            source: art.domain ?? "News",
            url: art.url ?? "",
            snippet: art.title ?? "",
            sentiment,
            platform: "news",
            publishedAt: art.seendate ?? undefined,
          });
        }
      }
    } catch {
      // GDELT failed — continue
    }

    try {
      // ── Reddit search ──────────────────────────────────────────────────────
      const redditUrl = `https://www.reddit.com/search.json?q=${q}+nepal&sort=new&limit=10&type=link`;
      const redditRes = await fetch(redditUrl, {
        headers: { "User-Agent": "NepORM/1.0 monitoring tool" },
      });

      if (redditRes.ok) {
        const redditData = await redditRes.json();
        const posts = redditData.data?.children ?? [];
        for (const post of posts.slice(0, 8)) {
          const d = post.data;
          const text = `${d.title} ${d.selftext ?? ""}`;
          const sentiment = detectSentiment(text);
          results.push({
            title: d.title,
            source: `r/${d.subreddit}`,
            url: `https://reddit.com${d.permalink}`,
            snippet: d.selftext ? d.selftext.slice(0, 200) : d.title,
            sentiment,
            platform: "reddit",
            publishedAt: d.created_utc
              ? new Date(d.created_utc * 1000).toISOString()
              : undefined,
          });
        }
      }
    } catch {
      // Reddit failed — continue
    }

    // Sort: negative first (most urgent for ORM), then by recency
    results.sort((a, b) => {
      const sentOrder = { negative: 0, neutral: 1, positive: 2 };
      return sentOrder[a.sentiment] - sentOrder[b.sentiment];
    });

    return {
      results: results.slice(0, 20),
      success: true,
    };
  },
});

function detectSentiment(text: string): "positive" | "negative" | "neutral" {
  const t = text.toLowerCase();

  const negativeWords = [
    "corrupt", "corruption", "scam", "fraud", "resign", "arrested", "attack",
    "fail", "failure", "bad", "wrong", "scandal", "controversy", "lie", "fake",
    "cheat", "bribe", "bribery", "crime", "criminal", "accused", "accused",
    "protest", "opposition", "criticism", "bhrastachar", "nirdosh", "jhuto",
    "dismiss", "fired", "removed", "sacked", "defeated", "lost", "losing",
    "abuse", "abused", "murder", "death", "crisis", "danger", "problem",
    "birodh", "dosh", "kasur", "galti",
  ];

  const positiveWords = [
    "good", "great", "excellent", "success", "winner", "won", "best",
    "congratulations", "support", "achievement", "development", "progress",
    "positive", "helped", "help", "praise", "praised", "thank", "thanks",
    "respected", "honest", "clean", "transparent", "ramro", "sajilo", "sahi",
    "badhai", "safal", "unnati", "vikas",
  ];

  let negScore = 0;
  let posScore = 0;

  for (const w of negativeWords) {
    if (t.includes(w)) negScore++;
  }
  for (const w of positiveWords) {
    if (t.includes(w)) posScore++;
  }

  if (negScore > posScore) return "negative";
  if (posScore > negScore) return "positive";
  return "neutral";
}
