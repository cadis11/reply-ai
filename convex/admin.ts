"use node";

import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import crypto from "crypto";

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

// Session duration: 8 hours
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// Get current settings — public, not sensitive (just provider name)
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

// Internal: validate a session token, returns true if valid
export const validateSessionInternal = internalQuery({
  args: { token: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return false;
    if (session.expiresAt < Date.now()) return false;
    return true;
  },
});

// Internal: create a session, returns token
export const createSessionInternal = internalMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Clean up any existing expired sessions
    const expired = await ctx.db
      .query("adminSessions")
      .collect();
    for (const s of expired) {
      if (s.expiresAt < Date.now()) {
        await ctx.db.delete(s._id);
      }
    }
    const token = crypto.randomBytes(32).toString("hex");
    await ctx.db.insert("adminSessions", {
      token,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return token;
  },
});

// Internal: delete a session by token
export const deleteSessionInternal = internalMutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return null;
  },
});

// Login: verify password, create server-side session, return token
export const login = action({
  args: { password: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return null;
    if (args.password !== adminPassword) return null;
    const token: string = await ctx.runMutation(internal.admin.createSessionInternal, {});
    return token;
  },
});

// Logout: invalidate the session token
export const logout = action({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.admin.deleteSessionInternal, { token: args.token });
    return null;
  },
});

// Update provider — requires valid session token
export const updateProvider = action({
  args: {
    sessionToken: v.string(),
    provider: v.union(
      v.literal("groq"),
      v.literal("gemini"),
      v.literal("anthropic"),
      v.literal("openai")
    ),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const valid: boolean = await ctx.runQuery(internal.admin.validateSessionInternal, { token: args.sessionToken });
    if (!valid) return false;
    await ctx.runMutation(internal.admin.updateProviderInternal, { provider: args.provider });
    return true;
  },
});

export const updateProviderInternal = internalMutation({
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

// Check which API keys are set — requires valid session token
export const getApiKeyStatus = action({
  args: { sessionToken: v.string() },
  returns: v.union(
    v.object({
      groq: v.boolean(),
      gemini: v.boolean(),
      anthropic: v.boolean(),
      openai: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const valid: boolean = await ctx.runQuery(internal.admin.validateSessionInternal, { token: args.sessionToken });
    if (!valid) return null;
    return {
      groq: !!process.env.GROQ_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    };
  },
});

// Get today's request count — requires valid session token
export const getTodayCount = action({
  args: { sessionToken: v.string() },
  returns: v.union(v.number(), v.null()),
  handler: async (ctx, args) => {
    const valid: boolean = await ctx.runQuery(internal.admin.validateSessionInternal, { token: args.sessionToken });
    if (!valid) return null;
    const count: number = await ctx.runQuery(internal.admin.getTodayCountInternal, {});
    return count;
  },
});

export const getTodayCountInternal = internalQuery({
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
