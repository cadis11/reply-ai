import { internalQuery, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const userObject = v.object({
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
});

// Get current logged-in user
export const getMe = query({
  args: {},
  returns: v.union(userObject, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(userObject, v.null()),
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(userObject, v.null()),
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

// Keep for any legacy references — but getMe is now preferred
export const getMyData = query({
  args: { email: v.string() },
  returns: v.union(userObject, v.null()),
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});
