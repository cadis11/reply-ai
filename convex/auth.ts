import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(
      ctx: MutationCtx,
      args: {
        existingUserId: import("convex/values").GenericId<"users"> | null;
        profile: { email?: string | null; name?: string | null };
      }
    ) {
      if (args.existingUserId) {
        return args.existingUserId;
      }
      const email = args.profile.email ?? "";
      const name = args.profile.name ?? email.split("@")[0] ?? "User";
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return await ctx.db.insert("users", {
        email,
        name,
        plan: "free",
        repliesUsed: 0,
        repliesThisMonth: 0,
        monthYear,
        isActive: true,
        createdAt: Date.now(),
      });
    },
  },
});
