import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const brutalReset = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();

        // 1. Find User
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        const stats = { accounts: 0, sessions: 0, verifications: 0 };

        // 2. Brutal Account search (no index)
        const allAccounts = await ctx.db.query("authAccounts" as any).collect();
        for (const acc of allAccounts) {
            if (acc.providerAccountId === email || (user && acc.userId === user._id)) {
                await ctx.db.delete(acc._id);
                stats.accounts++;
            }
        }

        // 3. Brutal Session search
        const allSessions = await ctx.db.query("authSessions" as any).collect();
        for (const sess of allSessions) {
            if (user && sess.userId === user._id) {
                await ctx.db.delete(sess._id);
                stats.sessions++;
            }
        }

        // 4. Brutal Verification search
        const allVerifs = await ctx.db.query("authVerifications" as any).collect();
        for (const ver of allVerifs) {
            if (ver.identifier === email) {
                await ctx.db.delete(ver._id);
                stats.verifications++;
            }
        }

        return { success: true, stats, userId: user?._id };
    },
});
