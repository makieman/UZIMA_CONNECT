import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearAuthCredentials = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        const results: any = {
            email: args.email,
            userFound: !!user,
            userId: user?._id,
            deletedAccounts: 0,
            deletedSessions: 0,
            deletedVerifications: 0,
            orphanedAccountsFound: []
        };

        // 1. Find all accounts matching this email as providerAccountId (the identifier)
        const allAccounts = await ctx.db.query("authAccounts" as any).collect();
        const accountsToClear = allAccounts.filter((a: any) =>
            (user && a.userId === user._id) || a.providerAccountId === args.email
        );

        for (const account of accountsToClear) {
            await ctx.db.delete(account._id);
            results.deletedAccounts++;
        }

        // 2. Clear sessions for this user
        if (user) {
            const sessions = await ctx.db
                .query("authSessions" as any)
                .filter((q) => q.eq(q.field("userId"), user._id))
                .collect();
            for (const session of sessions) {
                await ctx.db.delete(session._id);
                results.deletedSessions++;
            }
        }

        // 3. Clear verifications for this email
        const verifications = await ctx.db.query("authVerifications" as any).collect();
        const emailVerifications = verifications.filter((v: any) => v.identifier === args.email);
        for (const vDoc of emailVerifications) {
            await ctx.db.delete(vDoc._id);
            results.deletedVerifications++;
        }

        return results;
    },
});
