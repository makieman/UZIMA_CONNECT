import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
  callbacks: {
    createOrUpdateUser: async (ctx, args) => {
      // If this is an update for an existing user, just return their ID
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const email = args.profile.email as string | undefined;

      if (email) {
        // Use filter — the auth callback ctx doesn't expose table-level index types
        const existingUser = await ctx.db
          .query("users")
          .filter(q => q.eq(q.field("email"), email))
          .first();

        if (existingUser) {
          return existingUser._id; // Link the auth credential to the existing seeded user
        }
      }

      // Fallback for brand new non-seeded users
      return await ctx.db.insert("users", {
        fullName: (args.profile.name as string) || (email ? email.split("@")[0] : "New User"),
        email: email,
        role: "patient",
        isActive: true,
      });
    },
  },
});

export const loggedInUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
