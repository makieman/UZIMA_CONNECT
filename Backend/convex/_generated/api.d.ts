/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_emails from "../actions/emails.js";
import type * as actions_mpesa from "../actions/mpesa.js";
import type * as actions_notifications from "../actions/notifications.js";
import type * as adminOnboarding from "../adminOnboarding.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as brutalReset from "../brutalReset.js";
import type * as clinics from "../clinics.js";
import type * as crons from "../crons.js";
import type * as darajaTest from "../darajaTest.js";
import type * as debug from "../debug.js";
import type * as debugAuth from "../debugAuth.js";
import type * as debugStk from "../debugStk.js";
import type * as debugStkError from "../debugStkError.js";
import type * as diagnostic from "../diagnostic.js";
import type * as directStkTest from "../directStkTest.js";
import type * as dumpAllAuth from "../dumpAllAuth.js";
import type * as emergencyAuth from "../emergencyAuth.js";
import type * as emergencyWipe from "../emergencyWipe.js";
import type * as emergencyWipe2 from "../emergencyWipe2.js";
import type * as exactAuth from "../exactAuth.js";
import type * as files from "../files.js";
import type * as gemini from "../gemini.js";
import type * as hospitals from "../hospitals.js";
import type * as http from "../http.js";
import type * as inspectAuth from "../inspectAuth.js";
import type * as logging from "../logging.js";
import type * as migrate from "../migrate.js";
import type * as mpesa from "../mpesa.js";
import type * as mpesaApi from "../mpesaApi.js";
import type * as mpesaCallbacks from "../mpesaCallbacks.js";
import type * as mutations_mpesa from "../mutations/mpesa.js";
import type * as mutations_payments from "../mutations/payments.js";
import type * as notifications from "../notifications.js";
import type * as openai from "../openai.js";
import type * as paymentTracking from "../paymentTracking.js";
import type * as payments from "../payments.js";
import type * as permissions from "../permissions.js";
import type * as phoneFormatTest from "../phoneFormatTest.js";
import type * as physicians from "../physicians.js";
import type * as referralPayments from "../referralPayments.js";
import type * as referrals from "../referrals.js";
import type * as resetDemoAuth from "../resetDemoAuth.js";
import type * as router from "../router.js";
import type * as seedData from "../seedData.js";
import type * as simpleTest from "../simpleTest.js";
import type * as stats from "../stats.js";
import type * as stkDbOperations from "../stkDbOperations.js";
import type * as stkTest from "../stkTest.js";
import type * as testMpesa from "../testMpesa.js";
import type * as testMpesaAuth from "../testMpesaAuth.js";
import type * as users from "../users.js";
import type * as vision from "../vision.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/emails": typeof actions_emails;
  "actions/mpesa": typeof actions_mpesa;
  "actions/notifications": typeof actions_notifications;
  adminOnboarding: typeof adminOnboarding;
  audit: typeof audit;
  auth: typeof auth;
  bookings: typeof bookings;
  brutalReset: typeof brutalReset;
  clinics: typeof clinics;
  crons: typeof crons;
  darajaTest: typeof darajaTest;
  debug: typeof debug;
  debugAuth: typeof debugAuth;
  debugStk: typeof debugStk;
  debugStkError: typeof debugStkError;
  diagnostic: typeof diagnostic;
  directStkTest: typeof directStkTest;
  dumpAllAuth: typeof dumpAllAuth;
  emergencyAuth: typeof emergencyAuth;
  emergencyWipe: typeof emergencyWipe;
  emergencyWipe2: typeof emergencyWipe2;
  exactAuth: typeof exactAuth;
  files: typeof files;
  gemini: typeof gemini;
  hospitals: typeof hospitals;
  http: typeof http;
  inspectAuth: typeof inspectAuth;
  logging: typeof logging;
  migrate: typeof migrate;
  mpesa: typeof mpesa;
  mpesaApi: typeof mpesaApi;
  mpesaCallbacks: typeof mpesaCallbacks;
  "mutations/mpesa": typeof mutations_mpesa;
  "mutations/payments": typeof mutations_payments;
  notifications: typeof notifications;
  openai: typeof openai;
  paymentTracking: typeof paymentTracking;
  payments: typeof payments;
  permissions: typeof permissions;
  phoneFormatTest: typeof phoneFormatTest;
  physicians: typeof physicians;
  referralPayments: typeof referralPayments;
  referrals: typeof referrals;
  resetDemoAuth: typeof resetDemoAuth;
  router: typeof router;
  seedData: typeof seedData;
  simpleTest: typeof simpleTest;
  stats: typeof stats;
  stkDbOperations: typeof stkDbOperations;
  stkTest: typeof stkTest;
  testMpesa: typeof testMpesa;
  testMpesaAuth: typeof testMpesaAuth;
  users: typeof users;
  vision: typeof vision;
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
