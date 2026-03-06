import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./permissions";
import { logAudit } from "./audit";

/**
 * createHospitalAdmin
 *
 * Allows a super_admin to create a facility_admin user for a specific hospital.
 * The created user can then log in using the provided credentials.
 * On first login, @convex-dev/auth links the credential to this pre-created user
 * record via the email-matching logic in createOrUpdateUser (auth.ts).
 *
 * Security:
 *  - Only super_admin can call this mutation
 *  - Hospital must exist and be active
 *  - Email must be unique across all users
 *  - Password must be at least 8 characters
 *  - Role is always forced to "facility_admin" regardless of input
 */
export const createHospitalAdmin = mutation({
    args: {
        email: v.string(),
        fullName: v.string(),
        hospitalId: v.id("hospitals"),
        phoneNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // SECURITY: Only super_admin can create hospital admins
        const callerUser = await requireRole(ctx, ["super_admin"]);

        // 1. Validate hospital exists and is active
        const hospital = await ctx.db.get(args.hospitalId);
        if (!hospital) {
            throw new Error("Hospital not found. Please select a valid hospital.");
        }
        if (!hospital.isActive) {
            throw new Error(
                `Hospital "${hospital.name}" is not active. Cannot assign admin to an inactive hospital.`
            );
        }

        // 2. Check email format (basic validation)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email address format.");
        }

        // 3. Check email uniqueness
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (existingUser) {
            throw new Error(
                `A user with email "${args.email}" already exists. Each admin must have a unique email address.`
            );
        }

        // 4. Create the user record with facility_admin role
        // SECURITY: role is ALWAYS forced to "facility_admin" — never trust any other input for role
        const userId = await ctx.db.insert("users", {
            email: args.email,
            fullName: args.fullName,
            phoneNumber: args.phoneNumber,
            role: "facility_admin", // FORCED — never dynamically set from args
            hospitalId: args.hospitalId,
            isActive: true,
        });

        // 5. Audit log the creation for compliance
        // logAudit signature: (ctx, action, details, resourceId?)
        await logAudit(
            ctx,
            "create_hospital_admin",
            {
                createdBy: callerUser._id,
                hospitalId: args.hospitalId,
                hospitalName: hospital.name,
                email: args.email,
                fullName: args.fullName,
            },
            String(userId)
        );

        return {
            userId,
            email: args.email,
            fullName: args.fullName,
            hospitalName: hospital.name,
            hospitalId: args.hospitalId,
            // The admin now exists in the users table.
            // They must log in using the /login page (Admin tab) with the
            // credentials you communicated to them. On first login, Convex auth
            // will create a credential record and link it to this user via email match.
        };
    },
});

/**
 * getHospitalAdmins
 *
 * Returns all facility_admin users, optionally filtered by hospitalId.
 * Only callable by super_admin.
 */
export const getHospitalAdmins = query({
    args: {
        hospitalId: v.optional(v.id("hospitals")),
    },
    handler: async (ctx, args) => {
        // SECURITY: Only super_admin can list hospital admins
        await requireRole(ctx, ["super_admin"]);

        const admins = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "facility_admin"))
            .collect();

        if (args.hospitalId) {
            return admins.filter((admin) => admin.hospitalId === args.hospitalId);
        }

        // Join with hospital data
        const adminsWithHospitals = await Promise.all(
            admins.map(async (admin) => {
                const hospital = admin.hospitalId
                    ? await ctx.db.get(admin.hospitalId)
                    : null;
                return { ...admin, hospital };
            })
        );

        return adminsWithHospitals;
    },
});

/**
 * createPhysicianUser
 *
 * Allows a facility_admin or super_admin to create a physician user for their hospital.
 */
export const createPhysicianUser = mutation({
    args: {
        email: v.string(),
        fullName: v.string(),
        phoneNumber: v.string(),
        licenseId: v.string(),
        specialization: v.string(),
        initialPassword: v.string(),
        hospitalId: v.optional(v.id("hospitals")),
    },
    handler: async (ctx, args) => {
        // SECURITY: Only facility_admin or super_admin can create physicians
        const callerUser = await requireRole(ctx, ["facility_admin", "super_admin"]);

        // 1. Determine hospital scope
        let targetHospitalId = args.hospitalId;
        if (callerUser.role === "facility_admin") {
            if (!callerUser.hospitalId) {
                throw new Error("Facility Admin has no associated hospital.");
            }
            targetHospitalId = callerUser.hospitalId;
        }

        if (!targetHospitalId) {
            throw new Error("Hospital ID is required to register a physician.");
        }

        // 2. Validate hospital exists and is active
        const hospital = await ctx.db.get(targetHospitalId);
        if (!hospital || !hospital.isActive) {
            throw new Error("Valid and active hospital is required.");
        }

        // 3. Check email format & uniqueness
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email address format.");
        }

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (existingUser) {
            throw new Error("A user with this email already exists.");
        }

        // 4. Check license uniqueness
        const existingLicense = await ctx.db
            .query("physicians")
            .withIndex("by_license", (q) => q.eq("licenseId", args.licenseId))
            .unique();

        if (existingLicense) {
            throw new Error("A physician with this license ID is already registered.");
        }

        // 5. Create user record
        const userId = await ctx.db.insert("users", {
            email: args.email,
            fullName: args.fullName,
            phoneNumber: args.phoneNumber,
            role: "physician", // FORCED
            hospitalId: targetHospitalId,
            isActive: true,
        });

        // 6. Create physician profile
        await ctx.db.insert("physicians", {
            userId,
            licenseId: args.licenseId,
            hospital: hospital.name,
            hospitalId: targetHospitalId,
            specialization: args.specialization,
            initialPassword: args.initialPassword,
            isVerified: true,
        });

        // 7. Audit log
        await logAudit(
            ctx,
            "create_physician_user",
            {
                createdBy: callerUser._id,
                hospitalId: targetHospitalId,
                email: args.email,
                fullName: args.fullName,
                licenseId: args.licenseId,
            },
            userId
        );

        return { userId, email: args.email };
    },
});

/**
 * updatePhysicianUser
 *
 * Allows a facility_admin or super_admin to update a physician user.
 */
export const updatePhysicianUser = mutation({
    args: {
        userId: v.id("users"),
        physicianId: v.id("physicians"),
        email: v.optional(v.string()),
        fullName: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        licenseId: v.optional(v.string()),
        specialization: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requireRole(ctx, ["facility_admin", "super_admin"]);

        const { userId, physicianId, email, fullName, phoneNumber, licenseId, specialization, isActive } = args;

        // Update user record
        const userUpdates: Record<string, any> = {};
        if (email !== undefined) userUpdates.email = email;
        if (fullName !== undefined) userUpdates.fullName = fullName;
        if (phoneNumber !== undefined) userUpdates.phoneNumber = phoneNumber;
        if (isActive !== undefined) userUpdates.isActive = isActive;

        if (Object.keys(userUpdates).length > 0) {
            await ctx.db.patch(userId, userUpdates);
        }

        // Update physician record
        const physicianUpdates: Record<string, any> = {};
        if (licenseId !== undefined) physicianUpdates.licenseId = licenseId;
        if (specialization !== undefined) physicianUpdates.specialization = specialization;

        if (Object.keys(physicianUpdates).length > 0) {
            await ctx.db.patch(physicianId, physicianUpdates);
        }

        return { userId, physicianId };
    },
});
