import { action } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get Daraja OAuth token
async function getDarajaOAuthToken(
  consumerKey: string,
  consumerSecret: string,
  environment: "sandbox" | "production" = "sandbox"
): Promise<string> {
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const baseUrl = environment === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  const tokenResponse = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!tokenResponse.ok) {
    throw new Error(`OAuth token failed: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error("No access token in response");
  }

  return tokenData.access_token;
}

// Generate Kenya timestamp (UTC+3) - Correct format for M-Pesa
function generateKenyaTimestamp(): string {
  const now = new Date();
  // M-Pesa expects format: YYYYMMDDHHMMSS
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Main M-Pesa STK Push action that frontend expects
export const callMpesaStkPush = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    referralId: v.string(),
    patientName: v.string(),
    useTestCallback: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    console.log("=== M-PESA API STK PUSH CALLED ===");
    console.log("Args:", args);

    // Reduce amount to 1 as requested
    const paymentAmount = 1;

    try {
      // Step 1: Get environment variables
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      let callbackUrl = process.env.DARAJA_CALLBACK_URL;

      const environment = (process.env.DARAJA_ENVIRONMENT ||
        (shortcode === "174379" ? "sandbox" : "production")) as "sandbox" | "production";

      const mpesaBaseUrl = environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

      if (args.useTestCallback) {
        callbackUrl = "https://webhook.site/test-callback";
      }

      if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
        throw new Error("Missing required environment variables");
      }

      // Step 2: Get OAuth token
      console.log(`=== STEP 1: GETTING OAUTH TOKEN (${environment}) ===`);
      const accessToken = await getDarajaOAuthToken(consumerKey, consumerSecret, environment);
      console.log("OAuth token received successfully");

      // Step 3: Generate timestamp and password
      console.log("=== STEP 2: GENERATING PASSWORD ===");
      const timestamp = generateKenyaTimestamp();
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);

      // Step 4: Create STK payload
      console.log("=== STEP 3: SENDING STK PUSH ===");
      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: paymentAmount, // Using reduced amount
        PartyA: args.phoneNumber,
        PartyB: shortcode,
        PhoneNumber: args.phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: args.referralId,
        TransactionDesc: `Payment for ${args.patientName} - Referral ${args.referralId}`
      };

      // Step 5: Send STK push
      const stkResponse = await fetch(
        `${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(stkPayload)
        }
      );

      const stkData = await stkResponse.json();
      console.log("STK Response:", stkData);

      // Step 6: Analyze response
      const result = {
        success: stkResponse.ok && stkData.ResponseCode === "0",
        apiResponse: stkData,
        analysis: {
          responseCode: stkData.ResponseCode,
          responseDesc: stkData.ResponseDescription,
          checkoutRequestId: stkData.CheckoutRequestID,
          merchantRequestId: stkData.MerchantRequestID,
          customerMessage: stkData.CustomerMessage
        },
        requestDetails: {
          phoneNumber: args.phoneNumber,
          amount: paymentAmount, // Using reduced amount
          callbackUrl,
          timestamp,
          originalAmount: args.amount, // Include original amount for reference
        }
      };

      console.log("=== RESULT ===");
      console.log("Success:", result.success);
      console.log("Amount (reduced to):", paymentAmount);

      if (result.success) {
        console.log(" STK PUSH SENT SUCCESSFULLY!");
        console.log(" SMS should arrive at:", args.phoneNumber);
      }

      return result;

    } catch (error) {
      console.error("M-Pesa API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to initiate M-Pesa payment"
      };
    }
  },
});

// Test environment variables (for debugging)
export const testEnvVars = action({
  args: {},
  handler: async (ctx) => {
    console.log("=== TESTING ENV VARS ===");

    const envVars = {
      DARAJA_CONSUMER_KEY: !!process.env.DARAJA_CONSUMER_KEY,
      DARAJA_CONSUMER_SECRET: !!process.env.DARAJA_CONSUMER_SECRET,
      DARAJA_SHORTCODE: !!process.env.DARAJA_SHORTCODE,
      DARAJA_PASSKEY: !!process.env.DARAJA_PASSKEY,
      DARAJA_CALLBACK_URL: !!process.env.DARAJA_CALLBACK_URL,
    };

    console.log("Environment Variables Status:", envVars);

    return {
      success: true,
      envVars,
      message: "Environment variables checked"
    };
  },
});