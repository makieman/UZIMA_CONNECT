import { action } from "./_generated/server";
import { v } from "convex/values";

// Test M-Pesa OAuth with different credentials
export const testMpesaCredentials = action({
  args: {},
  handler: async (ctx) => {
    console.log("=== TESTING M-PESA CREDENTIALS ===");
    
    // Test with current environment variables
    const currentCredentials = {
      consumerKey: process.env.DARAJA_CONSUMER_KEY,
      consumerSecret: process.env.DARAJA_CONSUMER_SECRET,
    };
    
    console.log("Current credentials:", {
      consumerKey: currentCredentials.consumerKey?.substring(0, 10) + "...",
      consumerSecret: currentCredentials.consumerSecret?.substring(0, 10) + "...",
    });
    
    // Test with standard sandbox credentials
    const sandboxCredentials = {
      consumerKey: "FBmQpTtE5hBF3iK9Ho9YQI5eDgHO7nHm",
      consumerSecret: "2tJMq4kTJg9bC5fR8wX1pL7nY6vZ3sAe",
    };
    
    console.log("Testing with sandbox credentials...");
    
    try {
      // Test current credentials
      const currentAuth = btoa(`${currentCredentials.consumerKey}:${currentCredentials.consumerSecret}`);
      const currentResponse = await fetch(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          method: "GET",
          headers: {
            "Authorization": `Basic ${currentAuth}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log("Current credentials status:", currentResponse.status);
      
      if (!currentResponse.ok) {
        console.log("❌ Current credentials failed. Testing sandbox credentials...");
        
        // Test sandbox credentials
        const sandboxAuth = btoa(`${sandboxCredentials.consumerKey}:${sandboxCredentials.consumerSecret}`);
        const sandboxResponse = await fetch(
          "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
          {
            method: "GET",
            headers: {
              "Authorization": `Basic ${sandboxAuth}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        console.log("Sandbox credentials status:", sandboxResponse.status);
        
        if (sandboxResponse.ok) {
          const tokenData = await sandboxResponse.json();
          console.log("✅ Sandbox credentials work!");
          
          return {
            success: true,
            message: "Use sandbox credentials",
            sandboxCredentials,
            currentCredentialsFailed: true,
            tokenReceived: !!tokenData.access_token
          };
        } else {
          return {
            success: false,
            message: "Both credential sets failed",
            currentStatus: currentResponse.status,
            sandboxStatus: sandboxResponse.status
          };
        }
      } else {
        const tokenData = await currentResponse.json();
        console.log("✅ Current credentials work!");
        
        return {
          success: true,
          message: "Current credentials are valid",
          tokenReceived: !!tokenData.access_token
        };
      }
      
    } catch (error) {
      console.error("Test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});
