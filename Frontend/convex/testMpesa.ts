import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { sendToCloudLog } from "./logging";

// Simple test action to verify M-Pesa environment variables are loaded
export const testEnvVars = action({
    args: {},
    handler: async (ctx) => {
        console.log("Testing M-Pesa Environment Variables...");

        const result = {
            hasConsumerKey: !!process.env.DARAJA_CONSUMER_KEY,
            hasConsumerSecret: !!process.env.DARAJA_CONSUMER_SECRET,
            hasShortcode: !!process.env.DARAJA_SHORTCODE,
            hasPasskey: !!process.env.DARAJA_PASSKEY,
            hasCallbackUrl: !!process.env.DARAJA_CALLBACK_URL,

            // Show actual values (safe to show in dev)
            shortcode: process.env.DARAJA_SHORTCODE || "NOT SET",
            callbackUrl: process.env.DARAJA_CALLBACK_URL || "NOT SET",

            // Show partial values for security
            consumerKeyPreview: process.env.DARAJA_CONSUMER_KEY?.substring(0, 10) + "..." || "NOT SET",
            passkeyPreview: process.env.DARAJA_PASSKEY?.substring(0, 10) + "..." || "NOT SET",

            // Africa's Talking
            hasAtUsername: !!process.env.AT_USERNAME,
            hasAtApiKey: !!process.env.AT_API_KEY,
            atUsername: process.env.AT_USERNAME || "NOT SET",
            atApiKeyPreview: process.env.AT_API_KEY?.substring(0, 5) + "..." || "NOT SET",
        };

        console.log("Environment Variables Status:", result);

        return result;
    }
});

// Test action to verify Google Cloud Logging integration
export const testCloudLogging = action({
    args: {
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        console.log("Testing Google Cloud Logging...");

        await sendToCloudLog(ctx, "CLOUD_LOGGING_TEST", {
            message: args.message ?? "This is a test log from Convex",
            timestamp: new Date().toISOString()
        }, "INFO");

        return { success: true, message: "Test log sent to forwarder" };
    }
});

// Test Africa's Talking SMS sending (useful to verify credentials/delivery independently of M-Pesa callbacks)
// Test Africa's Talking SMS sending (useful to verify credentials/delivery independently of M-Pesa callbacks)
export const testSms = action({
    args: {
        phoneNumber: v.optional(v.string()),
        name: v.optional(v.string()),
        amount: v.optional(v.number()),
        token: v.optional(v.string()),
        date: v.optional(v.string()),
        time: v.optional(v.string()),
        clinic: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<any> => {
        console.log("Testing SMS Sending...");

        // Using a local variable for api to help with type inference in circular calls
        const anyApi: any = api;
        const result: any = await ctx.runAction(anyApi.actions.notifications.sendPaymentConfirmationSMS, {
            phoneNumber: args.phoneNumber ?? "+254711123456",
            name: args.name ?? "Test User",
            amount: args.amount ?? 1,
            token: args.token ?? "TEST-TOKEN-123",
            date: args.date ?? "2026-02-16",
            time: args.time ?? "14:00",
            clinic: args.clinic ?? "Afiya Connect Central",
        });

        console.log("SMS Test Result:", result);
        return result;
    },
});

