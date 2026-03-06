# Authentication Debugging Postmortem

**Project:** Afiya Connect (UzimaCare)
**Date:** March 2026
**Stack:** Next.js 16 (Turbopack) + Convex (serverless) + @convex-dev/auth

---

## 1. Original Error

### Symptom
Clicking "Demo Super Admin" on the login page (`/login`) caused an infinite redirect loop between `/login` and `/admin/dashboard`, eventually settling on a permanent "Authenticating Environment..." spinner.

### Files & Functions Involved

| Layer | File | Function / Component |
|-------|------|---------------------|
| **Frontend — Login** | `Frontend/app/login/page.tsx` | `LoginPage`, `handleDemoLogin()`, `waitForUserAndRedirect()` |
| **Frontend — Dashboard Guard** | `Frontend/app/admin/dashboard/page.tsx` | `AdminDashboardPage` (auth useEffect guard) |
| **Frontend — Auth Components** | `Frontend/components/auth/admin-login.tsx` | `AdminLogin` |
| **Frontend — Storage** | `Frontend/lib/storage.ts` | `getAuthState()`, `setAuthState()`, `clearAuthState()` |
| **Backend — Auth Config** | `Backend/convex/auth.ts` | `createOrUpdateUser` callback, `loggedInUser` query |
| **Backend — Permissions** | `Backend/convex/permissions.ts` | `requireFacilityScope()` |
| **Backend — Stats** | `Backend/convex/stats.ts` | `getAdminStats` query |
| **Backend — Seed Data** | `Backend/convex/seedData.ts` | `seedInitialData` mutation |
| **Backend — Auth Reset** | `Backend/convex/resetDemoAuth.ts` | `resetAllDemoAccounts`, `repairAndReset`, `diagnoseDemoUsers` |

### Observable Symptoms (in order of appearance)

1. **Redirect loop** — Login → Dashboard → Login → Dashboard (repeating)
2. **Spinner stuck** — "Authenticating Environment..." displayed permanently after UI fixes
3. **Wrong role assigned** — User authenticated but received `role: "patient"` instead of `role: "super_admin"`
4. **Dashboard crash** — `Facility Admin is not assigned to any hospital` thrown by `getAdminStats`

---

## 2. Root Cause Analysis

The failure was caused by **three cascading problems** across different system layers:

### Problem A: Database State Corruption (Root Cause)

Previous debugging sessions used emergency wipe mutations (`emergencyWipe.ts`, `emergencyWipe2.ts`) that **deleted the original seeded user records** from the `users` table — including the super_admin user `admin@uzimacare.ke`.

When `signUp` was subsequently called, the `createOrUpdateUser` callback in `auth.ts` ran:

```typescript
// This query found NOTHING because the seeded user was deleted
const existingUser = await ctx.db
  .query("users")
  .filter(q => q.eq(q.field("email"), email))
  .first();
```

With no match, it fell through to the fallback that created a **brand new user** with:
- `role: "patient"` (hardcoded default)
- `fullName: "admin"` (from `email.split("@")[0]`)

**Evidence from diagnostics:**
```
admin@uzimacare.ke → { fullName: 'admin', role: 'patient' }   // WRONG
                      Expected: { fullName: 'Admin User', role: 'super_admin' }
```

### Problem B: Frontend Redirect Loop

The dashboard auth guard used `useConvexAuth()` which has an inherent race condition:

1. Login page authenticates → calls `router.replace("/admin/dashboard")`
2. Dashboard page loads → `useConvexAuth()` initially returns `{ isLoading: true, isAuthenticated: false }`
3. Guard sees `!isAuthenticated` → calls `router.replace("/login")`
4. JWT propagates 200ms later but the redirect already fired → loop

This was fixed by replacing `useConvexAuth()` with a **timer-based guard** that waits 3 seconds before redirecting, giving the JWT time to propagate.

### Problem C: `signIn()` Silent Failure

`@convex-dev/auth`'s `signIn("password", { flow: "signIn" })` does **NOT throw JavaScript exceptions** when authentication fails (e.g., `InvalidAccountId`). It resolves the Promise normally and only logs an error to the browser console.

This meant the code pattern:
```typescript
try {
  await signIn("password", { email, password, flow: "signIn" });
  authenticated = true; // This runs even when auth FAILED
} catch (e) {
  // Never reached
}
```
...always set `authenticated = true`, masking the actual failure.

### Problem D: Missing Role Fallback in Redirect

The `waitForUserAndRedirect()` function only had handlers for `super_admin`, `facility_admin`, and `physician`. When the user came back as `patient` (due to Problem A), no redirect fired, and `setIsLoading(false)` was never called — causing the spinner to hang forever.

### System Architecture Failure Map

```
┌─ Frontend ─────────────────────────────────────────────────┐
│  Problem B: useConvexAuth() race condition → redirect loop │
│  Problem C: signIn() doesn't throw on failure              │
│  Problem D: No fallback for unexpected roles               │
└────────────────────────────────────────────────────────────┘
         ▼ signUp → createOrUpdateUser callback
┌─ Backend ──────────────────────────────────────────────────┐
│  Problem A: Seeded user deleted → callback creates new     │
│             patient user instead of linking to super_admin  │
└────────────────────────────────────────────────────────────┘
         ▼ reads from
┌─ Database ─────────────────────────────────────────────────┐
│  admin@uzimacare.ke: role=patient (should be super_admin)  │
│  Original seeded record: DELETED by emergency wipe         │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Why the Debugging Agent Got Stuck

### Repeated Steps That Didn't Help

1. **Rewriting the login page UI multiple times** — The spinner, loading states, and redirect logic were refactored 6+ times. Each fix addressed a visible symptom but not the underlying data problem.

2. **Toggling between `signIn` and `signUp`** — The auth flow was switched from signIn-first to signUp-first and back. This changed *which* code path ran but didn't fix the fact that the database user had the wrong role.

3. **Clearing `.next` cache and restarting servers** — The cache was cleared 3+ times. This was never the issue — the compiled code matched the source code.

4. **Replacing `useConvexAuth` with localStorage guards** — This fixed the redirect loop (Problem B) but obscured that Problem A was the real blocker.

### Why Those Steps Failed

All debugging was focused on **frontend behavior** (redirect logic, loading states, auth hooks) rather than **backend data integrity**. The assumption was that the auth *process* was broken, when in reality the auth process worked fine — it just created/returned a user with the wrong role.

### Signals That Should Have Indicated the Root Cause Earlier

| Signal | When Available | What It Meant |
|--------|---------------|---------------|
| No visible error from `signIn()` | From the start | `@convex-dev/auth` doesn't throw on auth failure — need to check the *result*, not the error |
| Redirect worked but dashboard crashed | After fixing redirect loop | The user *was* authenticated — the problem was the user's data, not the auth flow |
| `fullName: 'admin'` in console | After adding logging | This comes from `email.split("@")[0]` — the fallback path in `createOrUpdateUser`. The seeded user has `fullName: 'Admin User'` |
| `role: 'patient'` in console | After adding logging | **Definitive signal.** The `createOrUpdateUser` fallback assigns `role: "patient"`. This only runs when the email lookup fails to find a seeded user |

**Key insight:** The `fullName` mismatch (`'admin'` vs `'Admin User'`) was the clearest indicator that the seeded user record was missing and the fallback was creating a new one.

---

## 4. How the Error Was Fixed

### Fix 1: Database Repair (`resetDemoAuth.ts`)

Created `repairAndReset` mutation that:
- Queries all demo user emails
- Patches users with wrong roles to their expected roles
- Deletes duplicate user records
- Wipes all auth accounts/sessions for clean re-authentication

```bash
npx convex run resetDemoAuth:repairAndReset
```

Result:
```
admin@uzimacare.ke: FIXED role patient → super_admin
facility.admin@hospital.ke: FIXED role patient → facility_admin
```

### Fix 2: Auth Callback Hardening (`auth.ts`)

Added `existingUserId` early-return to prevent the callback from creating duplicates on re-authentication:

```typescript
createOrUpdateUser: async (ctx, args) => {
  // If this is an update for an existing user, just return their ID
  if (args.existingUserId) {
    return args.existingUserId;
  }
  // ... email lookup and fallback ...
}
```

### Fix 3: Role Fallback in Frontend (`login/page.tsx`)

Added handling for unexpected roles so the spinner never hangs:

```typescript
} else {
  console.warn(`[AUTH] Unexpected role "${user.role}" — no dashboard available`);
  setIsLoading(false);
  alert(`Logged in as "${user.role}" but no dashboard exists for this role.`);
}
```

### Fix 4: Diagnostic Tooling (`resetDemoAuth.ts`)

Created `diagnoseDemoUsers` query for instant database inspection:

```bash
npx convex run resetDemoAuth:diagnoseDemoUsers
```

### Files Modified

| File | Change |
|------|--------|
| `Backend/convex/auth.ts` | Added `existingUserId` guard in `createOrUpdateUser` |
| `Backend/convex/resetDemoAuth.ts` | Added `repairAndReset` mutation and `diagnoseDemoUsers` query |
| `Backend/convex/stats.ts` | Fixed `let` declarations to `let x: any[] = []` (TypeScript) |
| `Backend/convex/permissions.ts` | No changes — already correct |
| `Frontend/app/login/page.tsx` | Added signUp-first flow, polling, role fallback, debug logging |
| `Frontend/app/admin/dashboard/page.tsx` | Replaced `useConvexAuth` with timer-based guard |
| `Frontend/app/physician/dashboard/page.tsx` | Same timer-based guard pattern |
| `Frontend/components/auth/admin-login.tsx` | Reversed to signUp-first flow |
| `Frontend/components/auth/physician-login.tsx` | Reversed to signUp-first flow |

---

## 5. Troubleshooting Guide

### How to Identify This Type of Error

**Symptom pattern:** Login appears to succeed (no error thrown) but the user lands on the wrong page, sees a permission error, or gets stuck in a loading state.

**What it usually means:** The auth *process* works, but the user record in the database has incorrect data (wrong role, missing hospital assignment, etc.).

### Diagnostic Order

```
1. DATABASE FIRST
   └─ npx convex run resetDemoAuth:diagnoseDemoUsers
      → Check: Do all users have the expected roles?
      → Check: Are there duplicate users with the same email?

2. BACKEND AUTH
   └─ Check Convex dashboard → authAccounts table
      → Does the account link to the correct userId?
      → Is the userId the seeded user or a fallback-created one?

3. FRONTEND CONSOLE
   └─ Add console.log after signIn/signUp resolution
      → Check: What does `loggedInUser` return?
      → Check: What role does the returned user have?
      → Compare: Does fullName match the seeded data?

4. FRONTEND ROUTING
   └─ Only investigate if steps 1-3 show correct data
      → Check: Does the route guard handle all possible roles?
      → Check: Is there a loading state that can hang forever?
```

### Key Indicators to Check First

| Check | Command / Location | What to Look For |
|-------|-------------------|-----------------|
| User roles | `npx convex run resetDemoAuth:diagnoseDemoUsers` | All roles match expected values |
| Auth accounts | Convex Dashboard → `authAccounts` table | Each account's `userId` points to the correct user |
| Duplicate users | Same diagnostic query | `count > 1` for any email |
| Frontend user data | Browser console after login | `fullName` and `role` match seed data |
| Active sessions | Convex Dashboard → `authSessions` table | Sessions exist and link to correct users |

### Quick Fix Commands

```bash
# Diagnose current state
npx convex run resetDemoAuth:diagnoseDemoUsers

# Repair roles and wipe auth for fresh login
npx convex run resetDemoAuth:repairAndReset

# Nuclear option: wipe all auth and let users re-register
npx convex run resetDemoAuth:resetAllDemoAccounts
```

---

## 6. How the User Can Help Resolve Issues Faster

### Information to Provide Immediately

1. **Browser console output** — Open DevTools (F12) → Console tab → reproduce the error → screenshot everything
2. **The exact URL** — What page are you on? What page were you trying to reach?
3. **Which button/action** triggered the error
4. **Whether it's a fresh browser** or has previous login state (incognito vs normal)

### Most Useful Screenshots

| Priority | What to Screenshot | Why |
|----------|-------------------|-----|
| 1 | **Console tab** with all messages visible | Shows auth flow logs, errors, and user data |
| 2 | **Network tab** filtered to "convex" | Shows which queries/mutations are firing |
| 3 | **Application tab → Local Storage** | Shows cached auth state that may cause redirect loops |
| 4 | **The visible error message** or stuck UI state | Confirms the symptom |

### Diagnostic Commands the User Can Run

```bash
# Check the database state (run from Backend/ directory)
npx convex run resetDemoAuth:diagnoseDemoUsers

# If roles are wrong, repair them
npx convex run resetDemoAuth:repairAndReset

# If nothing else works, clear browser data:
# → Open DevTools → Application → Local Storage → Clear All
# → Then try in an incognito window
```

---

## 7. Final Summary

### Problem
Logging in as super admin caused an infinite redirect loop, then a permanent loading spinner, and finally a "Facility Admin is not assigned to any hospital" crash on the dashboard.

### Root Cause
Previous emergency wipe operations **deleted the original seeded super_admin user** from the database. When `signUp` ran, the `createOrUpdateUser` callback couldn't find the seeded user by email, so it created a **new user with `role: "patient"`**. The frontend had no handling for the `patient` role, causing the spinner to hang. When the dashboard did load, the `requireFacilityScope()` function threw because a patient has no hospital assignment.

### Fix
1. **Created `repairAndReset` mutation** that patches user roles back to their expected values and wipes auth credentials for clean re-authentication
2. **Added `existingUserId` check** in `createOrUpdateUser` to prevent duplicate user creation on re-auth
3. **Added role fallback** in the frontend redirect logic so unexpected roles show an error message instead of hanging
4. **Created `diagnoseDemoUsers` diagnostic query** for instant database state inspection

### Prevention Strategy

1. **Never delete user records directly** — Emergency wipe operations should only delete `authAccounts` and `authSessions`, never `users` table records. The `users` table is the source of truth for roles and permissions.

2. **Always run `diagnoseDemoUsers` after any data operation** — This takes 2 seconds and immediately shows if roles are correct.

3. **Debug database first, frontend last** — Auth issues that manifest as frontend problems (spinners, redirects) are almost always caused by incorrect backend data. Check the data before rewriting UI code.

4. **Add the `console.log("[AUTH]")` pattern early** — The single most useful diagnostic was the login page log that showed `role: 'patient'` and `fullName: 'admin'`. This should have been added in the first debugging attempt, not the sixth.

5. **Handle all roles in frontend redirects** — Every role-based redirect should have an `else` clause that shows an error rather than silently hanging.

6. **Test in incognito** — localStorage from previous sessions can cause redirect loops. Always test auth changes in a clean browser context.
