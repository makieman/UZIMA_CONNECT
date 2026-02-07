import { ActionCtx, action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { logPayment } from "./logging";

// Simulate STK push payment
export const sendSTKPayment = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    bookingId: v.optional(v.id("bookings")),
    referralId: v.optional(v.id("referrals")),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    transactionId?: string;
    paymentId?: Id<"payments">;
    message: string;
  }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success rate of 95%
    const isSuccessful = Math.random() > 0.05;

    if (isSuccessful) {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create payment record
      const paymentId: Id<"payments"> = await ctx.runMutation(api.payments.createPayment, {
        phoneNumber: args.phoneNumber,
        amount: args.amount,
        bookingId: args.bookingId,
        referralId: args.referralId,
        status: "pending" as const,
        stkRequestId: `STK-${Date.now()}`,
      });

      // Update booking or referral with STK count
      if (args.bookingId) {
        await ctx.runMutation(api.bookings.incrementBookingStkCount, {
          bookingId: args.bookingId,
        });
      }

      // Log successful STK push initiation to Google Cloud
      await logPayment(ctx, "STK_PUSH_INITIATED", {
        phoneNumber: args.phoneNumber,
        amount: args.amount,
        bookingId: args.bookingId,
        referralId: args.referralId,
        transactionId
      });

      return {
        success: true,
        transactionId,
        paymentId,
        message: `STK prompt sent to ${args.phoneNumber}. Patient has 1 hour to complete payment.`,
      };
    }

    return {
      success: false,
      message: "Failed to send STK prompt. Please try again.",
    };
  },
});

// Create payment record
export const createPayment = mutation({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    bookingId: v.optional(v.id("bookings")),
    referralId: v.optional(v.id("referrals")),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    stkRequestId: v.optional(v.string()),
    mpesaTransactionId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", args);
    return paymentId;
  },
});

// Confirm payment (simulate M-Pesa callback)
export const confirmPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    mpesaTransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");

    // Update payment status
    await ctx.db.patch(args.paymentId, {
      status: "completed",
      mpesaTransactionId: args.mpesaTransactionId,
    });

    // Update related booking or referral
    if (payment.bookingId) {
      await ctx.db.patch(payment.bookingId, {
        status: "confirmed",
        paymentStatus: "completed",
        mpesaTransactionId: args.mpesaTransactionId,
      });
    } else if (payment.referralId) {
      await ctx.db.patch(payment.referralId, {
        status: "paid",
        completedAt: Date.now(),
        paidAt: Date.now(),
      });
    }

    return payment;
  },
});

// Get payments by booking
export const getPaymentsByBooking = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();
  },
});

// Get payments by referral
export const getPaymentsByReferral = query({
  args: { referralId: v.id("referrals") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_referral", (q) => q.eq("referralId", args.referralId))
      .collect();
  },
});

// Get all payments (admin view)
export const getAllPayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("payments")
      .order("desc")
      .collect();
  },
});

// Process successful payment with notifications
export const processSuccessfulPayment = mutation({
  args: {
    checkoutRequestId: v.string(),
    merchantRequestId: v.string(),
    amount: v.number(),
    mpesaReceipt: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("=== PROCESSING SUCCESSFUL PAYMENT ===");

    try {
      // Find the payment record
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .filter((q) => q.eq(q.field("stkRequestId"), args.checkoutRequestId))
        .first();

      if (!payment) {
        console.error("Payment not found for CheckoutRequestID:", args.checkoutRequestId);
        return { success: false, error: "Payment not found" };
      }

      console.log("Found payment:", payment._id);

      // Update payment status
      await ctx.db.patch(payment._id, {
        status: "completed",
        mpesaTransactionId: args.mpesaReceipt,
        updatedAt: Date.now()
      });

      // Update related booking or referral
      let referral = null;
      let booking = null;

      if (payment.referralId) {
        referral = await ctx.db.get(payment.referralId);
        if (referral) {
          await ctx.db.patch(payment.referralId, {
            status: "paid",
            paidAt: Date.now(),
            updatedAt: Date.now()
          });

          // Create success notification for patient
          await ctx.db.insert("notifications", {
            // @ts-ignore
            userId: (referral.patientId || referral.patientPhone || "") as string,
            type: "payment",
            title: "Payment Successful! 🎉",
            message: `Your payment of KES ${args.amount} for referral ${referral.referralToken || 'N/A'} has been received. M-Pesa receipt: ${args.mpesaReceipt}`,
            isRead: false,
            metadata: {
              referralId: (payment.referralId as string),
              paymentId: (payment._id as string),
            } as any,
            createdAt: Date.now()
          });

          // Create notification for physician
          if (referral.physicianId) {
            const physician = await ctx.db.get(referral.physicianId);
            if (physician) {
              const physicianUser = await ctx.db.get(physician.userId);
              if (physicianUser) {
                await ctx.db.insert("notifications", {
                  userId: physicianUser._id,
                  type: "payment",
                  title: "Patient Payment Received",
                  message: `Payment of KES ${args.amount} received for referral ${referral.referralToken || 'N/A'} from patient ${referral.patientName}`,
                  isRead: false,
                  metadata: {
                    referralId: (payment.referralId as string),
                    paymentId: (payment._id as string),
                  } as any,
                  createdAt: Date.now()
                });
              }
            }
          }
        }
      }

      if (payment.bookingId) {
        booking = await ctx.db.get(payment.bookingId);
        if (booking) {
          await ctx.db.patch(payment.bookingId, {
            status: "confirmed",
            paymentStatus: "completed",
            mpesaTransactionId: args.mpesaReceipt,
            updatedAt: Date.now()
          });

          // Create success notification for patient
          await ctx.db.insert("notifications", {
            userId: booking.patientId,
            type: "payment",
            title: "Booking Payment Successful! 🎉",
            message: `Your payment of KES ${args.amount} for booking on ${booking.bookingDate} has been received. M-Pesa receipt: ${args.mpesaReceipt}`,
            isRead: false,
            metadata: {
              bookingId: (payment.bookingId as string),
              paymentId: (payment._id as string),
            } as any,
            createdAt: Date.now()
          });
        }
      }

      console.log("✅ PAYMENT PROCESSED SUCCESSFULLY");
      console.log("📱 Notifications sent");

      return {
        success: true,
        paymentId: payment._id,
        referralUpdated: !!referral,
        bookingUpdated: !!booking
      };

    } catch (error) {
      console.error("Failed to process successful payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});

// Process failed payment with notifications
export const processFailedPayment = mutation({
  args: {
    checkoutRequestId: v.string(),
    merchantRequestId: v.string(),
    resultCode: v.string(),
    resultDesc: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("=== PROCESSING FAILED PAYMENT ===");

    try {
      // Find the payment record
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .filter((q) => q.eq(q.field("stkRequestId"), args.checkoutRequestId))
        .first();

      if (!payment) {
        console.error("Payment not found for CheckoutRequestID:", args.checkoutRequestId);
        return { success: false, error: "Payment not found" };
      }

      console.log("Found payment:", payment._id);

      // Update payment status
      await ctx.db.patch(payment._id, {
        status: "failed",
        errorMessage: args.resultDesc,
        updatedAt: Date.now()
      });

      // Create failure notification
      let referral = null;
      let booking = null;

      if (payment.referralId) {
        referral = await ctx.db.get(payment.referralId);
        if (referral) {
          await ctx.db.insert("notifications", {
            // @ts-ignore
            userId: (referral.patientId || referral.patientPhone || "") as string,
            type: "payment",
            title: "Payment Failed ❌",
            message: `Your payment of KES ${payment.amount} for referral ${referral.referralToken || 'N/A'} failed. Reason: ${args.resultDesc}. Please try again.`,
            isRead: false,
            metadata: {
              referralId: (payment.referralId as string),
              paymentId: (payment._id as string),
            } as any,
            createdAt: Date.now()
          });
        }
      }

      if (payment.bookingId) {
        booking = await ctx.db.get(payment.bookingId);
        if (booking) {
          await ctx.db.insert("notifications", {
            userId: booking.patientId,
            type: "payment",
            title: "Booking Payment Failed ❌",
            message: `Your payment of KES ${payment.amount} for booking on ${booking.bookingDate} failed. Reason: ${args.resultDesc}. Please try again.`,
            isRead: false,
            metadata: {
              bookingId: (payment.bookingId as string),
              paymentId: (payment._id as string),
            } as any,
            createdAt: Date.now()
          });
        }
      }

      console.log("❌ PAYMENT FAILURE PROCESSED");
      console.log("📱 Failure notifications sent");

      return {
        success: true,
        paymentId: payment._id,
        referralUpdated: !!referral,
        bookingUpdated: !!booking
      };

    } catch (error) {
      console.error("Failed to process failed payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});
