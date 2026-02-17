"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Resend client initialized inside handler to avoid build-time errors if env var is missing

export const sendBookingConfirmationEmail = action({
    args: {
        email: v.string(),
        name: v.string(),
        date: v.string(),
        time: v.string(),
        clinic: v.string(),
        token: v.string(),
    },
    handler: async (ctx, args) => {
        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY not set");
            return { success: false, error: "Email provider not configured" };
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        try {
            const { data, error } = await resend.emails.send({
                from: "Afiya Connect <notifications@uzimacare.ke>",
                to: [args.email],
                subject: "Booking Confirmation - Afiya Connect",
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Booking Confirmation</h2>
            <p>Hello <strong>${args.name}</strong>,</p>
            <p>We have received your payment for your referral booking with Afiya Connect.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Clinic:</strong> ${args.clinic}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${args.date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${args.time}</p>
              <p style="margin: 5px 0;"><strong>Referral Token:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${args.token}</span></p>
            </div>
            
            <p>Please present your referral token when you visit the clinic.</p>
            <p>Thank you for choosing Afiya Connect.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        `,
            });

            if (error) {
                console.error("Resend error:", error);
                return { success: false, error };
            }

            console.log("Email sent successfully:", data?.id);
            return { success: true, messageId: data?.id };
        } catch (err) {
            console.error("Failed to send email:", err);
            return { success: false, error: String(err) };
        }
    },
});
