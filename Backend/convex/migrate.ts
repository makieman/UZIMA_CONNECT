import { mutation } from "./_generated/server";

export const migrateAdmins = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Fetch all users
        const allUsers = await ctx.db.query("users").collect();

        // 2. Filter locally for any user that still has the "admin" role
        const legacyAdmins = allUsers.filter(u => u.role === ("admin" as any));

        console.log(`Found ${legacyAdmins.length} legacy admin users to migrate.`);

        // 3. Migrate them to "super_admin"
        let migratedCount = 0;
        for (const user of legacyAdmins) {
            await ctx.db.patch(user._id, {
                role: "super_admin"
            });
            migratedCount++;
        }

        return `Successfully migrated ${migratedCount} legacy admin users to super_admin.`;
    }
});
