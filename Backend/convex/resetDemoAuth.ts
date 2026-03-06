import { mutation, query } from "./_generated/server";

// Diagnostic: list ALL users with demo emails and their roles
export const diagnoseDemoUsers = query({
    args: {},
    handler: async (ctx) => {
        const demoEmails = [
            "admin@uzimacare.ke",
            "dr.kipchoge@hospital.ke",
            "dr.omondi@hospital.ke",
            "facility.admin@hospital.ke",
            "admin.mtrh@hospital.ke"
        ];
        const results: any[] = [];
        for (const email of demoEmails) {
            const users = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", email)).collect();
            results.push({ email, count: users.length, users: users.map(u => ({ _id: u._id, role: u.role, fullName: u.fullName })) });
        }
        // Also count total users
        const total = await ctx.db.query("users").collect();
        return { demoUsers: results, totalUsers: total.length };
    }
});

// Repair: delete duplicate patient users, restore correct roles, wipe auth, ready for fresh signUp
export const repairAndReset = mutation({
    args: {},
    handler: async (ctx) => {
        const expectedUsers: Record<string, string> = {
            "admin@uzimacare.ke": "super_admin",
            "facility.admin@hospital.ke": "facility_admin",
            "admin.mtrh@hospital.ke": "facility_admin",
            "dr.kipchoge@hospital.ke": "physician",
            "dr.omondi@hospital.ke": "physician",
        };

        let fixed = 0;
        let deletedDuplicates = 0;
        let deletedAccounts = 0;
        let deletedSessions = 0;
        const log: string[] = [];

        for (const [email, expectedRole] of Object.entries(expectedUsers)) {
            const allUsersWithEmail = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", email)).collect();
            
            if (allUsersWithEmail.length === 0) {
                log.push(`${email}: NOT FOUND — skipped (re-run seedData if needed)`);
                continue;
            }

            // Find the "correct" user: prefer the one with the expected role, else the first one
            let keeper = allUsersWithEmail.find(u => u.role === expectedRole) || allUsersWithEmail[0];

            // If keeper has wrong role, fix it
            if (keeper.role !== expectedRole) {
                await ctx.db.patch(keeper._id, { role: expectedRole as any });
                log.push(`${email}: FIXED role ${keeper.role} → ${expectedRole}`);
                fixed++;
            } else {
                log.push(`${email}: OK (role=${keeper.role})`);
            }

            // Delete duplicates (other users with same email)
            for (const dup of allUsersWithEmail) {
                if (dup._id !== keeper._id) {
                    // Delete any auth accounts/sessions linked to the duplicate
                    const dupAccounts = await ctx.db.query("authAccounts" as any).collect();
                    for (const a of dupAccounts) {
                        if (a.userId === dup._id) {
                            await ctx.db.delete(a._id);
                            deletedAccounts++;
                        }
                    }
                    const dupSessions = await ctx.db.query("authSessions" as any).collect();
                    for (const s of dupSessions) {
                        if (s.userId === dup._id) {
                            await ctx.db.delete(s._id);
                            deletedSessions++;
                        }
                    }
                    await ctx.db.delete(dup._id);
                    deletedDuplicates++;
                    log.push(`${email}: DELETED duplicate user ${dup._id} (role=${dup.role})`);
                }
            }

            // Delete auth accounts for the keeper so signUp works fresh
            const keeperAccounts = await ctx.db.query("authAccounts" as any).collect();
            for (const a of keeperAccounts) {
                if (a.userId === keeper._id) {
                    await ctx.db.delete(a._id);
                    deletedAccounts++;
                }
            }
            const keeperSessions = await ctx.db.query("authSessions" as any).collect();
            for (const s of keeperSessions) {
                if (s.userId === keeper._id) {
                    await ctx.db.delete(s._id);
                    deletedSessions++;
                }
            }
        }

        return {
            success: true,
            log,
            stats: { fixed, deletedDuplicates, deletedAccounts, deletedSessions }
        };
    }
});

export const resetAllDemoAccounts = mutation({
    args: {},
    handler: async (ctx) => {
        // Find all explicitly seeded demo users
        const demoEmails = [
            "admin@uzimacare.ke",
            "dr.kipchoge@hospital.ke",
            "dr.omondi@hospital.ke",
            "facility.admin@hospital.ke"
        ];

        let deletedAccounts = 0;
        let deletedSessions = 0;

        // 1. First, find all their user IDs
        const demoUsers = await Promise.all(
            demoEmails.map(email =>
                ctx.db.query("users")
                    .withIndex("by_email", q => q.eq("email", email))
                    .first()
            )
        );

        // Filter out any that weren't found
        const validDemoUsers = demoUsers.filter(u => u !== null && u !== undefined);
        const validUserIds = validDemoUsers.map(u => u._id);

        // 2. Find and delete all authentication accounts linked to them or their emails
        const allAccounts = await ctx.db.query("authAccounts" as any).collect();
        for (const account of allAccounts) {
            if (
                demoEmails.includes(account.providerAccountId) ||
                validUserIds.includes(account.userId)
            ) {
                await ctx.db.delete(account._id);
                deletedAccounts++;
            }
        }

        // 3. Find and delete any wandering sessions
        const allSessions = await ctx.db.query("authSessions" as any).collect();
        for (const session of allSessions) {
            if (validUserIds.includes(session.userId)) {
                await ctx.db.delete(session._id);
                deletedSessions++;
            }
        }

        return {
            success: true,
            message: `Wiped auth credentials for all demo accounts. You can now use the 'Demo' buttons safely.`,
            stats: {
                usersProcessed: validUserIds.length,
                deletedAccounts,
                deletedSessions
            }
        };
    }
});
