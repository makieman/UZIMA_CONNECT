import { action } from "./_generated/server";
import { v } from "convex/values";

// Simple test to verify M-Pesa functionality
export const testMpesaSimple = action({
  args: {},
  handler: async (ctx) => {
    console.log("=== SIMPLE M-PESA TEST ===");
    
    try {
      // Test with hardcoded values
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      const callbackUrl = process.env.DARAJA_CALLBACK_URL;
      
      console.log("Environment check:", {
        hasKey: !!consumerKey,
        hasSecret: !!consumerSecret,
        hasShortcode: !!shortcode,
        hasPasskey: !!passkey,
        hasCallback: !!callbackUrl
      });
      
      // Test OAuth
      const auth = btoa(`${consumerKey}:${consumerSecret}`);
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
      
      console.log("Token status:", tokenResponse.status);
      
      if (!tokenResponse.ok) {
        return {
          success: false,
          error: `Token failed: ${tokenResponse.status}`,
          stage: "oauth"
        };
      }
      
      const tokenData = await tokenResponse.json();
      console.log("Token received:", !!tokenData.access_token);
      
      // Test timestamp generation
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      
      console.log("Generated timestamp:", timestamp);
      
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);
      
      console.log("Password generated:", !!password);
      
      // Test STK payload
      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 1,
        PartyA: "254748623870",
        PartyB: shortcode,
        PhoneNumber: "254748623870",
        CallBackURL: callbackUrl,
        AccountReference: "test123",
        TransactionDesc: "Test payment"
      };
      
      console.log("Sending STK request...");
      
      const stkResponse = await fetch(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(stkPayload)
        }
      );
      
      console.log("STK response status:", stkResponse.status);
      
      const stkData = await stkResponse.json();
      console.log("STK response:", stkData);
      
      return {
        success: stkResponse.ok,
        tokenStatus: tokenResponse.status,
        stkStatus: stkResponse.status,
        stkResponse: stkData,
        timestamp: timestamp,
        stage: "complete"
      };
      
    } catch (error) {
      console.error("Test error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stage: "error"
      };
    }
  },
});
