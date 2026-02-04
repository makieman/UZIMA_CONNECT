import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all physicians (for admin dashboard)
export const getAllPhysicians = query({
  args: {
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Getting all physicians for:", args.demoUserId);
    
    try {
      const physicians = await ctx.db.query("physicians").collect();
      
      // Sort by name
      const sortedPhysicians = physicians.sort((a, b) => 
        (a.fullName || "").localeCompare(b.fullName || "")
      );
      
      console.log(`Found ${sortedPhysicians.length} physicians`);
      return sortedPhysicians;
      
    } catch (error) {
      console.error("Error getting all physicians:", error);
      return [];
    }
  },
});

// Get physician by ID
export const getPhysicianById = query({
  args: {
    physicianId: v.id("physicians"),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Getting physician by ID:", args.physicianId);
    
    try {
      const physician = await ctx.db.get(args.physicianId);
      
      if (!physician) {
        console.log("Physician not found:", args.physicianId);
        return null;
      }
      
      console.log("Found physician:", physician.id);
      return physician;
      
    } catch (error) {
      console.error("Error getting physician by ID:", error);
      return null;
    }
  },
});

// Get physician by license ID
export const getPhysicianByLicenseId = query({
  args: {
    licenseId: v.string(),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Getting physician by license ID:", args.licenseId);
    
    try {
      const physicians = await ctx.db.query("physicians").collect();
      const physician = physicians.find(p => p.licenseId === args.licenseId);
      
      if (!physician) {
        console.log("Physician not found with license ID:", args.licenseId);
        return null;
      }
      
      console.log("Found physician:", physician.id);
      return physician;
      
    } catch (error) {
      console.error("Error getting physician by license ID:", error);
      return null;
    }
  },
});

// Create or update physician
export const createOrUpdatePhysician = mutation({
  args: {
    licenseId: v.string(),
    fullName: v.string(),
    email: v.string(),
    hospital: v.string(),
    specialization: v.string(),
    phoneNumber: v.optional(v.string()),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Creating/updating physician:", args.licenseId);
    
    try {
      // Check if physician already exists
      const physicians = await ctx.db.query("physicians").collect();
      const existingPhysician = physicians.find(p => p.licenseId === args.licenseId);
      
      if (existingPhysician) {
        // Update existing physician
        await ctx.db.patch(existingPhysician._id, {
          fullName: args.fullName,
          email: args.email,
          hospital: args.hospital,
          specialization: args.specialization,
          phoneNumber: args.phoneNumber,
          updatedAt: Date.now()
        });
        
        console.log("Updated existing physician:", existingPhysician._id);
        return { success: true, physicianId: existingPhysician._id, action: "updated" };
      } else {
        // Create new physician
        const physicianId = await ctx.db.insert("physicians", {
          licenseId: args.licenseId,
          fullName: args.fullName,
          email: args.email,
          hospital: args.hospital,
          specialization: args.specialization,
          phoneNumber: args.phoneNumber,
          role: "physician",
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        
        console.log("Created new physician:", physicianId);
        return { success: true, physicianId, action: "created" };
      }
      
    } catch (error) {
      console.error("Error creating/updating physician:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

// Delete physician
export const deletePhysician = mutation({
  args: {
    physicianId: v.id("physicians"),
    demoUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // TODO: Add proper authentication check
    console.log("Deleting physician:", args.physicianId);
    
    try {
      const physician = await ctx.db.get(args.physicianId);
      
      if (!physician) {
        console.log("Physician not found:", args.physicianId);
        return { success: false, error: "Physician not found" };
      }
      
      await ctx.db.delete(args.physicianId);
      
      console.log("Deleted physician successfully");
      return { success: true, message: "Physician deleted" };
      
    } catch (error) {
      console.error("Error deleting physician:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});
