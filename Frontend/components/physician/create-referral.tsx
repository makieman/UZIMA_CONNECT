"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

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
  const createReferral = useMutation(api.referrals.createReferral);

  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    medicalHistory: "",
    labResults: "",
    diagnosis: [] as string[],
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
    "Machakos Referral Hospital",
    "Kenyatta National Hospital (KNH)",
    "Mbagathi Hospital",
    "Memorial Hospital Armed Forces",
    "Mombasa County Hospital",
    "Kisumu District Hospital",
    "Nakuru Teaching Hospital",
  ];

  const diseases = [
    "malignant hypertension",
    "diabetic retinopathy",
    "diabetic nephropathy",
    "twin pregnancy",
    "gestational hypertension",
    "heart failure",
    "pulmonary hypertension",
    "syncope of unknown reason",
    "stroke",
    "parkinsons",
    "cerebral palsy",
    "peripheral neuropathy",
    "myasthenia gravis",
    // additional conditions requested
    "epilepsy",
    "multiple sclerosis",
    "poorly controlled diabetes",
    "pediatric diabetes",
    "goitre",
    "hyperthyroidism",
    "hypothyroidism",
    "cushings syndrome",
    "other endocrinology condition",
    "other neurologic condition",
    "fractures",
    "chronic obstructive pulmonary disease",
    "drug resistant tuberculosis (TB)",
    "severe asthma",
    "malignancy (cancer)",
    "possible liver cirrhosis",
    "gastroesophageal reflux disease",
    "peptic ulcer disease",
    "possible gastric cancer",
    "human immunodeficiency virus (AIDS)(HIV)",
    "chronic diarrhoea",
    "upper gastrointestinal bleeding (UGIB)",
    "lower gastrointestinal disease (LGIB)",
    "chronic kidney disease (dialysis)",
    "acute kidney failure",
    "Gum scrubbing",
    "nephrotic syndrome",
    "neurofibromatosis",
    "rheumatoid arthritis",
    "systemic lupus erythematosus",
    "gout refractory",
    "unexplained anemia",
    "leukemia",
    "lymphoma",
    "unexplained thrombophilia",
    "unexplained neutropenia",
    "multiple myeloma",
    "psychiatric illness",
    "major depressive disorder",
    "bipolar disorder",
    "substance use disorder",
    "endometriosis",
    "infertility",
    "erectile deficiency",
    "possible prostate cancer",
    "urinary incontinence",
    "chronic urinary retention",
    "kidney stones",
    "pyelonephritis",
    "severe dermatology condition",
    "chronic skin ulcers",
    "chronic pain",
    "chronic back pain",
    "chronic abdominal pain",
    "fibroids",
    // newly requested conditions
    "meningitis",
    "hydrocephalus",
    "head trauma",
    "unexplained bone pain",
    "encephalitis",
    "measles",
    "scarlet fever",
    "pemphigus",
    "complicated malaria",
    "chronic cough",
    "chronic conjunctivitis",
    "keratoconjunctivitis",
    "hepatitis",
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDiagnosis = (d: string) => {
    const dU = d.toUpperCase();
    const cur = Array.isArray(formData.diagnosis) ? [...formData.diagnosis] : [];
    if (cur.includes(dU)) {
      setFormData((prev) => ({
        ...prev,
        diagnosis: Array.isArray(prev.diagnosis) ? prev.diagnosis.filter((x) => x !== dU) : [],
      }));
      return;
    }
    if (cur.length >= 2) {
      alert("You can select up to 2 conditions");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      diagnosis: Array.isArray(prev.diagnosis) ? [...prev.diagnosis, dU] : [dU],
    }));
    // clear typed letters and hide the dropdown after a selection
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Basic validation for required fields when submitting via JS
    const selectedReasons = (formData as any).diagnosis;
    const hasReason = Array.isArray(selectedReasons)
      ? selectedReasons.length > 0
      : !!selectedReasons;
    if (!formData.patientName || !(formData as any).labResults || !hasReason) {
      setLoading(false);
      alert("Please fill required fields: Patient name, Lab results, and Reason for Referral.");
      return;
    }

    try {
      const physicianId = physician.id as Id<"physicians">;

      await createReferral({
        physicianId: physicianId,
        patientName: formData.patientName,
        patientId: formData.patientId || undefined,
        medicalHistory: formData.medicalHistory,
        labResults: formData.labResults,
        diagnosis: Array.isArray(formData.diagnosis)
          ? (formData.diagnosis as string[]).join("; ")
          : formData.diagnosis,
        referringHospital: formData.referringHospital,
        receivingFacility: formData.receivingFacility,
        priority: formData.priority as any,
        demoUserId: physician.userId,
      });

      setSuccess(true);

      setTimeout(() => {
        setFormData({
          patientName: "",
          patientId: "",
          medicalHistory: "",
          labResults: "",
          diagnosis: [],
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header handled by Layout, but adding a sub-header for this specific page context if needed, or just using main content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">Create Referral</h1>
          <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-semibold bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
            <span>←</span> Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Patient Information */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <h2 className="font-bold text-primary tracking-wide">Patient Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Patient Full Name *</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient full name"
                  className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Patient ID / MRN</label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Clinical Background */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                <h2 className="font-bold text-primary tracking-wide">Clinical Background</h2>
              </div>
              <div className="relative">
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
                  className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary px-2.5 py-1.5 rounded-lg shadow-sm active:scale-95 transition-transform uppercase tracking-tighter hover:bg-primary/90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Import
                </button>
              </div>
            </div>
            {importFileName && (
              <div className="text-xs text-green-600 mb-2 font-medium flex items-center gap-1">
                <span>✓</span> Imported: {importFileName}
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Medical History *</label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  required
                  placeholder="Include current symptoms, patient condition, and relevant medical history"
                  rows={4}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Lab Results *</label>
                <textarea
                  name="labResults"
                  value={(formData as any).labResults}
                  onChange={handleChange}
                  required
                  placeholder="Enter lab/test results (e.g., X-ray, sputum)"
                  rows={3}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Referral Configuration */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              <h2 className="font-bold text-primary tracking-wide">Referral Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Reason for Referral *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type the condition to search..."
                    className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all pr-10"
                    disabled={Array.isArray(formData.diagnosis) && formData.diagnosis.length >= 2}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                </div>

                {/* Dropdown for search results */}
                {searchTerm.trim().length > 0 && (
                  <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 relative">
                    <ul className="divide-y divide-gray-50">
                      {diseases
                        .filter((d) =>
                          d.toLowerCase().includes(searchTerm.toLowerCase()),
                        )
                        .map((d) => (
                          <li
                            key={d}
                            onClick={() => toggleDiagnosis(d)}
                            className={`p-3 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${Array.isArray((formData as any).diagnosis) && (formData as any).diagnosis.includes(d.toUpperCase()) ? "bg-blue-50 font-semibold text-primary" : "text-gray-700"
                              }`}
                          >
                            {d.toUpperCase()}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Selected diagnoses pills */}
                <div className="mt-3">
                  {Array.isArray((formData as any).diagnosis) && (formData as any).diagnosis.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {(formData as any).diagnosis.map((d: string) => (
                        <span
                          key={d}
                          onClick={() => toggleDiagnosis(d)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-xs font-semibold text-primary border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          {d}
                          <span className="text-blue-400 font-bold">×</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Referring Hospital *</label>
                  <input
                    type="text"
                    name="referringHospital"
                    value={formData.referringHospital}
                    readOnly
                    className="w-full bg-gray-100 border-transparent rounded-xl text-gray-600 px-4 py-3 text-sm font-medium focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Receiving Facility *</label>
                  <select
                    name="receivingFacility"
                    value={formData.receivingFacility}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 transition-all"
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

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Referral Priority *</label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Routine */}
                  <label className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.priority === 'Routine' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="Routine"
                      checked={formData.priority === 'Routine'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {formData.priority === 'Routine' && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>}
                    <span className={`material-icons-round mb-1 ${formData.priority === 'Routine' ? 'text-blue-500' : 'text-gray-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </span>
                    <span className={`text-[10px] font-bold ${formData.priority === 'Routine' ? 'text-blue-700' : 'text-gray-500'}`}>Routine</span>
                  </label>

                  {/* Urgent */}
                  <label className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.priority === 'Urgent' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="Urgent"
                      checked={formData.priority === 'Urgent'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {formData.priority === 'Urgent' && <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>}
                    <span className={`material-icons-round mb-1 ${formData.priority === 'Urgent' ? 'text-orange-500' : 'text-gray-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </span>
                    <span className={`text-[10px] font-bold ${formData.priority === 'Urgent' ? 'text-orange-700' : 'text-gray-500'}`}>Urgent</span>
                  </label>

                  {/* Emergency */}
                  <label className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.priority === 'Emergency' ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="Emergency"
                      checked={formData.priority === 'Emergency'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {formData.priority === 'Emergency' && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                    <span className={`material-icons-round mb-1 ${formData.priority === 'Emergency' ? 'text-red-500' : 'text-gray-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    </span>
                    <span className={`text-[10px] font-bold ${formData.priority === 'Emergency' ? 'text-red-700' : 'text-gray-500'}`}>Emergency</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="font-medium">Referral created successfully! Awaiting administration approval.</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-4 px-6 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl active:bg-gray-100 transition-colors hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] py-4 px-6 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Referral"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
