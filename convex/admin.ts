import {
  internalQuery,
  internalMutation,
  action,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ─── Internal helpers ────────────────────────────────────────────────────────

export const getSettings = internalQuery({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("settings"),
      _creationTime: v.number(),
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
    v.null()
  ),
  handler: async (ctx) => {
    return await ctx.db.query("settings").first();
  },
});

// ─── Admin password gate ─────────────────────────────────────────────────────

export const checkAdminPassword = action({
  args: { password: v.string() },
  returns: v.boolean(),
  handler: async (_ctx, { password }) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    return password === adminPassword;
  },
});

// ─── Settings management ─────────────────────────────────────────────────────

export const updateSettings = action({
  args: {
    adminPassword: v.string(),
    aiProvider: v.optional(
      v.union(
        v.literal("groq"),
        v.literal("gemini"),
        v.literal("anthropic"),
        v.literal("openai")
      )
    ),
    maintenanceMode: v.optional(v.boolean()),
    freeReplyLimit: v.optional(v.number()),
    starterMonthlyLimit: v.optional(v.number()),
  },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    if (args.adminPassword !== process.env.ADMIN_PASSWORD) {
      return { success: false, error: "Invalid password" };
    }
    await ctx.runMutation(internal.admin.upsertSettings, {
      aiProvider: args.aiProvider,
      maintenanceMode: args.maintenanceMode,
      freeReplyLimit: args.freeReplyLimit,
      starterMonthlyLimit: args.starterMonthlyLimit,
    });
    return { success: true };
  },
});

export const upsertSettings = internalMutation({
  args: {
    aiProvider: v.optional(
      v.union(
        v.literal("groq"),
        v.literal("gemini"),
        v.literal("anthropic"),
        v.literal("openai")
      )
    ),
    maintenanceMode: v.optional(v.boolean()),
    freeReplyLimit: v.optional(v.number()),
    starterMonthlyLimit: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();
    const defaults = {
      aiProvider: "groq" as const,
      maintenanceMode: false,
      freeReplyLimit: 5,
      starterMonthlyLimit: 30,
    };
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.aiProvider !== undefined && { aiProvider: args.aiProvider }),
        ...(args.maintenanceMode !== undefined && { maintenanceMode: args.maintenanceMode }),
        ...(args.freeReplyLimit !== undefined && { freeReplyLimit: args.freeReplyLimit }),
        ...(args.starterMonthlyLimit !== undefined && { starterMonthlyLimit: args.starterMonthlyLimit }),
      });
    } else {
      await ctx.db.insert("settings", {
        ...defaults,
        ...(args.aiProvider !== undefined && { aiProvider: args.aiProvider }),
        ...(args.maintenanceMode !== undefined && { maintenanceMode: args.maintenanceMode }),
        ...(args.freeReplyLimit !== undefined && { freeReplyLimit: args.freeReplyLimit }),
        ...(args.starterMonthlyLimit !== undefined && { starterMonthlyLimit: args.starterMonthlyLimit }),
      });
    }
    return null;
  },
});

// ─── User management (admin) ─────────────────────────────────────────────────

export const activateUser = action({
  args: {
    adminPassword: v.string(),
    userId: v.id("users"),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("agency")
    ),
    note: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    if (args.adminPassword !== process.env.ADMIN_PASSWORD) {
      return { success: false, error: "Invalid password" };
    }
    await ctx.runMutation(internal.admin.setUserPlan, {
      userId: args.userId,
      plan: args.plan,
      isActive: true,
      activatedBy: args.note ?? "Admin activated",
    });
    return { success: true };
  },
});

export const setUserPlan = internalMutation({
  args: {
    userId: v.id("users"),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("agency")
    ),
    isActive: v.boolean(),
    activatedBy: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      plan: args.plan,
      isActive: args.isActive,
      ...(args.activatedBy !== undefined && { activatedBy: args.activatedBy }),
    });
    return null;
  },
});

// ─── Admin dashboard stats ────────────────────────────────────────────────────

export const getDashboardStats = action({
  args: { adminPassword: v.string() },
  returns: v.union(
    v.object({
      totalUsers: v.number(),
      activeUsers: v.number(),
      proUsers: v.number(),
      totalReplies: v.number(),
      todayReplies: v.number(),
      newContacts: v.number(),
      aiProvider: v.string(),
    }),
    v.object({ error: v.string() })
  ),
  handler: async (ctx, { adminPassword }) => {
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return { error: "Invalid password" };
    }
    return await ctx.runQuery(internal.admin.computeStats, {});
  },
});

export const computeStats = internalQuery({
  args: {},
  returns: v.object({
    totalUsers: v.number(),
    activeUsers: v.number(),
    proUsers: v.number(),
    totalReplies: v.number(),
    todayReplies: v.number(),
    newContacts: v.number(),
    aiProvider: v.string(),
  }),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const proUsers = users.filter((u) => u.plan === "pro" || u.plan === "agency").length;
    const totalReplies = users.reduce((sum, u) => sum + u.repliesUsed, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayReplies = await ctx.db
      .query("replies")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", todayStart.getTime()))
      .collect();

    const newContacts = await ctx.db
      .query("contactRequests")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .collect();

    const settings = await ctx.db.query("settings").first();

    return {
      totalUsers,
      activeUsers,
      proUsers,
      totalReplies,
      todayReplies: todayReplies.length,
      newContacts: newContacts.length,
      aiProvider: settings?.aiProvider ?? "groq",
    };
  },
});

// List all users for admin
export const listUsers = action({
  args: { adminPassword: v.string() },
  returns: v.union(
    v.array(
      v.object({
        _id: v.id("users"),
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        plan: v.string(),
        isActive: v.boolean(),
        repliesUsed: v.number(),
        createdAt: v.number(),
      })
    ),
    v.object({ error: v.string() })
  ),
  handler: async (ctx, { adminPassword }) => {
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return { error: "Invalid password" };
    }
    return await ctx.runQuery(internal.admin.getAllUsers, {});
  },
});

export const getAllUsers = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      plan: v.string(),
      isActive: v.boolean(),
      repliesUsed: v.number(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      plan: u.plan,
      isActive: u.isActive,
      repliesUsed: u.repliesUsed,
      createdAt: u.createdAt,
    }));
  },
});

// ─── Contact requests ─────────────────────────────────────────────────────────

export const submitContactRequest = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    planInterested: v.string(),
    message: v.optional(v.string()),
  },
  returns: v.id("contactRequests"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactRequests", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });
  },
});

export const listContactRequests = action({
  args: { adminPassword: v.string() },
  returns: v.union(
    v.array(
      v.object({
        _id: v.id("contactRequests"),
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
      })
    ),
    v.object({ error: v.string() })
  ),
  handler: async (ctx, { adminPassword }) => {
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return { error: "Invalid password" };
    }
    return await ctx.runQuery(internal.admin.getContactRequests, {});
  },
});

export const getContactRequests = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("contactRequests"),
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
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("contactRequests").order("desc").collect();
  },
});
