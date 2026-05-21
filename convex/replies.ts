"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const generateReplies = action({
  args: {
    userId: v.id("users"),
    profileName: v.string(),
    personType: v.string(),
    platform: v.union(
      v.literal("facebook"),
      v.literal("youtube"),
      v.literal("tiktok"),
      v.literal("twitter"),
      v.literal("instagram"),
      v.literal("news"),
      v.literal("other")
    ),
    situationType: v.union(
      v.literal("attack"),
      v.literal("complaint"),
      v.literal("misinformation"),
      v.literal("policy_criticism"),
      v.literal("personal_attack"),
      v.literal("positive_support"),
      v.literal("press_question"),
      v.literal("crisis")
    ),
    tone: v.union(
      v.literal("diplomatic"),
      v.literal("firm"),
      v.literal("empathetic"),
      v.literal("crisis_control"),
      v.literal("grateful")
    ),
    language: v.union(v.literal("nepali"), v.literal("english"), v.literal("both")),
    originalComment: v.string(),
    party: v.optional(v.string()),
    brandVoice: v.optional(v.string()),
  },
  returns: v.object({
    replies: v.array(v.string()),
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Check user is allowed to generate
    const user = await ctx.runQuery(internal.users.getUserById, { userId: args.userId });
    if (!user || !user.isActive) {
      return { replies: [], success: false, error: "Account not active. Contact us to activate." };
    }

    const settings = await ctx.runQuery(internal.admin.getSettings);
    const limit = user.plan === "free" ? (settings?.freeReplyLimit ?? 5) :
                  user.plan === "starter" ? (settings?.starterMonthlyLimit ?? 30) : 99999;

    if (user.plan === "free" && user.repliesUsed >= limit) {
      return { replies: [], success: false, error: "Free limit reached. Contact us to upgrade." };
    }
    if (user.plan === "starter" && user.repliesThisMonth >= limit) {
      return { replies: [], success: false, error: "Monthly limit reached. Contact us to upgrade." };
    }

    const provider = settings?.aiProvider ?? "groq";

    const personTypeLabels: Record<string, string> = {
      politician: "Politician",
      minister: "Minister/Government Official",
      mayor: "Mayor",
      ward_chair: "Ward Chairperson",
      candidate: "Election Candidate",
      activist: "Activist/Social Leader",
      journalist: "Journalist/Media Person",
      influencer: "Social Media Influencer",
      ngo_leader: "NGO/Civil Society Leader",
      public_figure: "Public Figure",
    };

    const situationLabels: Record<string, string> = {
      attack: "a political attack or smear",
      complaint: "a constituent complaint about services or policies",
      misinformation: "misinformation or a false rumor being spread",
      policy_criticism: "criticism of a policy or decision",
      personal_attack: "a personal attack on character or family",
      positive_support: "positive support from a follower or voter",
      press_question: "a press/media question requiring an official response",
      crisis: "a crisis situation requiring immediate damage control",
    };

    const toneLabels: Record<string, string> = {
      diplomatic: "diplomatic and statesmanlike — measured, respectful, above the fray",
      firm: "firm and factual — clear, direct, evidence-based, no aggression",
      empathetic: "empathetic to constituents — warm, understanding, action-oriented",
      crisis_control: "crisis control — calm, reassuring, accountable without over-admitting",
      grateful: "grateful and warm — appreciating the support, connecting personally",
    };

    const langInstruction = args.language === "nepali"
      ? "Write ALL 3 replies ONLY in Nepali (Devanagari script). Do not use any English."
      : args.language === "english"
      ? "Write ALL 3 replies ONLY in English."
      : "Write Reply 1 in Nepali (Devanagari script), Reply 2 in English, Reply 3 in Nepali mixed with some English (Nepanglish style as used by urban Nepalis).";

    const partyContext = args.party ? `They represent or are affiliated with: ${args.party}.` : "";
    const voiceContext = args.brandVoice ? `Their personal communication style note: ${args.brandVoice}` : "";

    const prompt = `You are an expert political communications strategist specializing in Nepal's political landscape. You understand Nepali political culture, social norms, and how politicians communicate on social media in Nepal.

CONTEXT:
- Person: ${args.profileName}
- Role: ${personTypeLabels[args.personType] || args.personType}
- Platform: ${args.platform.toUpperCase()}
- Situation: This is ${situationLabels[args.situationType] || args.situationType}
- Desired tone: ${toneLabels[args.tone] || args.tone}
${partyContext}
${voiceContext}

ORIGINAL COMMENT/ATTACK:
"${args.originalComment}"

TASK:
Generate exactly 3 distinct reply variations. Each reply should:
- Feel genuinely written by a real Nepali political figure, not AI
- Be appropriate for ${args.platform} (platform-specific length and style)
- Never be inflammatory, aggressive, or escalatory
- Maintain dignity and professionalism
- Address the core issue without over-explaining
- Reflect Nepal's political and cultural context

${langInstruction}

IMPORTANT: Return ONLY a JSON object in this exact format, nothing else:
{"replies": ["reply 1 text here", "reply 2 text here", "reply 3 text here"]}`;

    try {
      const providerConfig = {
        groq: {
          url: "https://api.groq.com/openai/v1/chat/completions",
          envKey: "GROQ_API_KEY",
          model: "llama-3.3-70b-versatile",
        },
        anthropic: {
          url: "https://api.anthropic.com/v1/messages",
          envKey: "ANTHROPIC_API_KEY",
          model: "claude-3-5-haiku-20241022",
        },
        openai: {
          url: "https://api.openai.com/v1/chat/completions",
          envKey: "OPENAI_API_KEY",
          model: "gpt-4o-mini",
        },
        gemini: {
          url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
          envKey: "GEMINI_API_KEY",
          model: "gemini-1.5-flash",
        },
      };

      const cfg = providerConfig[provider as keyof typeof providerConfig] ?? providerConfig.groq;
      const apiKey = process.env[cfg.envKey];
      if (!apiKey) throw new Error(`API key not set for provider: ${provider}`);

      let responseText = "";

      if (provider === "anthropic") {
        const res = await fetch(cfg.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: cfg.model,
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await res.json();
        responseText = data.content?.[0]?.text ?? "";
      } else if (provider === "gemini") {
        const res = await fetch(`${cfg.url}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      } else {
        // groq + openai
        const res = await fetch(cfg.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: cfg.model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.8,
          }),
        });
        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content ?? "";
      }

      // Parse JSON from response
      let replies: string[] = [];
      try {
        const clean = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(clean);
        replies = parsed.replies ?? [];
      } catch {
        // fallback: extract via regex
        const matches = responseText.match(/"([^"]{20,})"/g);
        if (matches && matches.length >= 3) {
          replies = matches.slice(0, 3).map((m: string) => m.replace(/^"|"$/g, ""));
        }
      }

      if (!replies || replies.length < 3) {
        throw new Error("Failed to parse 3 replies from AI response");
      }

      // Log the usage
      await ctx.runMutation(internal.users.incrementUsage, { userId: args.userId });

      return { replies, success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { replies: [], success: false, error: message };
    }
  },
});
