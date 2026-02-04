"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

/**
 * Normalizes a phone number to E.164 format (+254...)
 */
function normalizePhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, "");

    if (digits.startsWith("254") && digits.length === 12) {
        return `+${digits}`;
    } else if (digits.startsWith("0") && digits.length === 10) {
        return `+254${digits.substring(1)}`;
    } else if (digits.length === 9) {
        return `+254${digits}`;
    }

    return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}

export const sendPaymentConfirmationSMS = action({
    args: {
        phoneNumber: v.string(),
        name: v.string(),
        amount: v.number(),
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const username = process.env.AT_USERNAME;
        const apiKey = process.env.AT_API_KEY;
        const environment =
            process.env.AT_ENVIRONMENT ||
            (username && username !== "sandbox" ? "production" : "sandbox");

        if (!username || !apiKey) {
            console.error("Africa's Talking credentials missing (AT_USERNAME, AT_API_KEY)");
            return { success: false, error: "Credentials missing" };
        }

        const to = normalizePhoneNumber(args.phoneNumber);
        const baseUrl =
            environment === "production"
                ? "https://api.africastalking.com"
                : "https://api.sandbox.africastalking.com";
        const from = process.env.AT_FROM;
        const message = `Hello ${args.name},
We have received your payment of KES ${args.amount} for Afiya Connect.
Your referral token is ${args.token}.
Thank you.`;

        try {
            console.log(`Sending SMS to ${to}...`);
            console.log(`Africa's Talking environment: ${environment}`);

            const response = await fetch(`${baseUrl}/version1/messaging`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "apiKey": apiKey,
                },
                body: new URLSearchParams({
                    username: username,
                    to: to,
                    message: message,
                    ...(from ? { from } : {}),
                }),
            });

            const data = await response.json();
            console.log("Africa's Talking response:", JSON.stringify(data));

            if (!response.ok) {
                throw new Error(`Africa's Talking API error: ${response.status} ${response.statusText}`);
            }

            // Africa's Talking returns success in the payload even if HTTP 200
            const status = data.SMSMessageData?.Recipients?.[0]?.status;

            if (status === "Success" || status === "Pending") {
                return { success: true, messageId: data.SMSMessageData?.Recipients?.[0]?.messageId };
            } else {
                console.warn(`SMS status failure: ${status}`);
                return { success: false, error: status || "Unknown failure" };
            }
        } catch (error) {
            console.error("Failed to send SMS:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Internal error"
            };
        }
    },
});
