import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  settings: defineTable({
    provider: v.union(
      v.literal("groq"),
      v.literal("gemini"),
      v.literal("anthropic"),
      v.literal("openai")
    ),
  }),

  requestLog: defineTable({
    provider: v.string(),
    businessType: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  rateLimits: defineTable({
    clientId: v.string(),
    timestamp: v.number(),
  }).index("by_clientId_and_timestamp", ["clientId", "timestamp"]),
});
