import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Users table for authentication and basic user info
  users: defineTable({
    role: v.union(v.literal("patient"), v.literal("admin"), v.literal("physician")),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    fullName: v.string(),
    isActive: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phoneNumber"])
    .index("by_role", ["role"]),

  // Physicians table
  physicians: defineTable({
    userId: v.id("users"),
    licenseId: v.string(),
    hospital: v.string(),
    specialization: v.optional(v.string()),
    isVerified: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_license", ["licenseId"]),

  // Patients table
  patients: defineTable({
    userId: v.id("users"),
    dateOfBirth: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),

  // Clinics/Facilities table
  clinics: defineTable({
    name: v.string(),
    facilityName: v.string(),
    location: v.string(),
    maxPatientsPerDay: v.number(),
    contactPhone: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_location", ["location"])
    .index("by_active", ["isActive"]),

  // Referrals table
  referrals: defineTable({
    physicianId: v.id("physicians"),
    patientName: v.string(),
    patientId: v.optional(v.string()),
    medicalHistory: v.string(),
    labResults: v.string(),
    diagnosis: v.string(),
    referringHospital: v.string(),
    receivingFacility: v.string(),
    priority: v.union(v.literal("Routine"), v.literal("Urgent"), v.literal("Emergency")),
    status: v.union(
      v.literal("pending-admin"),
      v.literal("awaiting-biodata"),
      v.literal("pending-payment"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    referralToken: v.optional(v.string()),
    patientPhone: v.optional(v.string()),
    stkPhoneNumber: v.optional(v.string()),
    patientDateOfBirth: v.optional(v.string()),
    patientNationalId: v.optional(v.string()),
    bookedDate: v.optional(v.string()),
    bookedTime: v.optional(v.string()),
    stkSentCount: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    biodataCode: v.optional(v.string()),
  })
    .index("by_physician", ["physicianId"])
    .index("by_status", ["status"])
    .index("by_token", ["referralToken"])
    .index("by_patient_id", ["patientId"]),

  // Bookings table
  bookings: defineTable({
    referralId: v.optional(v.id("referrals")),
    patientId: v.string(),
    patientPhone: v.string(),
    stkPhoneNumber: v.string(),
    clinicId: v.string(),
    slotId: v.string(),
    bookingDate: v.string(),
    bookingTime: v.string(),
    status: v.union(
      v.literal("pending-payment"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("expired")
    ),
    paymentStatus: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    paymentAmount: v.number(),
    mpesaTransactionId: v.optional(v.string()),
    stkSentCount: v.number(),
    expiresAt: v.number(),
  })
    .index("by_patient", ["patientId"])
    .index("by_clinic_date", ["clinicId", "bookingDate"])
    .index("by_status", ["status"])
    .index("by_expiry", ["expiresAt"]),

  // Notifications table
  notifications: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("booking"),
      v.literal("payment"),
      v.literal("overdue"),
      v.literal("rescheduled"),
      v.literal("referral")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    metadata: v.optional(v.object({
      bookingId: v.optional(v.string()),
      referralId: v.optional(v.string()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),

  // Payment transactions table
  payments: defineTable({
    bookingId: v.optional(v.id("bookings")),
    referralId: v.optional(v.id("referrals")),
    phoneNumber: v.string(),
    amount: v.number(),
    mpesaTransactionId: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    stkRequestId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  })
    .index("by_booking", ["bookingId"])
    .index("by_referral", ["referralId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_status", ["status"]),

  // System settings table
  settings: defineTable({
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_key", ["key"]),

  // Audit logs table for healthcare compliance
  audit_logs: defineTable({
    userId: v.optional(v.string()),
    action: v.string(),
    resourceId: v.optional(v.string()),
    details: v.any(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resourceId"])
    .index("by_timestamp", ["timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
