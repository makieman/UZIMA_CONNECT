import { mutation } from "./_generated/server";

export const forceWipeAndCreate = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Delete ALL authAccounts (dangerous but it's local dev)
        const allAccounts = await ctx.db.query("authAccounts" as any).collect();
        for (const acc of allAccounts) {
            await ctx.db.delete(acc._id);
        }

        // 2. Delete ALL authSessions
        const allSessions = await ctx.db.query("authSessions" as any).collect();
        for (const sess of allSessions) {
            await ctx.db.delete(sess._id);
        }

        // 3. Delete or Update existing super admin to ensure it's a super_admin
        const existing = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", "admin@uzimacare.ke")).first();
        if (existing) {
            await ctx.db.patch(existing._id, { role: "super_admin" });
        } else {
            await ctx.db.insert("users", {
                email: "admin@uzimacare.ke",
                fullName: "Super Admin",
                role: "super_admin",
                isActive: true
            });
        }

        return "Wiped auth tracking and restored super admin role.";
    }
});
