import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const processPaymentResult = mutation({
    args: {
        checkoutRequestId: v.string(),
        resultCode: v.number(),
        resultDesc: v.string(),
        mpesaReceiptNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Find the payment record by CheckoutRequestID
        const payment = await ctx.db
            .query("payments")
            .filter((q) => q.eq(q.field("stkRequestId"), args.checkoutRequestId))
            .first();

        if (!payment) {
            console.warn(`Payment record not found for CheckoutRequestID: ${args.checkoutRequestId}`);
            return { success: false, error: "Payment not found" };
        }

        // 2. Enforce Idempotency: If already completed or failed, skip
        if (payment.status !== "pending") {
            console.log(`Payment ${payment._id} already processed with status: ${payment.status}`);

            // Still return the info needed for SMS in case the SMS failed previously but DB was updated
            let patientName = "Patient";
            let referralToken = "";
            let date = "N/A";
            let time = "N/A";
            let clinic = "Afiya Connect";
            let email = "N/A";

            if (payment.referralId) {
                const referral = await ctx.db.get(payment.referralId);
                if (referral) {
                    patientName = referral.patientName;
                    referralToken = referral.referralToken || "";
                    date = referral.bookedDate || "N/A";
                    time = referral.bookedTime || "N/A";
                    clinic = referral.receivingFacility || "Afiya Connect";
                    email = referral.patientEmail || "N/A";
                }
            } else if (payment.bookingId) {
                const booking = await ctx.db.get(payment.bookingId);
                if (booking) {
                    date = booking.bookingDate;
                    time = booking.bookingTime;

                    const clinicId = ctx.db.normalizeId("clinics", booking.clinicId);
                    const clinicRecord = clinicId ? await ctx.db.get(clinicId) : null;
                    clinic = (clinicRecord as any)?.name || "Afiya Connect";

                    if (booking.referralId) {
                        const ref = await ctx.db.get(booking.referralId);
                        if (ref) {
                            patientName = ref.patientName;
                            referralToken = ref.referralToken || "";
                        }
                    }
                }
            }

            return {
                success: true,
                alreadyProcessed: true,
                paymentId: payment._id,
                status: payment.status,
                phoneNumber: payment.phoneNumber,
                amount: payment.amount,
                patientName,
                referralToken,
                date,
                time,
                clinic,
                email
            };
        }

        // 3. Update Payment record
        const status = args.resultCode === 0 ? "completed" : "failed";
        await ctx.db.patch(payment._id, {
            status,
            mpesaTransactionId: args.mpesaReceiptNumber,
            errorMessage: args.resultCode !== 0 ? args.resultDesc : undefined,
            updatedAt: Date.now(),
        });

        let patientName = "Patient";
        let referralToken = "";
        let date = "N/A";
        let time = "N/A";
        let clinic = "Afiya Connect";
        let email = "N/A";

        if (status === "completed") {
            // 4a. Update Referral if linked
            if (payment.referralId) {
                const referral = await ctx.db.get(payment.referralId);
                if (referral) {
                    patientName = referral.patientName;
                    referralToken = referral.referralToken || "";
                    date = referral.bookedDate || "N/A";
                    time = referral.bookedTime || "N/A";
                    clinic = referral.receivingFacility || "Afiya Connect";
                    email = referral.patientEmail || "N/A";
                    await ctx.db.patch(referral._id, {
                        status: "paid",
                        paidAt: Date.now(),
                        updatedAt: Date.now(),
                    });
                }
            }

            // 4b. Update Booking if linked
            if (payment.bookingId) {
                const booking = await ctx.db.get(payment.bookingId);
                if (booking) {
                    date = booking.bookingDate;
                    time = booking.bookingTime;

                    const clinicId = ctx.db.normalizeId("clinics", booking.clinicId);
                    const clinicRecord = clinicId ? await ctx.db.get(clinicId) : null;
                    clinic = (clinicRecord as any)?.name || "Afiya Connect";

                    if (booking.referralId && patientName === "Patient") {
                        const ref = await ctx.db.get(booking.referralId);
                        if (ref) {
                            patientName = ref.patientName;
                            referralToken = ref.referralToken || "";
                        }
                    }

                    await ctx.db.patch(booking._id, {
                        status: "confirmed",
                        paymentStatus: "completed",
                        mpesaTransactionId: args.mpesaReceiptNumber,
                        updatedAt: Date.now(),
                    });
                }
            }
        }

        return {
            success: true,
            paymentId: payment._id,
            status,
            referralId: payment.referralId,
            bookingId: payment.bookingId,
            patientName,
            referralToken,
            date,
            time,
            clinic,
            email
        };
    },
});
