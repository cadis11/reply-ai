"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

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
