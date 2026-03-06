import { query } from "./_generated/server";
import { v } from "convex/values";

export const getRawAccountData = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const allAccounts = await ctx.db.query("authAccounts" as any).collect();
        const account = allAccounts.find((a: any) => a.providerAccountId === args.email);

        return {
            account: account ? {
                ...account,
                // Redact things that might be sensitive but check for existence
                hasSecret: !!account.secret,
                hasPassword: !!account.password,
            } : null
        };
    },
});
