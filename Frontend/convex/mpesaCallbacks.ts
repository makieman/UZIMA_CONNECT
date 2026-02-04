import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

// M-Pesa STK Push Callback Handler
export const mpesaCallback = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    console.log("M-Pesa Callback received:", JSON.stringify(body, null, 2));

    const { Body } = body;
    if (!Body || !Body.stkCallback) {
      throw new Error("Invalid callback payload: Missing Body or stkCallback");
    }

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = Body.stkCallback;

    // Extract M-Pesa Receipt Number if successful
    let mpesaReceiptNumber: string | undefined;
    if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
      const items = CallbackMetadata.Item;
      const receiptItem = items.find((item: any) => item.Name === "MpesaReceiptNumber");
      mpesaReceiptNumber = receiptItem?.Value;
    }

    // 1. Process database updates via mutation (Atomic & Idempotent)
    // Use any casting for api because generated types might be stale
    const result: any = await ctx.runMutation((api as any).mutations.payments.processPaymentResult, {
      checkoutRequestId: CheckoutRequestID,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      mpesaReceiptNumber,
    });

    if (!result.success) {
      console.error("Failed to process payment result:", result.error);
      return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Internal Error" }), {
        status: 200, // Still return 200 to Safaricom to avoid retries if we logged it
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. If payment was successful, trigger SMS (Fire and Forget or Log)
    if (result.status === "completed") {
      try {
        await ctx.runAction((api as any).actions.notifications.sendPaymentConfirmationSMS, {
          phoneNumber: result.phoneNumber,
          name: result.patientName,
          amount: result.amount,
          token: result.referralToken,
        });
        console.log(`SMS trigger scheduled for ${result.phoneNumber}`);
      } catch (smsError) {
        console.error("Failed to trigger SMS action:", smsError);
        // We don't fail the whole callback if just SMS fails
      }
    }

    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "Callback processed successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("M-Pesa Callback processing error:", error);

    return new Response(
      JSON.stringify({
        ResultCode: 1,
        ResultDesc: "Callback processing failed"
      }),
      {
        status: 200, // Safaricom expects a response even on error
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});

// HTTP Routes
const http = httpRouter();

http.route({
  path: "/api/stk-callback",
  method: "POST",
  handler: mpesaCallback,
});

export default http;
