import { action } from "./_generated/server";

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

export const testSms = action({
    args: {},
    handler: async (ctx) => {
        console.log("Testing SMS Sending...");

        const { api } = await import("./_generated/api");

        try {
            const result = await ctx.runAction((api as any).actions.notifications.sendPaymentConfirmationSMS, {
                phoneNumber: "+254711123456", // Test number
                name: "Test User",
                amount: 100,
                token: "TEST-TOKEN-123"
            });

            console.log("SMS Test Result:", result);
            return result;
        } catch (error) {
            console.error("SMS Test Failed:", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
});
