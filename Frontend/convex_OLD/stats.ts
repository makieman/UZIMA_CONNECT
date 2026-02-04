import { query } from "./_generated/server";
import { v } from "convex/values";

// Get admin dashboard statistics
export const getAdminStats = query({
  args: {
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Admin stats requested by:", args.demoUserId);

    try {
      const referrals = await ctx.db.query("referrals").collect();
      const physicians = await ctx.db.query("physicians").collect();
      const patients = await ctx.db.query("patients").collect();
      const payments = await ctx.db.query("payments").collect();

      const totalReferrals = referrals.length;
      const pendingReferrals = referrals.filter(r => r.status === "pending-admin").length;
      const completedReferrals = referrals.filter(r => r.status === "completed").length;
      const totalPhysicians = physicians.length;
      const totalPatients = patients.length;
      const totalPayments = payments.length;
      const pendingPayments = payments.filter(p => p.status === "pending").length;

      return {
        totalReferrals,
        pendingReferrals,
        completedReferrals,
        totalPhysicians,
        totalPatients,
        totalPayments,
        pendingPayments,
        completionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals * 100).toFixed(1) : "0"
      };
    } catch (error) {
      console.error("Error getting admin stats:", error);
      return {
        totalReferrals: 0,
        pendingReferrals: 0,
        completedReferrals: 0,
        totalPhysicians: 0,
        totalPatients: 0,
        totalPayments: 0,
        pendingPayments: 0,
        completionRate: "0",
        error: "Failed to load stats"
      };
    }
  }
});

// Get physician statistics
export const getPhysicianStats = query({
  args: {
    physicianId: v.id("physicians"),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Physician stats requested by:", args.demoUserId);

    try {
      const referrals = await ctx.db.query("referrals").collect();
      const physicianReferrals = referrals.filter(r => r.physicianId === args.physicianId);
      
      const totalReferrals = physicianReferrals.length;
      const pendingReferrals = physicianReferrals.filter(r => r.status === "pending-admin").length;
      const completedReferrals = physicianReferrals.filter(r => r.status === "completed").length;
      const activeReferrals = physicianReferrals.filter(r => r.status === "confirmed" || r.status === "pending-payment").length;

      return {
        totalReferrals,
        pendingReferrals,
        completedReferrals,
        activeReferrals,
        completionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals * 100).toFixed(1) : "0"
      };
    } catch (error) {
      console.error("Error getting physician stats:", error);
      return {
        totalReferrals: 0,
        pendingReferrals: 0,
        completedReferrals: 0,
        activeReferrals: 0,
        completionRate: "0",
        error: "Failed to load stats"
      };
    }
  }
});
