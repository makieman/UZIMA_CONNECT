import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const wipeAuthForEmail = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();

        // 1. Find the user record
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        const results: any = {
            email,
            userId: user?._id,
            accountsDeleted: 0,
            sessionsDeleted: 0,
            verificationsDeleted: 0,
            errors: []
        };

        // 2. Wipe accounts by providerAccountId (the email)
        const accountsByEmail = await ctx.db
            .query("authAccounts" as any)
            .withIndex("by_provider_account_id" as any, (q) => q.eq("providerAccountId", email))
            .collect();

        for (const acc of accountsByEmail) {
            await ctx.db.delete(acc._id);
            results.accountsDeleted++;
        }

        // 3. Wipe accounts by userId
        if (user) {
            const accountsByUser = await ctx.db
                .query("authAccounts" as any)
                .withIndex("by_user_id" as any, (q) => q.eq("userId", user._id))
                .collect();

            for (const acc of accountsByUser) {
                // Avoid double counting
                if (!accountsByEmail.some(a => a._id === acc._id)) {
                    await ctx.db.delete(acc._id);
                    results.accountsDeleted++;
                }
            }
        }

        // 4. Wipe sessions by userId
        if (user) {
            const sessions = await ctx.db
                .query("authSessions" as any)
                .withIndex("by_user_id" as any, (q) => q.eq("userId", user._id))
                .collect();

            for (const session of sessions) {
                await ctx.db.delete(session._id);
                results.sessionsDeleted++;
            }
        }

        // 5. Wipe verifications by identifier (email)
        const verifications = await ctx.db
            .query("authVerifications" as any)
            .withIndex("by_identifier" as any, (q) => q.eq("identifier", email))
            .collect();

        for (const ver of verifications) {
            await ctx.db.delete(ver._id);
            results.verificationsDeleted++;
        }

        return results;
    },
});
