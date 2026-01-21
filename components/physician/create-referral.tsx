"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "../../lib/db";

interface CreateReferralProps {
  physician: any;
  token: string;
  onBack: () => void;
}

export default function CreateReferralPage({
  physician,
  token,
  onBack,
}: CreateReferralProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    medicalHistory: "",
    labResults: "",
    diagnosis: "",
    referringHospital: physician.hospital,
    receivingFacility: "",
    priority: "Routine" as "Routine" | "Urgent" | "Emergency",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importFileName, setImportFileName] = useState<string | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const text = await file.text();

    try {
      let parsed = "";
      if (ext === "json") {
        const j = JSON.parse(text);
        if (typeof j === "string") parsed = j;
        else if (j && typeof j.medicalHistory === "string") parsed = j.medicalHistory;
        else parsed = JSON.stringify(j, null, 2);
      } else if (ext === "csv") {
        // crude csv: take first non-header row, first column
        const rows = text.split(/\r?\n/).filter(Boolean);
        if (rows.length > 0) {
          const cols = rows[0].split(",");
          parsed = cols[0] || rows[0];
        } else parsed = text;
      } else {
        // txt, md or other text formats
        parsed = text;
      }

      setFormData((prev) => ({ ...prev, medicalHistory: parsed }));
    } catch (err) {
      alert("Failed to import file: " + String(err));
    }
  };

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const mockHospitals = [
    "Nairobi Central Hospital",
    "Mombasa County Hospital",
    "Kisumu District Hospital",
    "Nakuru Teaching Hospital",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Helper: generate 6-char alphanumeric token
      const generateToken = (length = 6) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let out = "";
        for (let i = 0; i < length; i++) {
          out += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return out;
      };

      // Reuse token if there's already a pending referral for the same patientId
      let token: string | undefined;
      const patientId = formData.patientId?.trim();
      if (patientId) {
        const existing = Array.from(db.referrals.values()).find((r: any) =>
          r.patientId && r.patientId === patientId &&
          (r.status === "pending-admin" || r.status === "Pending Admin Approval"),
        );
        if (existing) {
          token = existing.referralToken || existing.token || undefined;
          if (!token) {
            token = generateToken();
            existing.referralToken = token;
            db.referrals.set(existing.id, existing);
          }
        }
      }

      // Create referral
      const referralId = `ref-${Date.now()}`;
      const referral = {
        id: referralId,
        physicianId: physician.id,
        patientName: formData.patientName,
        patientId: formData.patientId || undefined,
        medicalHistory: formData.medicalHistory,
        labResults: formData.labResults,
        diagnosis: formData.diagnosis,
        referringHospital: formData.referringHospital,
        receivingFacility: formData.receivingFacility,
        priority: formData.priority,
        status: "pending-admin" as const,
        referralToken: token || generateToken(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.referrals.set(referralId, referral);
      // Notify other parts of the app (admin view) that a new referral was created
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("referral:created", { detail: referral }),
          );
        }
      } catch (e) {
        // ignore
      }
      setSuccess(true);

      setTimeout(() => {
        setFormData({
          patientName: "",
          patientId: "",
          medicalHistory: "",
          labResults: "",
          diagnosis: "",
          referringHospital: physician.hospital,
          receivingFacility: "",
          priority: "Routine",
        });
        setSuccess(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Create Patient Referral
          </h1>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card className="p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    placeholder="Enter patient full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Patient ID/MRN
                  </label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">
                Medical Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Patient Medical History *
                </label>
                <div className="flex gap-2 items-start">
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    required
                    placeholder="Include current symptoms, patient condition, and relevant medical history"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex flex-col gap-2 ml-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      className="hidden"
                      onChange={handleFileImport}
                    />
                    <button
                      type="button"
                      onClick={handleImportClick}
                      className="px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary hover:bg-background"
                    >
                      Import
                    </button>
                    {importFileName && (
                      <div className="text-xs text-text-secondary max-w-xs">
                        {importFileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Lab Results *
                  </label>
                  <textarea
                    name="labResults"
                    value={(formData as any).labResults}
                    onChange={handleChange}
                    required
                    placeholder="Enter lab/test results (e.g., X-ray, sputum)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Reason for Referral *
                  </label>
                  <textarea
                    name="diagnosis"
                    value={(formData as any).diagnosis}
                    onChange={handleChange}
                    required
                    placeholder="Provide reason for referral"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Referral Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">
                Referral Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Referring Hospital *
                  </label>
                  <input
                    type="text"
                    name="referringHospital"
                    value={formData.referringHospital}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Receiving Facility *
                  </label>
                  <select
                    name="receivingFacility"
                    value={formData.receivingFacility}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select receiving facility</option>
                    {mockHospitals.map((hospital) => (
                      <option key={hospital} value={hospital}>
                        {hospital}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Referral Priority *
                </label>
                <div className="flex gap-4">
                  {["Routine", "Urgent", "Emergency"].map((p) => (
                    <label key={p} className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={formData.priority === p}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                Referral created successfully! Awaiting administration approval.
              </div>
            )}

            <div className="flex gap-4 justify-end pt-4">
              <Button onClick={onBack} variant="outline">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Referral"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
