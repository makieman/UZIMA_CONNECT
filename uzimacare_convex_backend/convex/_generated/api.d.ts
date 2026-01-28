/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as clinics from "../clinics.js";
import type * as crons from "../crons.js";
import type * as darajaTest from "../darajaTest.js";
import type * as directStkTest from "../directStkTest.js";
import type * as http from "../http.js";
import type * as mpesa from "../mpesa.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as permissions from "../permissions.js";
import type * as phoneFormatTest from "../phoneFormatTest.js";
import type * as physicians from "../physicians.js";
import type * as referrals from "../referrals.js";
import type * as router from "../router.js";
import type * as seedData from "../seedData.js";
import type * as stats from "../stats.js";
import type * as stkTest from "../stkTest.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audit: typeof audit;
  auth: typeof auth;
  bookings: typeof bookings;
  clinics: typeof clinics;
  crons: typeof crons;
  darajaTest: typeof darajaTest;
  directStkTest: typeof directStkTest;
  http: typeof http;
  mpesa: typeof mpesa;
  notifications: typeof notifications;
  payments: typeof payments;
  permissions: typeof permissions;
  phoneFormatTest: typeof phoneFormatTest;
  physicians: typeof physicians;
  referrals: typeof referrals;
  router: typeof router;
  seedData: typeof seedData;
  stats: typeof stats;
  stkTest: typeof stkTest;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
