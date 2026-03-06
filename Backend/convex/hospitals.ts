import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireFacilityScope } from "./permissions";
import { logAudit } from "./audit";

// Get active hospitals for public forms
export const getActiveHospitals = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("hospitals")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .collect();
    },
});

// Get hospital by ID
export const getHospitalById = query({
    args: { hospitalId: v.id("hospitals") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.hospitalId);
    },
});

// Search hospitals by name
export const searchHospitals = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("hospitals")
            .withSearchIndex("search_name", (q) => q.search("name", args.query))
            .take(10);
    },
});

// Create a hospital (super_admin only)
export const createHospital = mutation({
    args: {
        name: v.string(),
        code: v.string(),
        county: v.optional(v.string()),
        level: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        contactEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // SECURITY: Require super_admin role
        const { user } = await requireFacilityScope(ctx);
        if (user.role !== "super_admin") {
            throw new Error("Only super_admins can create hospitals");
        }

        const hospitalId = await ctx.db.insert("hospitals", {
            ...args,
            isActive: true,
            createdAt: Date.now(),
        });

        await logAudit(ctx, "create_hospital", { name: args.name, code: args.code }, hospitalId);
        return hospitalId;
    },
});

// Update a hospital (super_admin only)
export const updateHospital = mutation({
    args: {
        hospitalId: v.id("hospitals"),
        name: v.optional(v.string()),
        code: v.optional(v.string()),
        county: v.optional(v.string()),
        level: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        contactEmail: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { user } = await requireFacilityScope(ctx);
        if (user.role !== "super_admin") {
            throw new Error("Only super_admins can update hospitals");
        }

        const { hospitalId, ...updates } = args;
        await ctx.db.patch(hospitalId, updates);
        await logAudit(ctx, "update_hospital", updates, hospitalId);

        return await ctx.db.get(hospitalId);
    },
});

// Seed data for initial testing
export const seedHospitals = mutation({
    args: {},
    handler: async (ctx) => {
        // SECURITY: Ensure user is a super admin
        const { user } = await requireFacilityScope(ctx);
        if (user.role !== "super_admin") {
            throw new Error("Only super_admins can seed hospitals");
        }

        // Check if hospitals already exist
        const existing = await ctx.db.query("hospitals").take(1);
        if (existing.length > 0) return "Already seeded";

        const seedData = [
            { name: "Kenyatta National Hospital", code: "KNH-001", county: "Nairobi", level: "Level 6" },
            { name: "Moi Teaching and Referral Hospital", code: "MTRH-002", county: "Uasin Gishu", level: "Level 6" },
            { name: "Coast General Teaching and Referral Hospital", code: "CGH-003", county: "Mombasa", level: "Level 5" },
            { name: "Nakuru Level 5 Hospital", code: "NK-004", county: "Nakuru", level: "Level 5" },
            { name: "Aga Khan University Hospital", code: "AKUH-005", county: "Nairobi", level: "Level 6" },
        ];

        for (const hospital of seedData) {
            await ctx.db.insert("hospitals", {
                ...hospital,
                isActive: true,
                createdAt: Date.now(),
            });
        }

        return `Seeded ${seedData.length} hospitals`;
    }
});
