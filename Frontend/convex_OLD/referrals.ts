import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new referral
export const createReferral = mutation({
  args: {
    physicianId: v.id("physicians"),
    patientName: v.string(),
    patientId: v.optional(v.string()),
    medicalHistory: v.string(),
    labResults: v.string(),
    diagnosis: v.string(),
    referringHospital: v.string(),
    receivingFacility: v.string(),
    priority: v.union(v.literal("Routine"), v.literal("Urgent"), v.literal("Emergency")),
    patientPhone: v.optional(v.string()),
    stkPhoneNumber: v.optional(v.string()),
    patientDateOfBirth: v.optional(v.string()),
    patientNationalId: v.optional(v.string()),
    bookedDate: v.optional(v.string()),
    bookedTime: v.optional(v.string()),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Creating new referral for patient:", args.patientName);
    
    try {
      // Generate referral token
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      const referralId = await ctx.db.insert("referrals", {
        physicianId: args.physicianId,
        patientName: args.patientName,
        patientId: args.patientId,
        medicalHistory: args.medicalHistory,
        labResults: args.labResults,
        diagnosis: args.diagnosis,
        referringHospital: args.referringHospital,
        receivingFacility: args.receivingFacility,
        priority: args.priority,
        status: "pending-admin",
        referralToken: token,
        patientPhone: args.patientPhone,
        stkPhoneNumber: args.stkPhoneNumber,
        patientDateOfBirth: args.patientDateOfBirth,
        patientNationalId: args.patientNationalId,
        bookedDate: args.bookedDate,
        bookedTime: args.bookedTime,
        stkSentCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      console.log("Created referral successfully:", referralId);
      return { 
        success: true, 
        referralId,
        referralToken: token,
        message: "Referral created successfully" 
      };
      
    } catch (error) {
      console.error("Error creating referral:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

// Get all pending referrals (for admin dashboard)
export const getPendingReferrals = query({
  args: {
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Getting pending referrals for:", args.demoUserId);
    
    try {
      const referrals = await ctx.db.query("referrals").collect();
      const pendingReferrals = referrals.filter(r => 
        r.status === "pending-admin" || 
        r.status === "awaiting-biodata" ||
        r.status === "pending-payment"
      );
      
      // Sort by creation time (newest first)
      const sortedReferrals = pendingReferrals.sort((a, b) => 
        (b._creationTime || 0) - (a._creationTime || 0)
      );
      
      console.log(`Found ${sortedReferrals.length} pending referrals`);
      return sortedReferrals;
      
    } catch (error) {
      console.error("Error getting pending referrals:", error);
      return [];
    }
  },
});

// Get referrals by physician
export const getReferralsByPhysician = query({
  args: {
    physicianId: v.id("physicians"),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Getting referrals for physician:", args.physicianId);
    
    try {
      const referrals = await ctx.db.query("referrals").collect();
      const physicianReferrals = referrals.filter(r => r.physicianId === args.physicianId);
      
      // Sort by creation time (newest first)
      const sortedReferrals = physicianReferrals.sort((a, b) => 
        (b._creationTime || 0) - (a._creationTime || 0)
      );
      
      console.log(`Found ${sortedReferrals.length} referrals for physician`);
      return sortedReferrals;
      
    } catch (error) {
      console.error("Error getting physician referrals:", error);
      return [];
    }
  },
});

// Get referral by ID
export const getReferralById = query({
  args: {
    referralId: v.string(),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Getting referral by ID:", args.referralId);
    
    try {
      // Convert string ID to Convex ID format
      const referralId = ctx.db.normalizeId("referrals", args.referralId);
      if (!referralId) {
        console.log("Invalid referral ID format:", args.referralId);
        return null;
      }
      
      const referral = await ctx.db.get(referralId);
      
      if (!referral) {
        console.log("Referral not found:", referralId);
        return null;
      }
      
      console.log("Found referral:", referral.id);
      return referral;
      
    } catch (error) {
      console.error("Error getting referral by ID:", error);
      return null;
    }
  },
});

// Update referral status
export const updateReferralStatus = mutation({
  args: {
    referralId: v.string(),
    status: v.union(
      v.literal("pending-admin"),
      v.literal("awaiting-biodata"),
      v.literal("pending-payment"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Updating referral status:", args.referralId, "to", args.status);
    
    try {
      // Convert string ID to Convex ID format
      const referralId = ctx.db.normalizeId("referrals", args.referralId);
      if (!referralId) {
        console.log("Invalid referral ID format:", args.referralId);
        return { success: false, error: "Invalid referral ID format" };
      }
      
      const referral = await ctx.db.get(referralId);
      
      if (!referral) {
        console.log("Referral not found:", referralId);
        return { success: false, error: "Referral not found" };
      }
      
      await ctx.db.patch(referralId, {
        status: args.status,
        updatedAt: Date.now()
      });
      
      console.log("Updated referral status successfully");
      return { success: true, message: "Referral status updated" };
      
    } catch (error) {
      console.error("Error updating referral status:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

// Get all referrals (for admin)
export const getAllReferrals = query({
  args: {
    demoUserId: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Getting all referrals for:", args.demoUserId);
    
    try {
      const referrals = await ctx.db.query("referrals").collect();
      
      // Sort by creation time (newest first)
      const sortedReferrals = referrals.sort((a, b) => 
        (b._creationTime || 0) - (a._creationTime || 0)
      );
      
      // Apply pagination if specified
      let result = sortedReferrals;
      if (args.offset && args.offset > 0) {
        result = result.slice(args.offset);
      }
      if (args.limit && args.limit > 0) {
        result = result.slice(0, args.limit);
      }
      
      console.log(`Found ${result.length} referrals (total: ${sortedReferrals.length})`);
      return {
        referrals: result,
        total: sortedReferrals.length,
        hasMore: args.offset ? args.offset + result.length < sortedReferrals.length : false
      };
      
    } catch (error) {
      console.error("Error getting all referrals:", error);
      return { referrals: [], total: 0, hasMore: false };
    }
  },
});
