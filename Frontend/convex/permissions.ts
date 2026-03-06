import { QueryCtx, MutationCtx, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id, Doc } from "./_generated/dataModel";

export type Role = "super_admin" | "facility_admin" | "physician" | "patient";

/**
 * Require a user to be authenticated and return their user document.
 * (Secure: completely relies on Convex auth session)
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
        throw new Error("Not authenticated");
    }

    // Try to get user
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
        console.error("User not found in database:", userId);
        throw new Error("User not found");
    }
    return user;
}

/**
 * Require a user to have one of the specified roles.
 */
export async function requireRole(ctx: QueryCtx | MutationCtx, roles: Role[]) {
    const user = await requireUser(ctx);

    if (!roles.includes(user.role as Role)) {
        throw new Error(`Insufficient permissions. Required roles: ${roles.join(", ")}. Current role: ${user.role}`);
    }
    return user;
}

/**
 * Require Facility Scope
 * Returns the user and an optional hospitalId defining their viewable scope.
 * - super_admin: views all hospitals (hospitalId = undefined)
 * - facility_admin: views only their assigned hospital (hospitalId = user.hospitalId)
 * - physician: views only their assigned hospital (hospitalId = physician.hospitalId)
 */
export async function requireFacilityScope(ctx: QueryCtx | MutationCtx): Promise<{ user: Doc<"users">; hospitalId?: Id<"hospitals"> }> {
    const user = await requireUser(ctx);

    if (user.role === "super_admin") {
        return { user, hospitalId: undefined }; // No scope restriction
    }

    if (user.role === "facility_admin") {
        if (!user.hospitalId) throw new Error("Facility Admin is not assigned to any hospital");
        return { user, hospitalId: user.hospitalId };
    }

    if (user.role === "physician") {
        const physician = await ctx.db
            .query("physicians")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique();
        if (!physician) throw new Error("Physician profile not found");
        return { user, hospitalId: physician.hospitalId };
    }

    throw new Error("Insufficient permissions for facility-scoped access");
}

/**
 * Check if the current user is the physician with the given ID.
 * Physicians can only access their own profile data.
 */
export async function checkPhysicianAccess(ctx: QueryCtx | MutationCtx, physicianId: Id<"physicians">) {
    const user = await requireRole(ctx, ["physician", "super_admin", "facility_admin"]);

    // Admins bypass this check for profile viewing
    if (user.role === "super_admin" || user.role === "facility_admin") return;

    const physician = await ctx.db
        .query("physicians")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter(q => q.eq(q.field("_id"), physicianId))
        .unique();

    if (!physician || physician._id !== physicianId) {
        throw new Error("Unauthorized access to physician data");
    }

    return physician;
}

/**
 * Check if the current user is the patient with the given ID.
 */
export async function checkPatientAccess(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
    const user = await requireUser(ctx);

    // Admins might have access depending on business logic
    if (user.role === "super_admin" || user.role === "facility_admin") return;

    if (user._id !== userId) {
        throw new Error("Unauthorized access to patient data");
    }

    return user;
}

/**
 * Internal query to validate role, usable from actions.
 */
export const validateRole = internalQuery({
    args: { roles: v.array(v.string()) },
    handler: async (ctx, args) => {
        await requireRole(ctx, args.roles as Role[]);
        return true;
    },
});
