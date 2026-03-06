import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed initial data for development — creates a complete testable environment
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      return { message: "Data already seeded" };
    }

    // ─── 1. Create Hospitals FIRST ───────────────────────────────────────────
    const hospital1Id = await ctx.db.insert("hospitals", {
      name: "Kenyatta National Hospital",
      code: "KNH-001",
      county: "Nairobi",
      level: "Level 6",
      contactPhone: "+254700123456",
      contactEmail: "info@knh.or.ke",
      isActive: true,
      createdAt: Date.now(),
    });

    const hospital2Id = await ctx.db.insert("hospitals", {
      name: "Moi Teaching and Referral Hospital",
      code: "MTRH-002",
      county: "Uasin Gishu",
      level: "Level 6",
      contactPhone: "+254700654321",
      contactEmail: "info@mtrh.go.ke",
      isActive: true,
      createdAt: Date.now(),
    });

    const hospital3Id = await ctx.db.insert("hospitals", {
      name: "Coast General Teaching Hospital",
      code: "CGH-003",
      county: "Mombasa",
      level: "Level 5",
      contactPhone: "+254700111222",
      contactEmail: "info@cgh.go.ke",
      isActive: true,
      createdAt: Date.now(),
    });

    // ─── 2. Create Super Admin ───────────────────────────────────────────────
    const adminUserId = await ctx.db.insert("users", {
      role: "super_admin",
      email: "admin@uzimacare.ke",
      fullName: "Admin User",
      isActive: true,
      createdAt: Date.now(),
    });

    // ─── 3. Create Facility Admins (linked to real hospitals) ────────────────
    const facilityAdmin1Id = await ctx.db.insert("users", {
      role: "facility_admin",
      email: "facility.admin@hospital.ke",
      fullName: "Jane Facility Admin",
      hospitalId: hospital1Id,
      isActive: true,
      createdAt: Date.now(),
    });

    const facilityAdmin2Id = await ctx.db.insert("users", {
      role: "facility_admin",
      email: "admin.mtrh@hospital.ke",
      fullName: "Peter Receiving Admin",
      hospitalId: hospital2Id,
      isActive: true,
      createdAt: Date.now(),
    });

    // ─── 4. Create Physician Users (linked to hospitals) ─────────────────────
    const physician1UserId = await ctx.db.insert("users", {
      role: "physician",
      email: "dr.kipchoge@hospital.ke",
      fullName: "Dr. James Kipchoge",
      hospitalId: hospital1Id,
      isActive: true,
      createdAt: Date.now(),
    });

    const physician2UserId = await ctx.db.insert("users", {
      role: "physician",
      email: "dr.omondi@hospital.ke",
      fullName: "Dr. Sarah Omondi",
      hospitalId: hospital2Id,
      isActive: true,
      createdAt: Date.now(),
    });

    // ─── 5. Create Physician Profiles (with initialPassword for first login) ─
    const physicianProfile1 = await ctx.db.insert("physicians", {
      userId: physician1UserId,
      licenseId: "56845",
      hospital: "Kenyatta National Hospital",
      hospitalId: hospital1Id,
      specialization: "Internal Medicine",
      isVerified: true,
      initialPassword: "password",
      createdAt: Date.now(),
    });

    const physicianProfile2 = await ctx.db.insert("physicians", {
      userId: physician2UserId,
      licenseId: "PH-67890",
      hospital: "Moi Teaching and Referral Hospital",
      hospitalId: hospital2Id,
      specialization: "General Practice",
      isVerified: true,
      initialPassword: "password",
      createdAt: Date.now(),
    });

    // ─── 6. Create Clinics (legacy, linked to hospitals) ─────────────────────
    const clinic1Id = await ctx.db.insert("clinics", {
      name: "TB Wing A",
      facilityName: "Kenyatta National Hospital",
      location: "Nairobi",
      maxPatientsPerDay: 15,
      contactPhone: "+254700123456",
      isActive: true,
    });

    const clinic2Id = await ctx.db.insert("clinics", {
      name: "TB Wing B",
      facilityName: "Moi Teaching and Referral Hospital",
      location: "Eldoret",
      maxPatientsPerDay: 10,
      contactPhone: "+254700654321",
      isActive: true,
    });

    // ─── 7. Create Sample Referrals (with proper hospital ID links) ──────────
    const referral1Id = await ctx.db.insert("referrals", {
      physicianId: physicianProfile1,
      patientName: "Margaret Wanjiru",
      patientId: "MRN-5432",
      medicalHistory: "Patient presents with persistent cough and fever for 3 weeks. History of recent respiratory illness.",
      labResults: "Chest imaging shows abnormality in upper right lobe.",
      diagnosis: "Possible pulmonary infection; specialist consult recommended.",
      referringHospital: "Kenyatta National Hospital",
      receivingFacility: "Moi Teaching and Referral Hospital",
      referringHospitalId: hospital1Id,
      receivingHospitalId: hospital2Id,
      priority: "Urgent",
      status: "pending-admin",
      referralToken: "ABC123",
      stkSentCount: 0,
      createdAt: Date.now(),
    });

    const referral2Id = await ctx.db.insert("referrals", {
      physicianId: physicianProfile2,
      patientName: "Peter Otieno",
      patientId: "MRN-9876",
      medicalHistory: "Patient with chronic cough and weight loss. Requires further evaluation and referral.",
      labResults: "Sputum test pending; X-ray shows possible infiltrates.",
      diagnosis: "Suspected pulmonary infection",
      referringHospital: "Moi Teaching and Referral Hospital",
      receivingFacility: "Kenyatta National Hospital",
      referringHospitalId: hospital2Id,
      receivingHospitalId: hospital1Id,
      priority: "Routine",
      status: "pending-admin",
      referralToken: "XYZ789",
      stkSentCount: 0,
      createdAt: Date.now(),
    });

    return {
      message: "Initial data seeded successfully",
      hospitals: { hospital1Id, hospital2Id, hospital3Id },
      adminUserId,
      facilityAdmins: { facilityAdmin1Id, facilityAdmin2Id },
      physicians: { physician1UserId, physician2UserId },
      physicianProfiles: { physicianProfile1, physicianProfile2 },
      clinics: { clinic1Id, clinic2Id },
      referrals: { referral1Id, referral2Id },
    };
  },
});
