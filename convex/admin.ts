"use node";

import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const PROVIDER_MODELS: Record<string, string> = {
  groq: "llama-3.3-70b-versatile",
  gemini: "gemini-2.0-flash",
  anthropic: "claude-haiku-4-5-20251001",
  openai: "gpt-4o-mini",
};

const PROVIDER_ENV_KEYS: Record<string, string> = {
  groq: "GROQ_API_KEY",
  gemini: "GEMINI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
};

// Get current settings — initializes with groq if no settings row exists
export const getSettings = query({
  args: {},
  returns: v.object({
    provider: v.string(),
    model: v.string(),
  }),
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    const provider = settings?.provider ?? "groq";
    return {
      provider,
      model: PROVIDER_MODELS[provider] ?? "unknown",
    };
  },
});

// Update provider
export const updateProvider = mutation({
  args: {
    provider: v.union(
      v.literal("groq"),
      v.literal("gemini"),
      v.literal("anthropic"),
      v.literal("openai")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { provider: args.provider });
    } else {
      await ctx.db.insert("settings", { provider: args.provider });
    }
    return null;
  },
});

// Check which API keys are set (returns set/not set — never returns actual key values)
export const getApiKeyStatus = action({
  args: {},
  returns: v.object({
    groq: v.boolean(),
    gemini: v.boolean(),
    anthropic: v.boolean(),
    openai: v.boolean(),
  }),
  handler: async (_ctx) => {
    return {
      groq: !!process.env.GROQ_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    };
  },
});

// Verify admin password
export const verifyPassword = action({
  args: {
    password: v.string(),
  },
  returns: v.boolean(),
  handler: async (_ctx, args) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return false;
    return args.password === adminPassword;
  },
});

// Internal: log each request for today's count
export const logRequest = internalMutation({
  args: {
    provider: v.string(),
    businessType: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("requestLog", {
      provider: args.provider,
      businessType: args.businessType,
      timestamp: Date.now(),
    });
    return null;
  },
});

// Get today's request count
export const getTodayCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const logs = await ctx.db
      .query("requestLog")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", startOfDay.getTime())
      )
      .collect();
    return logs.length;
  },
});

// Internal query used by replies.ts action
export const getSettingsInternal = internalQuery({
  args: {},
  returns: v.union(
    v.object({
      provider: v.union(
        v.literal("groq"),
        v.literal("gemini"),
        v.literal("anthropic"),
        v.literal("openai")
      ),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings ?? null;
  },
});
