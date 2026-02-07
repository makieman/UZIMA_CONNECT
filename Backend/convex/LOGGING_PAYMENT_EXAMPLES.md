/**
 * Example: Structured Logging Integration for Payment Processing
 * 
 * This file demonstrates how to integrate structured logging into payment flows.
 * Copy these patterns into your actual mpesa.ts, payments.ts, and related files.
 */

// ============================================================================
// EXAMPLE 1: Log STK Push Initiation
// ============================================================================
// Add to your initiateSTKPush action in mpesa.ts:

export const exampleInitiateStkPush = {
  handler: async (ctx, args) => {
    const startTime = Date.now();
    const { phoneNumber, amount, referralId, patientName } = args;
    
    try {
      // Log STK Push initiation
      console.log(JSON.stringify({
        message: 'PAYMENT_STK_PUSH_INITIATED',
        event: 'STK_PUSH',
        phone: phoneNumber.replace(/\d(?=\d{2})/g, '*'), // Mask sensitive data
        amount: amount,
        referralId: referralId,
        patientName: patientName,
        status: 'INITIATED',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        labels: {
          event_type: 'PAYMENT',
          action: 'STK_PUSH_INITIATED',
          amount_kes: amount
        }
      }));

      // Get OAuth token
      const consumerKey = process.env.DARAJA_CONSUMER_KEY;
      const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
      const authString = `${consumerKey}:${consumerSecret}`;
      const auth = btoa(authString);
      
      const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get OAuth token");
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Log successful token acquisition
      console.log(JSON.stringify({
        message: 'PAYMENT_AUTH_TOKEN_ACQUIRED',
        event: 'AUTH_TOKEN',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        severity: 'DEBUG',
        labels: {
          event_type: 'EXTERNAL_SERVICE',
          service: 'DARAJA',
          action: 'AUTH_TOKEN'
        }
      }));

      // Step 2: Generate timestamp and password
      const shortcode = process.env.DARAJA_SHORTCODE;
      const passkey = process.env.DARAJA_PASSKEY;
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, -5);
      const passwordString = `${shortcode}${passkey}${timestamp}`;
      const password = btoa(passwordString);

      // Step 3: Initiate STK Push
      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.DARAJA_CALLBACK_URL,
        AccountReference: `REF_${referralId}`,
        TransactionDesc: `Payment for ${patientName}`
      };

      const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stkPayload)
      });

      const stkData = await stkResponse.json();
      const duration = Date.now() - startTime;

      if (stkData.ResponseCode === "0") {
        // Log successful STK push
        console.log(JSON.stringify({
          message: 'PAYMENT_STK_PUSH_SENT',
          event: 'STK_PUSH',
          phone: phoneNumber.replace(/\d(?=\d{2})/g, '*'),
          amount: amount,
          referralId: referralId,
          requestId: stkData.RequestID,
          status: 'SENT',
          duration: duration,
          timestamp: new Date().toISOString(),
          severity: 'INFO',
          labels: {
            event_type: 'PAYMENT',
            action: 'STK_PUSH_SENT',
            amount_kes: amount,
            status: 'SUCCESS'
          }
        }));

        return {
          success: true,
          requestId: stkData.RequestID,
          message: "STK Push sent successfully"
        };
      } else {
        // Log failed STK push
        console.log(JSON.stringify({
          message: 'PAYMENT_STK_PUSH_FAILED',
          event: 'STK_PUSH',
          phone: phoneNumber.replace(/\d(?=\d{2})/g, '*'),
          amount: amount,
          referralId: referralId,
          errorCode: stkData.ResponseCode,
          errorMessage: stkData.ResponseDescription,
          duration: duration,
          timestamp: new Date().toISOString(),
          severity: 'WARNING',
          labels: {
            event_type: 'PAYMENT',
            action: 'STK_PUSH_FAILED',
            amount_kes: amount,
            status: 'FAILED',
            error_code: stkData.ResponseCode
          }
        }));

        throw new Error(`STK Push failed: ${stkData.ResponseDescription}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error
      console.log(JSON.stringify({
        message: 'PAYMENT_STK_PUSH_ERROR',
        event: 'STK_PUSH',
        phone: phoneNumber.replace(/\d(?=\d{2})/g, '*'),
        amount: amount,
        referralId: referralId,
        error: error.message,
        errorStack: error.stack,
        duration: duration,
        timestamp: new Date().toISOString(),
        severity: 'ERROR',
        labels: {
          event_type: 'PAYMENT',
          action: 'STK_PUSH_ERROR',
          amount_kes: amount,
          status: 'ERROR'
        }
      }));

      throw error;
    }
  }
};

// ============================================================================
// EXAMPLE 2: Log Payment Callback Receipt
// ============================================================================
// Add to your payment callback handler:

export const exampleHandlePaymentCallback = {
  handler: async (ctx, callbackData) => {
    try {
      const {
        Body: {
          stkCallback: {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata
          }
        }
      } = callbackData;

      // Extract payment details if successful
      let transactionDetails = {};
      if (ResultCode === 0 && CallbackMetadata) {
        const metadata = CallbackMetadata.Item;
        transactionDetails = {
          amount: metadata.find((item) => item.Name === "Amount")?.Value || 0,
          mpesaReceiptNumber: metadata.find((item) => item.Name === "MpesaReceiptNumber")?.Value || "",
          transactionDate: metadata.find((item) => item.Name === "TransactionDate")?.Value || "",
          phoneNumber: metadata.find((item) => item.Name === "PhoneNumber")?.Value || ""
        };
      }

      // Log callback received
      console.log(JSON.stringify({
        message: 'PAYMENT_CALLBACK_RECEIVED',
        event: 'PAYMENT_CALLBACK',
        checkoutRequestId: CheckoutRequestID,
        merchantRequestId: MerchantRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        success: ResultCode === 0,
        amount: transactionDetails.amount || null,
        phone: transactionDetails.phoneNumber?.replace(/\d(?=\d{2})/g, '*') || null,
        mpesaReceiptNumber: transactionDetails.mpesaReceiptNumber,
        timestamp: new Date().toISOString(),
        severity: ResultCode === 0 ? 'INFO' : 'WARNING',
        labels: {
          event_type: 'PAYMENT',
          action: 'CALLBACK_RECEIVED',
          status: ResultCode === 0 ? 'SUCCESS' : 'FAILED',
          result_code: ResultCode
        }
      }));

      if (ResultCode === 0) {
        // Process successful payment
        // Update payment status in database
        
        console.log(JSON.stringify({
          message: 'PAYMENT_COMPLETED',
          event: 'PAYMENT_COMPLETED',
          checkoutRequestId: CheckoutRequestID,
          mpesaReceiptNumber: transactionDetails.mpesaReceiptNumber,
          amount: transactionDetails.amount,
          phone: transactionDetails.phoneNumber?.replace(/\d(?=\d{2})/g, '*'),
          timestamp: new Date().toISOString(),
          severity: 'INFO',
          labels: {
            event_type: 'PAYMENT',
            action: 'PAYMENT_COMPLETED',
            amount_kes: transactionDetails.amount,
            status: 'SUCCESS'
          }
        }));
      } else {
        // Handle payment failure
        console.log(JSON.stringify({
          message: 'PAYMENT_FAILED',
          event: 'PAYMENT_FAILED',
          checkoutRequestId: CheckoutRequestID,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          timestamp: new Date().toISOString(),
          severity: 'WARNING',
          labels: {
            event_type: 'PAYMENT',
            action: 'PAYMENT_FAILED',
            result_code: ResultCode,
            status: 'FAILED'
          }
        }));
      }

      return { success: true };
    } catch (error) {
      console.log(JSON.stringify({
        message: 'PAYMENT_CALLBACK_ERROR',
        event: 'PAYMENT_CALLBACK',
        error: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
        severity: 'ERROR',
        labels: {
          event_type: 'PAYMENT',
          action: 'CALLBACK_ERROR',
          status: 'ERROR'
        }
      }));

      throw error;
    }
  }
};

// ============================================================================
// EXAMPLE 3: Log Payment Refund
// ============================================================================

export const exampleProcessRefund = {
  handler: async (ctx, args) => {
    const startTime = Date.now();
    const { transactionCode, amount, reason } = args;

    try {
      // Log refund initiation
      console.log(JSON.stringify({
        message: 'PAYMENT_REFUND_INITIATED',
        event: 'REFUND',
        transactionCode: transactionCode,
        amount: amount,
        reason: reason,
        status: 'INITIATED',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        labels: {
          event_type: 'PAYMENT',
          action: 'REFUND_INITIATED',
          amount_kes: amount
        }
      }));

      // Process refund logic here

      const duration = Date.now() - startTime;

      console.log(JSON.stringify({
        message: 'PAYMENT_REFUND_COMPLETED',
        event: 'REFUND',
        transactionCode: transactionCode,
        amount: amount,
        reason: reason,
        status: 'COMPLETED',
        duration: duration,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        labels: {
          event_type: 'PAYMENT',
          action: 'REFUND_COMPLETED',
          amount_kes: amount,
          status: 'SUCCESS'
        }
      }));
    } catch (error) {
      const duration = Date.now() - startTime;

      console.log(JSON.stringify({
        message: 'PAYMENT_REFUND_FAILED',
        event: 'REFUND',
        transactionCode: transactionCode,
        amount: amount,
        reason: reason,
        error: error.message,
        duration: duration,
        timestamp: new Date().toISOString(),
        severity: 'ERROR',
        labels: {
          event_type: 'PAYMENT',
          action: 'REFUND_FAILED',
          amount_kes: amount,
          status: 'ERROR'
        }
      }));

      throw error;
    }
  }
};

/**
 * IMPORTANT: Replace console.log with your actual structured logging implementation
 * In production, these logs will be automatically sent to Google Cloud Logging
 * via the winston transport configured in logger.js
 */
