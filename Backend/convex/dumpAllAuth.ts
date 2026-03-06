import { mutation } from "./_generated/server";

export const logAllAccounts = mutation({
    args: {},
    handler: async (ctx) => {
        const allAccounts = await ctx.db.query("authAccounts" as any).collect();
        console.log("ALL_AUTH_ACCOUNTS_DUMP_START");
        for (const account of allAccounts) {
            console.log(JSON.stringify(account));
        }
        console.log("ALL_AUTH_ACCOUNTS_DUMP_END");
        return { count: allAccounts.length };
    },
});
