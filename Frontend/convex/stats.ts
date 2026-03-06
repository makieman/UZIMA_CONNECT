import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireFacilityScope } from "./permissions";

export const getAdminStats = query({
    args: {},
    handler: async (ctx, args) => {
        // SECURITY: Require facility scope, but allow super_admin
        const { hospitalId, user } = await requireFacilityScope(ctx);

        let incomingReferrals;
        let outgoingReferrals;

        if (hospitalId) {
            incomingReferrals = await ctx.db.query("referrals")
                .withIndex("by_receiving_hospital", q => q.eq("receivingHospitalId", hospitalId))
                .collect();

            outgoingReferrals = await ctx.db.query("referrals")
                .withIndex("by_referring_hospital", q => q.eq("referringHospitalId", hospitalId))
                .collect();
        } else {
            const allReferrals = await ctx.db.query("referrals").collect();
            incomingReferrals = allReferrals;
            outgoingReferrals = allReferrals;
        }

        const bookings = await ctx.db.query("bookings").collect(); // Left unscoped for now or we could omit it if not needed

        // For totals, use outgoing referrals to measure their primary activity
        const total = outgoingReferrals.length;

        // Completed metrics usually calculated based on outgoing
        const completed = outgoingReferrals.filter(r =>
            ["paid", "completed", "confirmed"].includes(r.status)
        ).length;

        // Pending action items apply to outgoing referrals
        const pendingReferrals = outgoingReferrals.filter(r =>
            ["pending-admin", "awaiting-biodata", "pending-payment"].includes(r.status)
        ).length;

        const expired = bookings.filter(b => b.status === "expired" || b.status === "cancelled").length;

        // Count for the incoming tab (only after paid gate)
        const incomingCount = incomingReferrals.filter(r =>
            ["paid", "completed", "confirmed"].includes(r.status)
        ).length;

        return {
            total,
            completed,
            pending: pendingReferrals,
            expired,
            outgoing: outgoingReferrals.length,
            incoming: incomingCount
        };
    },
});

/**
 * getSuperAdminStats
 * Returns pure system-wide counts specifically for the Super Admin unified dashboard.
 */
export const getSuperAdminStats = query({
    args: {},
    handler: async (ctx) => {
        // SECURITY: Require user to be authenticated
        const { user } = await requireFacilityScope(ctx);
        if (user.role !== "super_admin") {
            throw new Error("Only super_admins can fetch system-wide statistics");
        }

        const hospitals = await ctx.db.query("hospitals").collect();
        const activePhysicians = await ctx.db.query("physicians").filter(q => q.eq(q.field("isVerified"), true)).collect();
        const referrals = await ctx.db.query("referrals").collect();
        const users = await ctx.db.query("users").collect();

        return {
            totalHospitals: hospitals.length,
            totalPhysicians: activePhysicians.length,
            totalReferrals: referrals.length,
            totalUsers: users.length
        };
    }
});
