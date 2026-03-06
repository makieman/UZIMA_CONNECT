import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, requireFacilityScope } from "./permissions";

// Create physician profile
export const createPhysician = mutation({
  args: {
    userId: v.id("users"),
    licenseId: v.string(),
    hospital: v.optional(v.string()), // Legacy string
    hospitalId: v.optional(v.id("hospitals")), // Typed reference
    specialization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Only facility_admin or super_admin can register physicians
    await requireRole(ctx, ["facility_admin", "super_admin"]);

    const physicianId = await ctx.db.insert("physicians", {
      ...args,
      isVerified: false, // Admins must explicitly verify
    });
    return physicianId;
  },
});

// Get physician by user ID
export const getPhysicianByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("physicians")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// Get physician by license ID
export const getPhysicianByLicense = query({
  args: { licenseId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("physicians")
      .withIndex("by_license", (q) => q.eq("licenseId", args.licenseId))
      .unique();
  },
});

// Resolve physician email by license for login
export const getEmailByLicense = query({
  args: { licenseId: v.string() },
  handler: async (ctx, args) => {
    const physician = await ctx.db
      .query("physicians")
      .withIndex("by_license", (q) => q.eq("licenseId", args.licenseId))
      .unique();

    if (!physician) return null;

    const user = await ctx.db.get(physician.userId);
    return user ? user.email : null;
  },
});


// Get all physicians — SECURITY: scoped by hospital for facility_admin
export const getAllPhysicians = query({
  args: {},
  handler: async (ctx) => {
    // SECURITY: facility_admin sees only their hospital's physicians; super_admin sees all
    const { hospitalId } = await requireFacilityScope(ctx);

    let physicians;
    if (hospitalId) {
      physicians = await ctx.db
        .query("physicians")
        .withIndex("by_hospital", (q) => q.eq("hospitalId", hospitalId))
        .collect();
    } else {
      physicians = await ctx.db.query("physicians").collect();
    }

    // Join with user data
    const physiciansWithUsers = await Promise.all(
      physicians.map(async (physician) => {
        const user = await ctx.db.get(physician.userId);
        return {
          ...physician,
          user,
        };
      })
    );

    return physiciansWithUsers;
  },
});

// Update physician profile — SECURITY: restricted to admins only
export const updatePhysician = mutation({
  args: {
    physicianId: v.id("physicians"),
    hospital: v.optional(v.string()),
    hospitalId: v.optional(v.id("hospitals")),
    specialization: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Only facility_admin or super_admin can update physician records
    await requireRole(ctx, ["facility_admin", "super_admin"]);

    const { physicianId, ...updates } = args;
    await ctx.db.patch(physicianId, updates);
    return await ctx.db.get(physicianId);
  },
});

// Verify initial password for first-time login
export const checkInitialPassword = mutation({
  args: {
    licenseId: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const physician = await ctx.db
      .query("physicians")
      .withIndex("by_license", (q) => q.eq("licenseId", args.licenseId))
      .unique();

    if (!physician) {
      return false;
    }

    // Only allow if an initial password exists and matches
    if (physician.initialPassword && physician.initialPassword === args.password) {
      return true;
    }

    return false;
  },
});

// Clear initial password after successful registration
export const clearInitialPassword = mutation({
  args: {
    physicianId: v.id("physicians"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.physicianId, { initialPassword: undefined });
  },
});
