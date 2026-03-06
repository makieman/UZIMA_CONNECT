import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireRole, requireUser } from "./permissions";

// Get current logged in user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

// Create a new user — SECURITY: restricted to super_admin only
// Non-admin users are created automatically via auth.ts createOrUpdateUser callback
export const createUser = mutation({
  args: {
    role: v.union(v.literal("patient"), v.literal("physician"), v.literal("facility_admin"), v.literal("super_admin")),
    hospitalId: v.optional(v.id("hospitals")),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    // SECURITY: Only super_admin can create users with elevated roles
    await requireRole(ctx, ["super_admin"]);

    const userId = await ctx.db.insert("users", {
      ...args,
      isActive: true,
    });
    return userId;
  },
});

// Get user by email — SECURITY: requires authentication
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // SECURITY: Must be authenticated to look up users by email
    await requireUser(ctx);

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Get user by phone — SECURITY: requires authentication
export const getUserByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    // SECURITY: Must be authenticated to look up users by phone
    await requireUser(ctx);

    return await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .unique();
  },
});

// Update user profile — SECURITY: super_admin only to prevent role escalation
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    hospitalId: v.optional(v.id("hospitals")),
  },
  handler: async (ctx, args) => {
    // SECURITY: Only super_admin can update user records (prevents role escalation)
    await requireRole(ctx, ["super_admin"]);

    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  },
});

// Get users by role — SECURITY: restricted to admins only
export const getUsersByRole = query({
  args: { role: v.union(v.literal("patient"), v.literal("physician"), v.literal("facility_admin"), v.literal("super_admin")) },
  handler: async (ctx, args) => {
    // SECURITY: Only admins can enumerate users by role
    await requireRole(ctx, ["super_admin", "facility_admin"]);

    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

// Get all users — SECURITY: super_admin only
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // SECURITY: Only super_admin can enumerate all users
    await requireRole(ctx, ["super_admin"]);

    return await ctx.db
      .query("users")
      .collect();
  },
});
