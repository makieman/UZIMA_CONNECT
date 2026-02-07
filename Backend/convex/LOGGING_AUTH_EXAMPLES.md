/**
 * Example: Structured Logging Integration for Authentication
 * 
 * This file demonstrates how to integrate structured logging into authentication flows.
 * Copy these patterns into your actual auth.ts file in the convex directory.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Import logging utilities (create a wrapper that works with Convex)
// const { logAuthEvent, logError } = require('../backend/src/utils/structuredLogging');

// ============================================================================
// EXAMPLE 1: Log User Login
// ============================================================================
// Add to your signIn mutation:

export const exampleSignIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    
    try {
      // Call your actual sign in logic here
      // const result = await signIn(ctx, args);
      
      // Log successful login
      const duration = Date.now() - startTime;
      console.log(JSON.stringify({
        message: 'AUTH_LOGIN_SUCCESS',
        event: 'LOGIN',
        email: args.email,
        duration: duration,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        labels: {
          event_type: 'AUTHENTICATION',
          action: 'LOGIN'
        }
      }));
      
      // return result;
    } catch (error) {
      // Log failed login
      console.log(JSON.stringify({
        message: 'AUTH_LOGIN_FAILED',
        event: 'LOGIN_FAILED',
        email: args.email,
        error: error.message,
        timestamp: new Date().toISOString(),
        severity: 'WARNING',
        labels: {
          event_type: 'AUTHENTICATION',
          action: 'LOGIN_FAILED'
        }
      }));
      throw error;
    }
  },
});

// ============================================================================
// EXAMPLE 2: Log User Logout
// ============================================================================
// Add to your signOut mutation:

export const exampleSignOut = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    try {
      // Call your actual sign out logic here
      // await signOut(ctx);
      
      console.log(JSON.stringify({
        message: 'AUTH_LOGOUT_SUCCESS',
        event: 'LOGOUT',
        userId: userId,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        labels: {
          event_type: 'AUTHENTICATION',
          action: 'LOGOUT'
        }
      }));
    } catch (error) {
      console.log(JSON.stringify({
        message: 'AUTH_LOGOUT_FAILED',
        event: 'LOGOUT_FAILED',
        userId: userId,
        error: error.message,
        timestamp: new Date().toISOString(),
        severity: 'ERROR',
        labels: {
          event_type: 'AUTHENTICATION',
          action: 'LOGOUT_FAILED'
        }
      }));
      throw error;
    }
  },
});

// ============================================================================
// EXAMPLE 3: Log User Registration
// ============================================================================

export const exampleSignUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Call your actual sign up logic here
      // const result = await signUp(ctx, args);
      
      console.log(JSON.stringify({
        message: 'AUTH_SIGNUP_SUCCESS',
        event: 'SIGNUP',
        email: args.email,
        fullName: args.fullName,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        labels: {
          event_type: 'AUTHENTICATION',
          action: 'SIGNUP'
        }
      }));
      
      // return result;
    } catch (error) {
      console.log(JSON.stringify({
        message: 'AUTH_SIGNUP_FAILED',
        event: 'SIGNUP_FAILED',
        email: args.email,
        error: error.message,
        timestamp: new Date().toISOString(),
        severity: 'ERROR',
        labels: {
          event_type: 'AUTHENTICATION',
          action: 'SIGNUP_FAILED'
        }
      }));
      throw error;
    }
  },
});

// ============================================================================
// EXAMPLE 4: Log Permission Changes
// ============================================================================

export const examplePermissionChange = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(), // 'GRANT' or 'REVOKE'
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    
    try {
      // Call your actual permission logic here
      
      console.log(JSON.stringify({
        message: `AUTH_PERMISSION_${args.action}`,
        event: `PERMISSION_${args.action}`,
        userId: args.userId,
        role: args.role,
        adminId: adminId,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        labels: {
          event_type: 'AUTHENTICATION',
          action: `PERMISSION_${args.action}`
        }
      }));
    } catch (error) {
      console.log(JSON.stringify({
        message: `AUTH_PERMISSION_${args.action}_FAILED`,
        event: `PERMISSION_${args.action}_FAILED`,
        userId: args.userId,
        role: args.role,
        adminId: adminId,
        error: error.message,
        timestamp: new Date().toISOString(),
        severity: 'ERROR',
        labels: {
          event_type: 'AUTHENTICATION',
          action: `PERMISSION_${args.action}_FAILED`
        }
      }));
      throw error;
    }
  },
});
