import { internalQuery, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const incrementUsage = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const sameMonth = user.monthYear === monthYear;

    await ctx.db.patch(userId, {
      repliesUsed: user.repliesUsed + 1,
      repliesThisMonth: sameMonth ? user.repliesThisMonth + 1 : 1,
      monthYear,
    });
    return null;
  },
});

// Public: register new user (free trial)
export const registerUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
  },
  returns: v.object({ userId: v.id("users"), alreadyExists: v.boolean() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return { userId: existing._id, alreadyExists: true };
    }

    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      phone: args.phone,
      plan: "free",
      repliesUsed: 0,
      repliesThisMonth: 0,
      monthYear,
      isActive: true,  // free users are auto-active
      createdAt: Date.now(),
    });

    return { userId, alreadyExists: false };
  },
});

// Public: get own user data (by email — no auth layer yet, simple)
export const getMyData = query({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});
