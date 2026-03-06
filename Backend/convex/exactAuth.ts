import { query } from "./_generated/server";
import { v } from "convex/values";

export const getExactAuthData = query({
    args: {},
    handler: async (ctx) => {
        const allAccounts = await ctx.db.query("authAccounts" as any).collect();
        return allAccounts.map((a: any) => ({
            id: a._id,
            userId: a.userId,
            providerId: a.providerId,
            providerAccountId: a.providerAccountId,
            providerAccountIdLen: a.providerAccountId?.length,
            // Check for hidden characters or casing
            isMatch: a.providerAccountId?.toLowerCase().trim() === "admin@uzimacare.ke"
        }));
    },
});
