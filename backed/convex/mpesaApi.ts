import { action } from "./_generated/server";
import { v } from "convex/values";

// STK Push API call only (no database operations)
export const callMpesaStkPush = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    referralId: v.string(),
    patientName: v.string(),
    useTestCallback: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    console.log("=== M-PESA API CALL START ===");

    try {
      // Get environment variables
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      let callbackUrl = process.env.DARAJA_CALLBACK_URL;

      // Use webhook.site for testing if requested
      if (args.useTestCallback) {
        callbackUrl = "https://webhook.site/test-callback-url";
        console.log("Using test callback URL:", callbackUrl);
      }

      console.log("Environment check:");
      console.log("- Consumer Key:", !!consumerKey);
      console.log("- Consumer Secret:", !!consumerSecret);
      console.log("- Shortcode:", shortcode);
      console.log("- Passkey:", !!passkey);
      console.log("- Callback URL:", callbackUrl);

      if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
        throw new Error("Missing required environment variables");
      }

      // Step 1: Get OAuth token
      console.log("=== STEP 1: OAUTH TOKEN ===");
      const authString = `${consumerKey}:${consumerSecret}`;
      const auth = btoa(authString);

      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Token response status:", tokenResponse.status);
      console.log("Token response ok:", tokenResponse.ok);

      if (!tokenResponse.ok) {
        throw new Error(`OAuth token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      console.log("Token response:", JSON.stringify(tokenData, null, 2));

      if (!tokenData.access_token) {
        throw new Error("No access token in response");
      }

      // Step 2: Generate timestamp and password (MUST be East African Time)
      console.log("=== STEP 2: STK PUSH ===");

      // Get current time in EAT (UTC+3)
      const now = new Date();
      const eatTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).formatToParts(now);

      const getPart = (type: string) => eatTime.find(p => p.type === type)?.value || "";
      const timestamp = `${getPart('year')}${getPart('month')}${getPart('day')}${getPart('hour')}${getPart('minute')}${getPart('second')}`;

      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);

      console.log("Generated Timestamp (EAT):", timestamp);
      console.log("Password generated:", password.substring(0, 20) + "...");

      // Step 3: Create STK payload
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

      // Step 4: Send STK push
      const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stkPayload)
      });

      console.log("STK response status:", stkResponse.status);
      console.log("STK response ok:", stkResponse.ok);

      const stkData = await stkResponse.json();
      console.log("STK response:", JSON.stringify(stkData, null, 2));

      // Safaricom Error responses use errorCode/errorMessage
      // Success responses use ResponseCode/ResponseDescription
      const responseCode = stkData.ResponseCode || stkData.errorCode;
      const responseDesc = stkData.ResponseDescription || stkData.errorMessage || stkData.CustomerMessage;

      // Analyze response
      const result = {
        success: stkResponse.ok && (stkData.ResponseCode === "0" || stkData.ResponseCode === 0),
        apiResponse: stkData,
        error: !stkResponse.ok ? (stkData.errorMessage || stkData.errorCode || "STK Push Request Failed") : undefined,
        analysis: {
          responseCode: responseCode,
          responseDesc: responseDesc,
          checkoutRequestId: stkData.CheckoutRequestID,
          merchantRequestId: stkData.MerchantRequestID,
          customerMessage: stkData.CustomerMessage
        },
        requestDetails: {
          phoneNumber: args.phoneNumber,
          amount: args.amount,
          callbackUrl,
          timestamp
        }
      };

      console.log("=== RESULT ===");
      console.log("Success:", result.success);
      console.log("Response Code:", responseCode);
      console.log("Response Desc:", responseDesc);

      return result;

    } catch (error) {
      console.error("M-PESA API ERROR:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }
});
