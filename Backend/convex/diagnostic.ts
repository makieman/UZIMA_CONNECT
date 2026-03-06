import { query } from "./_generated/server";

export const checkAdminRole = query({
    args: {},
    handler: async (ctx) => {
        const admin = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("email"), "admin@uzimacare.ke"))
            .first();

        return admin ? { email: admin.email, role: admin.role, id: admin._id } : "Not found";
    }
});
