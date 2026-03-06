import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDeepAuthStatus = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const users = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .collect();

        const allAccounts = await ctx.db.query("authAccounts" as any).collect();
        const accountsMatchingEmail = allAccounts.filter((a: any) => a.providerAccountId === args.email);

        const accountDetails = accountsMatchingEmail.map((a: any) => ({
            id: a._id,
            userId: a.userId,
            provider: a.providerId,
            creationTime: a._creationTime
        }));

        const userDetails = users.map((u: any) => ({
            id: u._id,
            email: u.email,
            role: u.role,
            creationTime: u._creationTime
        }));

        return {
            usersWithEmail: userDetails,
            accountsWithEmail: accountDetails,
            potentialMismatch: users.length > 0 && accountDetails.length > 0 && !users.some(u => accountDetails.some(a => a.userId === u._id))
        };
    },
});
