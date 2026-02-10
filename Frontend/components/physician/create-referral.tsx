"use client";

import type React from "react";

import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation, useAction } from "convex/react";
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
  // @ts-ignore
  const summarizeAI = useAction(api.gemini.summarizeMedicalHistory);
  // @ts-ignore
  const ocrAI = useAction(api.vision.ocrMedicalImage);

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
  const scanInputRef = useRef<HTMLInputElement | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showAISuccess, setShowAISuccess] = useState(false);
  const [aiInsightsCount, setAiInsightsCount] = useState(0);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [aiSummary, setAiSummary] = useState<{ history: string; labs: string } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleAISummarize = async (overrideText?: string) => {
    const textToSummarize = overrideText || formData.medicalHistory;

    if (!textToSummarize) {
      alert("Please enter some medical history or import a document first.");
      return;
    }

    setIsSummarizing(true);
    try {
      const result = await summarizeAI({
        text: textToSummarize,
      });

      if (result.success && result.parsed) {
        setAiSummary({
          history: result.parsed.medicalHistory || "",
          labs: result.parsed.labResults || "",
        });
        setIsSummaryVisible(true);

        // Count some "insights" for the UI (words in summary)
        const insightsCount = (result.parsed.medicalHistory?.split(/\s+/).length || 0) +
          (result.parsed.labResults?.split(/\s+/).length || 0);
        setAiInsightsCount(Math.min(15, Math.max(5, Math.floor(insightsCount / 10))));
        setShowAISuccess(true);
      } else {
        alert("AI Summarization failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error calling AI: " + String(err));
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    if (ext === "pdf") {
      setLoading(true);
      try {
        // Dynamic import to avoid SSR errors with DOMMatrix
        const pdfjsLib = await import("pdfjs-dist");
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        setIsExtracting(true);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (pdf.numPages === 0) {
          alert("The uploaded PDF has no pages.");
          setLoading(false);
          setIsExtracting(false);
          return;
        }

        console.log(`PDF loaded: ${pdf.numPages} pages`);
        let extractedText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // @ts-ignore
            const pageText = textContent.items.map((item: any) => (item as any).str).join(" ");
            extractedText += pageText + "\n";
            console.log(`Page ${i}: ${pageText.length} chars`);
          } catch (pageErr) {
            console.error(`Error parsing page ${i}:`, pageErr);
          }
        }

        console.log(`Total Extracted: ${extractedText.length} characters`);
        if (!extractedText.trim()) {
          alert("We couldn't find any text in this PDF. If it's a scanned image, please type the summary manually.");
        } else {
          setFormData((prev) => ({ ...prev, medicalHistory: extractedText }));
          // Automatically trigger AI summarization with the immediate text
          handleAISummarize(extractedText);
        }
      } catch (err) {
        alert("Failed to parse PDF: " + String(err));
        console.error("PDF Parse Error:", err);
      } finally {
        setLoading(false);
        setIsExtracting(false);
      }
      return;
    }

    const text = await file.text();
    try {
      let parsed = "";
      if (ext === "json") {
        const j = JSON.parse(text);
        if (typeof j === "string") parsed = j;
        else if (j && typeof j.medicalHistory === "string") parsed = j.medicalHistory;
        else parsed = JSON.stringify(j, null, 2);
      } else if (ext === "csv") {
        const rows = text.split(/\r?\n/).filter(Boolean);
        if (rows.length > 0) {
          const cols = rows[0].split(",");
          parsed = cols[0] || rows[0];
        } else parsed = text;
      } else {
        parsed = text;
      }

      setFormData((prev) => ({ ...prev, medicalHistory: parsed }));
    } catch (err) {
      alert("Failed to import file: " + String(err));
    }
  };

  const handleScanRecord = async (eOrBase64: React.ChangeEvent<HTMLInputElement> | string) => {
    let base64 = "";
    let fileName = "Scanned Image";

    if (typeof eOrBase64 === "string") {
      base64 = eOrBase64;
    } else {
      const file = eOrBase64.target.files?.[0];
      if (!file) return;
      fileName = file.name;
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      base64 = await base64Promise;
    }

    setImportFileName(`Scan: ${fileName}`);
    setIsExtracting(true);
    setIsCameraOpen(false);

    try {
      if (!base64 || base64.trim().length < 100) {
        console.error("OCR Error: Invalid or empty image data.");
        alert("Image not ready yet. Please try scanning again.");
        setIsExtracting(false);
        return;
      }

      console.log("Starting OCR scan, data length:", base64.length);
      const result = await ocrAI({
        imageBase64: base64,
        demoUserId: physician.userId,
      });

      if (result.success && result.text) {
        console.log("OCR successful, text length:", result.text.length);
        setFormData((prev) => ({ ...prev, medicalHistory: result.text }));

        // 3. Automatically trigger AI summarization with extracted text
        await handleAISummarize(result.text);
      } else {
        alert("OCR failed: " + (result.error || result.message || "No text detected."));
      }
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Error scanning record: " + String(err));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      handleScanRecord(imageSrc);
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
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Referral</h1>
          <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-semibold bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors self-end sm:self-auto">
            <span>←</span> Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Patient Information */}
          <section className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
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
              <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 relative overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => handleAISummarize()}
                  disabled={isSummarizing}
                  className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-1.5 sm:px-3 py-1.5 rounded-lg shadow-md active:scale-95 transition-all uppercase tracking-tighter hover:opacity-90 border border-white/20 flex-shrink-0 ${isSummarizing ? "animate-pulse opacity-70" : "animate-pulse-subtle"}`}
                  title="AI Summarize"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
                  <span className="whitespace-nowrap">{isSummarizing ? "Summ..." : "AI Summarize"}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json,.csv,.pdf"
                  className="hidden"
                  onChange={handleFileImport}
                />
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white bg-primary px-1.5 sm:px-2.5 py-1.5 rounded-lg shadow-sm active:scale-95 transition-transform uppercase tracking-tighter hover:bg-primary/90 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  <span className="whitespace-nowrap">Import</span>
                </button>
                <input
                  ref={scanInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleScanRecord}
                />
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 sm:px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all uppercase tracking-tighter hover:bg-slate-200 flex-shrink-0 ml-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  <span className="whitespace-nowrap">Scan</span>
                </button>
              </div>
            </div>

            {/* Camera Modal */}
            {isCameraOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg relative flex flex-col items-center">
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => setIsCameraOpen(false)}
                      className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                  </div>

                  <div className="w-full relative aspect-video bg-black flex items-center justify-center">
                    {!isCameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                        <div className="text-white text-center">
                          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p className="text-sm">Loading camera...</p>
                        </div>
                      </div>
                    )}
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                      videoConstraints={{ facingMode: "environment" }}
                      onUserMedia={() => setIsCameraReady(true)}
                      onUserMediaError={() => {
                        alert("Camera access denied or not available.");
                        setIsCameraOpen(false);
                      }}
                    />
                  </div>

                  <div className="p-6 w-full flex flex-col items-center gap-4 bg-white dark:bg-slate-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Scan Medical Document</h3>
                    <div className="flex w-full gap-3">
                      <button
                        onClick={handleCapture}
                        disabled={!isCameraReady}
                        className={`flex-1 ${isCameraReady ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2`}
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-white"></div>
                        {isCameraReady ? 'Capture Photo' : 'Loading...'}
                      </button>
                      <button
                        onClick={() => scanInputRef.current?.click()}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl border border-slate-200 active:scale-95 transition-transform"
                      >
                        Upload Image
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                      Align document within the frame. Ensure good lighting for best OCR results.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {importFileName && (
              <div className="text-xs text-green-600 mb-2 font-medium flex items-center gap-1">
                <span>✓</span> Imported: {importFileName}
              </div>
            )}
            <div className={`space-y-5 transition-all duration-500 ease-in-out`}>
              <div className="flex flex-col gap-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Medical Notes / Raw Data *</label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  required
                  placeholder="Input all patient data for AI Summarization."
                  className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-sm min-h-[120px] transition-all focus:outline-none focus:ring-2"
                />
              </div>

              {/* AI SUMMARY BLOCK - Inline Expansion */}
              {isSummaryVisible && aiSummary && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-500">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            medicalHistory: aiSummary.history,
                            labResults: aiSummary.labs
                          }));
                          setIsSummaryVisible(false);
                        }}
                        className="text-[10px] font-bold bg-white dark:bg-slate-800 text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        Apply AI Summary
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-indigo-600 p-1 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">AI Clinical Insights</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Summarized History</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          "{aiSummary.history}"
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Extracted Lab Findings</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          "{aiSummary.labs}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Lab Results *</label>
                <textarea
                  name="labResults"
                  value={formData.labResults}
                  onChange={handleChange}
                  required
                  placeholder="Enter lab/test results (e.g., X-ray, sputum)"
                  className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-sm min-h-[100px] transition-all focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Referral Configuration */}
          <section className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
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

                  {/* Dropdown for search results */}
                  {searchTerm.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
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
                </div>

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

      {/* PDF Extraction Loading Modal */}
      {isExtracting && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-white/10 overflow-hidden">
            {/* Animated Background Pulse */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-cyan-400/5 animate-pulse"></div>

            <div className="relative z-10">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-bounce"></div>
                  <div className="relative w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl border-4 border-blue-50/50 dark:border-slate-700/50">
                    <svg className="w-10 h-10 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Extracting Clinical Data</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Parsing PDF document and identifying medical history patterns...</p>

              {/* Modern Progress Bar */}
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-2/3 rounded-full animate-infinite-scroll"></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                <span>Reading Pages</span>
                <span className="animate-pulse">Processing...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Success Modal */}
      {showAISuccess && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-300"></div>
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 text-center border border-white/20 animate-in zoom-in-95 duration-300">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Extraction Successful
                </h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
                  <span className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold">{aiInsightsCount} insights identified</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pt-2">
                  AI has finished analyzing the clinical document. Key medical history and vital signs have been extracted.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowAISuccess(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Review Summary
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
                <button
                  onClick={() => setShowAISuccess(false)}
                  className="w-full py-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
