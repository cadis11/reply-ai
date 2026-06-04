import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("agency")
    ),
    repliesUsed: v.number(),
    repliesThisMonth: v.number(),
    monthYear: v.string(),
    isActive: v.boolean(),
    activatedBy: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    personType: v.union(
      v.literal("politician"),
      v.literal("minister"),
      v.literal("mayor"),
      v.literal("ward_chair"),
      v.literal("candidate"),
      v.literal("activist"),
      v.literal("journalist"),
      v.literal("influencer"),
      v.literal("ngo_leader"),
      v.literal("public_figure")
    ),
    party: v.optional(v.string()),
    constituency: v.optional(v.string()),
    brandVoice: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  replies: defineTable({
    userId: v.id("users"),
    profileId: v.optional(v.id("profiles")),
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
    generatedReplies: v.array(v.string()),
    selectedReply: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  monitorResults: defineTable({
    userId: v.id("users"),
    searchQuery: v.string(),
    results: v.array(
      v.object({
        title: v.string(),
        source: v.string(),
        url: v.string(),
        snippet: v.string(),
        sentiment: v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral")),
        platform: v.string(),
        publishedAt: v.optional(v.string()),
      })
    ),
    fetchedAt: v.number(),
  }).index("by_user", ["userId"]),

  settings: defineTable({
    aiProvider: v.union(
      v.literal("groq"),
      v.literal("gemini"),
      v.literal("anthropic"),
      v.literal("openai")
    ),
    maintenanceMode: v.boolean(),
    freeReplyLimit: v.number(),
    starterMonthlyLimit: v.number(),
  }),

  contactRequests: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    planInterested: v.string(),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("activated")
    ),
    createdAt: v.number(),
  }).index("by_status", ["status"]),
});
