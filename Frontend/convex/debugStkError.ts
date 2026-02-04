import { action } from "./_generated/server";
import { v } from "convex/values";

// Debug the STK push error step by step
export const debugStkPushError = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    referralId: v.string(),
    patientName: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("=== DEBUGGING STK PUSH ERROR ===");
    
    try {
      // Step 1: Get environment variables
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      const callbackUrl = process.env.DARAJA_CALLBACK_URL;
      
      console.log("Environment check:", {
        consumerKey: consumerKey?.substring(0, 10) + "...",
        consumerSecret: consumerSecret?.substring(0, 10) + "...",
        shortcode,
        passkey: passkey?.substring(0, 10) + "...",
        callbackUrl
      });
      
      // Step 2: Get OAuth token
      console.log("=== STEP 1: GETTING OAUTH TOKEN ===");
      const auth = btoa(`${consumerKey}:${consumerSecret}`);
      console.log("Auth header:", auth.substring(0, 20) + "...");
      
      const tokenResponse = await fetch(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          method: "GET",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Token response status:", tokenResponse.status);
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.log("Token error response:", errorText);
        return {
          success: false,
          error: `OAuth token failed: ${tokenResponse.status}`,
          errorDetails: errorText
        };
      }

      const tokenData = await tokenResponse.json();
      console.log("Token data:", tokenData);
      
      if (!tokenData.access_token) {
        return {
          success: false,
          error: "No access token in response",
          tokenData
        };
      }

      const accessToken = tokenData.access_token;
      console.log("✅ OAuth token received successfully");

      // Step 3: Generate timestamp and password
      console.log("=== STEP 2: GENERATING PASSWORD ===");
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, -5);
      console.log("Timestamp:", timestamp);
      
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      console.log("Password string:", passwordString);
      const password = btoa(passwordString);
      console.log("Base64 password:", password);

      // Step 4: Create STK payload
      console.log("=== STEP 3: CREATING STK PAYLOAD ===");
      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: args.amount,
        PartyA: args.phoneNumber,
        PartyB: shortcode,
        PhoneNumber: args.phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: args.referralId,
        TransactionDesc: `Payment for ${args.patientName} - Referral ${args.referralId}`
      };

      console.log("STK Payload:", JSON.stringify(stkPayload, null, 2));

      // Step 5: Send STK push
      console.log("=== STEP 4: SENDING STK PUSH ===");
      const stkResponse = await fetch(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(stkPayload)
        }
      );

      console.log("STK response status:", stkResponse.status);
      
      const stkData = await stkResponse.json();
      console.log("STK response data:", stkData);

      return {
        success: stkResponse.ok,
        statusCode: stkResponse.status,
        response: stkData,
        debug: {
          tokenStatus: tokenResponse.status,
          timestamp,
          passwordGenerated: !!password,
          payloadSent: stkPayload
        }
      };

    } catch (error) {
      console.error("Debug error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  },
});
