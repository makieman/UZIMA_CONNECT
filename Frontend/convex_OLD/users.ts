import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user by email for authentication
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    console.log("Looking up user by email:", email);
    
    try {
      // Try to find user in users table first
      const users = await ctx.db.query("users").collect();
      const user = users.find(u => u.email === email);
      
      if (user) {
        console.log("Found user:", user.id);
        return user;
      }
      
      // If not found in users table, try physicians table
      const physicians = await ctx.db.query("physicians").collect();
      const physician = physicians.find(p => p.email === email);
      
      if (physician) {
        console.log("Found physician:", physician.id);
        return {
          ...physician,
          type: "physician",
          role: "physician"
        };
      }
      
      // If not found in physicians table, try patients table
      const patients = await ctx.db.query("patients").collect();
      const patient = patients.find(p => p.email === email);
      
      if (patient) {
        console.log("Found patient:", patient.id);
        return {
          ...patient,
          type: "patient",
          role: "patient"
        };
      }
      
      console.log("No user found for email:", email);
      return null;
      
    } catch (error) {
      console.error("Error looking up user by email:", error);
      return null;
    }
  },
});

// Get user by phone number for authentication
export const getUserByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, { phoneNumber }) => {
    console.log("Looking up user by phone:", phoneNumber);
    
    try {
      // Try patients table first (phone numbers are common for patients)
      const patients = await ctx.db.query("patients").collect();
      const patient = patients.find(p => p.phoneNumber === phoneNumber);
      
      if (patient) {
        console.log("Found patient by phone:", patient.id);
        return {
          ...patient,
          type: "patient",
          role: "patient"
        };
      }
      
      console.log("No user found for phone:", phoneNumber);
      return null;
      
    } catch (error) {
      console.error("Error looking up user by phone:", error);
      return null;
    }
  },
});

// Create or update user (for registration)
export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("physician"), v.literal("patient")),
    phoneNumber: v.optional(v.string()),
    licenseId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Creating/updating user:", args.email);
    
    try {
      // Check if user already exists
      const users = await ctx.db.query("users").collect();
      const existingUser = users.find(u => u.email === args.email);
      
      if (existingUser) {
        // Update existing user
        await ctx.db.patch(existingUser._id, {
          name: args.name,
          phoneNumber: args.phoneNumber,
          updatedAt: Date.now()
        });
        
        console.log("Updated existing user:", existingUser._id);
        return { success: true, userId: existingUser._id, action: "updated" };
      } else {
        // Create new user
        const userId = await ctx.db.insert("users", {
          email: args.email,
          name: args.name,
          role: args.role,
          phoneNumber: args.phoneNumber,
          licenseId: args.licenseId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        
        console.log("Created new user:", userId);
        return { success: true, userId, action: "created" };
      }
      
    } catch (error) {
      console.error("Error creating/updating user:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});
