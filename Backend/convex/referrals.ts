import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole, checkPhysicianAccess, requireFacilityScope } from "./permissions";
import { logAudit } from "./audit";

// Generate referral token
function generateToken(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new referral
export const createReferral = mutation({
  args: {
    physicianId: v.id("physicians"),
    patientName: v.string(),
    patientId: v.optional(v.string()),
    medicalHistory: v.string(),
    labResults: v.string(),
    diagnosis: v.string(),
    referringHospital: v.optional(v.string()),
    receivingFacility: v.optional(v.string()),
    referringHospitalId: v.optional(v.id("hospitals")),
    receivingHospitalId: v.optional(v.id("hospitals")),
    priority: v.union(v.literal("Routine"), v.literal("Urgent"), v.literal("Emergency")),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require physician role
    await requireRole(ctx, ["physician", "super_admin"]);

    // Check for existing token for same patient ID
    let token: string | undefined;

    if (args.patientId) {
      const existingReferral = await ctx.db
        .query("referrals")
        .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
        .filter((q) => q.or(
          q.eq(q.field("status"), "pending-admin"),
          q.eq(q.field("status"), "awaiting-biodata")
        ))
        .first();

      if (existingReferral?.referralToken) {
        token = existingReferral.referralToken;
      }
    }

    if (!token) {
      token = generateToken();
    }

    const { ...referralData } = args;

    const referralId = await ctx.db.insert("referrals", {
      ...referralData,
      status: "pending-admin",
      referralToken: token,
      stkSentCount: 0,
    });

    // AUDIT: Log referral creation
    await logAudit(ctx, "create_referral", { patientName: args.patientName, priority: args.priority }, referralId);

    return referralId;
  },
});

// Get referrals by physician
export const getReferralsByPhysician = query({
  args: {
    physicianId: v.id("physicians"),
  },
  handler: async (ctx, args) => {
    // SECURITY: Ensure physician can only see their own referrals or admin
    await checkPhysicianAccess(ctx, args.physicianId);

    return await ctx.db
      .query("referrals")
      .withIndex("by_physician", (q) => q.eq("physicianId", args.physicianId))
      .order("desc")
      .collect();
  },
});

// Get referrals by status
export const getReferralsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending-admin"),
      v.literal("awaiting-biodata"),
      v.literal("pending-payment"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const { hospitalId } = await requireFacilityScope(ctx);

    let baseQuery = ctx.db.query("referrals").withIndex("by_status", (q) => q.eq("status", args.status));

    // Apply hospital scope
    if (hospitalId) {
      const allReferrals = await baseQuery.order("desc").collect();
      return allReferrals.filter(r => r.receivingHospitalId === hospitalId || r.referringHospitalId === hospitalId);
    }

    return await baseQuery.order("desc").collect();
  },
});

// Get all pending referrals for admin (scoped)
export const getPendingReferrals = query({
  args: {},
  handler: async (ctx) => {
    const { hospitalId } = await requireFacilityScope(ctx);

    let queryFn = ctx.db.query("referrals");

    // Use index if scoped - pending referrals belong to the REFERRING hospital
    let results;
    if (hospitalId) {
      results = await queryFn
        .withIndex("by_referring_hospital", q => q.eq("referringHospitalId", hospitalId))
        .collect();
    } else {
      results = await queryFn.collect();
    }

    return results
      .filter((r) =>
        r.status === "pending-admin" ||
        r.status === "awaiting-biodata" ||
        r.status === "pending-payment"
      )
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
  },
});

// Update referral status only
export const updateReferralStatus = mutation({
  args: {
    referralId: v.id("referrals"),
    status: v.union(
      v.literal("pending-admin"),
      v.literal("awaiting-biodata"),
      v.literal("pending-payment"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    // SECURITY: Requires facility scope
    await requireFacilityScope(ctx);

    const { referralId, status } = args;

    // Get referral details before update
    const referral = await ctx.db.get(referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    // SECURITY: "paid" can ONLY be set by processPaymentResult, not manually
    if (status === "paid") {
      throw new Error("Payment status can only be set by the payment system");
    }

    // Validate state transitions
    const validTransitions: Record<string, string[]> = {
      "pending-admin": ["awaiting-biodata", "cancelled"],
      "awaiting-biodata": ["pending-payment", "cancelled"],
      "pending-payment": ["cancelled"],         // "paid" only via payment system
      "paid": ["confirmed", "cancelled"],
      "confirmed": ["completed", "cancelled"],
      "completed": [],                          // Terminal state
      "cancelled": [],                          // Terminal state
    };
    if (!validTransitions[referral.status]?.includes(status)) {
      throw new Error(`Cannot transition from "${referral.status}" to "${status}"`);
    }

    const updates: any = {
      status,
      updatedAt: Date.now(),
    };

    // Add completion timestamp if status is completed
    if (status === "completed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(referralId, updates);

    // AUDIT: Log status update
    await logAudit(ctx, "update_referral_status", { status }, referralId);

    return await ctx.db.get(referralId);
  },
});

// Save biodata and transition to pending-payment
export const saveBiodata = mutation({
  args: {
    referralId: v.id("referrals"),
    patientPhone: v.string(),
    stkPhoneNumber: v.string(),
    patientEmail: v.optional(v.string()),
    patientDateOfBirth: v.optional(v.string()),
    patientNationalId: v.optional(v.string()),
    bookedDate: v.optional(v.string()),
    bookedTime: v.optional(v.string()),
    biodataCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require facility scope
    await requireFacilityScope(ctx);

    const { referralId, ...biodata } = args;

    const referral = await ctx.db.get(referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    // Update biodata fields and transition status
    await ctx.db.patch(referralId, {
      ...biodata,
      status: "pending-payment",
    });

    // AUDIT: Log biodata save
    await logAudit(ctx, "save_biodata", {
      patientPhone: biodata.patientPhone,
      stkPhoneNumber: biodata.stkPhoneNumber,
      patientEmail: biodata.patientEmail,
      biodataCode: biodata.biodataCode
    }, referralId);

    return await ctx.db.get(referralId);
  },
});

// Update phone numbers only
export const updatePhoneNumbers = mutation({
  args: {
    referralId: v.id("referrals"),
    patientPhone: v.string(),
    stkPhoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require facility scope
    await requireFacilityScope(ctx);

    const { referralId, ...phones } = args;

    const referral = await ctx.db.get(referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    await ctx.db.patch(referralId, {
      ...phones,
    });

    // AUDIT: Log phone update
    await logAudit(ctx, "update_phone_numbers", phones, referralId);

    return await ctx.db.get(referralId);
  },
});

// Increment STK sent count
export const incrementStkCount = mutation({
  args: {
    referralId: v.id("referrals"),
  },
  handler: async (ctx, args) => {
    await requireFacilityScope(ctx);

    const referral = await ctx.db.get(args.referralId);
    if (!referral) throw new Error("Referral not found");

    await ctx.db.patch(args.referralId, {
      stkSentCount: (referral.stkSentCount || 0) + 1,
    });

    return referral.stkSentCount || 0 + 1;
  },
});

// Get referral by token
export const getReferralByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referrals")
      .withIndex("by_token", (q) => q.eq("referralToken", args.token))
      .unique();
  },
});

// Get completed referrals (scoped)
export const getCompletedReferrals = query({
  args: {},
  handler: async (ctx) => {
    const { hospitalId } = await requireFacilityScope(ctx);

    let queryFn = ctx.db.query("referrals");

    // Use index if scoped
    let results;
    if (hospitalId) {
      results = await queryFn
        .withIndex("by_receiving_hospital", q => q.eq("receivingHospitalId", hospitalId))
        .collect();
    } else {
      results = await queryFn.collect();
    }

    return results
      .filter((r) =>
        r.status === "confirmed" ||
        r.status === "paid" ||
        r.status === "completed"
      )
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
  },
});

// Get incoming referrals for a facility (Receiving Physician View)
export const getIncomingReferrals = query({
  args: {},
  handler: async (ctx) => {
    // Now powered purely by the user's hospital assignment
    const { hospitalId } = await requireFacilityScope(ctx);

    if (!hospitalId) {
      // Super admin sees everything
      return await ctx.db.query("referrals").order("desc").collect();
    }

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_receiving_hospital", q => q.eq("receivingHospitalId", hospitalId))
      .order("desc")
      .collect();

    // SECURITY: Only show referrals that have been paid
    // Receiving hospital must NEVER see pre-payment referrals
    return referrals.filter(r =>
      r.status === "paid" ||
      r.status === "confirmed" ||
      r.status === "completed"
    );
  },
});

// Get outgoing referrals for a facility (Sending Admin/Physician View)
export const getOutgoingReferrals = query({
  args: {},
  handler: async (ctx) => {
    const { hospitalId } = await requireFacilityScope(ctx);

    if (!hospitalId) {
      // Super admin sees everything
      return await ctx.db.query("referrals").order("desc").collect();
    }

    return await ctx.db
      .query("referrals")
      .withIndex("by_referring_hospital", q => q.eq("referringHospitalId", hospitalId))
      .order("desc")
      .collect();
  },
});
