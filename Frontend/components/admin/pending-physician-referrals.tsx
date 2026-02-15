"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function PendingPhysicianReferrals({ user }: { user?: any }) {
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showBiodataModal, setShowBiodataModal] = useState(false);
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [biodataForm, setBiodataForm] = useState({
    patientPhone: "",
    stkPhoneNumber: "",
    patientDateOfBirth: "",
    patientNationalId: "",
    bookedDate: "",
  });
  const [editPhoneData, setEditPhoneData] = useState({
    patientPhone: "",
    stkPhoneNumber: "",
  });
  const [resending, setResending] = useState<string | null>(null);

  const pendingReferrals = useQuery(api.referrals.getPendingReferrals, {
    demoUserId: user?.id
  });
  const updateReferral = useMutation(api.referrals.updateReferralStatus);
  const saveBiodata = useMutation(api.referrals.saveBiodata);
  const updatePhoneNumbers = useMutation(api.referrals.updatePhoneNumbers);
  const incrementStk = useMutation(api.referrals.incrementStkCount);
  const createPayment = useMutation(api.payments.createPayment);
  const callMpesaStk = useAction(api.mpesaApi.callMpesaStkPush);

  const [biodataCode, setBiodataCode] = useState<string | null>(null);

  const generateBiodataCode = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const referrals = pendingReferrals || [];

  const handleStartBiodata = (referral: any) => {
    setSelectedReferral(referral);
    setBiodataForm({
      patientPhone: referral.patientPhone || "",
      stkPhoneNumber: referral.stkPhoneNumber || "",
      patientDateOfBirth: referral.patientDateOfBirth || "",
      patientNationalId: referral.patientNationalId || "",
      bookedDate: referral.bookedDate || "",
    });
    setShowBiodataModal(true);
    setBiodataCode(generateBiodataCode());
  };

  const handleSaveBiodata = async () => {
    if (!selectedReferral) return;
    if (!biodataForm.patientPhone || !biodataForm.stkPhoneNumber) {
      alert("Please fill in patient phone and STK phone number");
      return;
    }

    setLoading(true);
    try {
      await saveBiodata({
        referralId: selectedReferral._id,
        patientPhone: biodataForm.patientPhone,
        stkPhoneNumber: biodataForm.stkPhoneNumber,
        patientDateOfBirth: biodataForm.patientDateOfBirth,
        patientNationalId: biodataForm.patientNationalId,
        bookedDate: biodataForm.bookedDate,
        biodataCode: biodataCode || undefined,
        demoUserId: user?.id,
      });

      // ACTUAL M-PESA STK PUSH API CALL
      console.log("📱 Calling M-Pesa STK Push API...");
      const mpesaResponse = await callMpesaStk({
        phoneNumber: biodataForm.stkPhoneNumber,
        amount: 1,
        referralId: selectedReferral._id,
        patientName: selectedReferral.patientName,
        useTestCallback: false
      });

      console.log("📡 M-Pesa Response:", mpesaResponse);

      // IMPORTANT: Record a pending payment using the CheckoutRequestID so the STK callback
      // can find it and trigger post-payment SMS/updates.
      const checkoutRequestId =
        (mpesaResponse as any)?.analysis?.checkoutRequestId ??
        (mpesaResponse as any)?.apiResponse?.CheckoutRequestID ??
        (mpesaResponse as any)?.checkoutRequestId;

      if ((mpesaResponse as any)?.success && checkoutRequestId) {
        await createPayment({
          phoneNumber: biodataForm.stkPhoneNumber,
          amount: 1,
          referralId: selectedReferral._id,
          status: "pending",
          stkRequestId: checkoutRequestId,
        });
      } else if ((mpesaResponse as any)?.success) {
        console.warn(
          "STK push succeeded but CheckoutRequestID was missing; callback matching may fail."
        );
      }

      await incrementStk({ referralId: selectedReferral._id, demoUserId: user?.id });

      setShowBiodataModal(false);
      setSelectedReferral(null);
      setBiodataCode(null);

      if (mpesaResponse.success) {
        alert(`✅ STK Push sent successfully to ${biodataForm.stkPhoneNumber}!\n\nResponse: ${(mpesaResponse as any).analysis?.responseDesc || 'Check your phone for M-Pesa prompt'}`);
      } else {
        const errorMsg = (mpesaResponse as any).error || (mpesaResponse as any).analysis?.responseDesc || "Unknown M-Pesa error";
        alert(`⚠️ STK Push failed!\n\nError: ${errorMsg}\n\nTroubleshooting:\n1. Phone format: 254XXXXXXXXX\n2. Check M-Pesa credentials\n3. Sandbox needs test number`);
      }
    } catch (err) {
      console.log("[v0] Error:", err);
      alert("Error processing referral");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhone = (referral: any) => {
    setSelectedReferral(referral);
    setEditPhoneData({
      patientPhone: referral.patientPhone || "",
      stkPhoneNumber: referral.stkPhoneNumber || "",
    });
    setShowEditPhoneModal(true);
  };

  const handleSaveEditPhone = async () => {
    if (!selectedReferral) return;

    setLoading(true);
    try {
      await updatePhoneNumbers({
        referralId: selectedReferral._id,
        patientPhone: editPhoneData.patientPhone,
        stkPhoneNumber: editPhoneData.stkPhoneNumber,
        demoUserId: user?.id,
      });
      setShowEditPhoneModal(false);
      setSelectedReferral(null);
      alert("Phone numbers updated successfully");
    } catch (err) {
      alert("Error updating phone numbers");
    } finally {
      setLoading(false);
    }
  };

  const handleResendSTK = async (referral: any) => {
    if (!referral.stkPhoneNumber) {
      alert("STK phone number not set");
      return;
    }

    setResending(referral._id);
    try {
      // ACTUAL M-PESA STK PUSH API CALL
      console.log("📱 Resending M-Pesa STK Push...");
      const mpesaResponse = await callMpesaStk({
        phoneNumber: referral.stkPhoneNumber,
        amount: 1,
        referralId: referral._id,
        patientName: referral.patientName,
        useTestCallback: false
      });

      console.log("📡 M-Pesa Resend Response:", mpesaResponse);
      await incrementStk({ referralId: referral._id, demoUserId: user?.id });

      if (mpesaResponse.success) {
        alert(`✅ STK resent to ${referral.stkPhoneNumber}!`);
      } else {
        alert(`⚠️ STK resend failed: ${(mpesaResponse as any).error || (mpesaResponse as any).analysis?.responseDesc}`);
      }
    } catch (err) {
      alert("Error resending STK");
    } finally {
      setResending(null);
    }
  };

  const handleConfirmPayment = async (referral: any) => {
    try {
      await updateReferral({
        referralId: referral._id,
        status: "paid",
        demoUserId: user?.id,
      });
      alert("Referral confirmed and moved to completed referrals!");
    } catch (err) {
      alert("Error confirming payment");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Routine":
        return "bg-green-100 text-green-800";
      case "Urgent":
        return "bg-yellow-100 text-yellow-800";
      case "Emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">
          Pending Physician Referrals
        </h2>
      </div>

      {referrals.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-text-secondary">
            No pending referrals at the moment
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {referrals.map((referral) => (
            <Card key={referral._id} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Patient Name
                  </p>
                  <p className="font-semibold">{referral.patientName}</p>
                  <p className="text-xs text-text-secondary">
                    ID: {referral.patientId || "N/A"}
                  </p>
                </div>
                <div className="flex items-center">
                  {referral.referralToken && (
                    <div className="ml-auto text-sm font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {referral.referralToken}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Referral Type
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(referral.priority)}`}
                  >
                    {referral.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Status</p>
                  <p className="font-semibold">
                    {referral.status === "pending-admin" &&
                      "Awaiting Administration Action"}
                    {referral.status === "awaiting-biodata" &&
                      "Awaiting Biodata"}
                    {referral.status === "pending-payment" && "Pending Payment"}
                    {referral.status === "confirmed" && "Confirmed"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-border">
                <div>
                  <p className="text-xs text-text-secondary mb-1">From</p>
                  <p className="text-sm">{referral.referringHospital}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">To</p>
                  <p className="text-sm">{referral.receivingFacility}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-text-secondary mb-2">
                  Medical History & Test Results
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-primary">
                    View Medical Details
                  </summary>
                  <div className="mt-2 p-3 bg-surface rounded space-y-2">
                    <div>
                      <p className="font-medium text-xs">History:</p>
                      <p className="text-xs text-text-secondary">
                        {referral.medicalHistory}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs">Lab Results:</p>
                      <p className="text-xs text-text-secondary">
                        {referral.labResults}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs">Diagnosis:</p>
                      <p className="text-xs text-text-secondary">
                        {referral.diagnosis}
                      </p>
                    </div>
                  </div>
                </details>
              </div>

              {referral.status !== "pending-admin" && (
                <div className="mb-4 p-3 bg-surface rounded space-y-2">
                  <p className="text-xs font-semibold">Payment Information</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-text-secondary">Patient Phone:</p>
                      <p className="font-mono">{referral.patientPhone}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">STK Phone:</p>
                      <p className="font-mono">{referral.stkPhoneNumber}</p>
                    </div>
                  </div>
                  {referral.bookedDate && (
                    <div className="text-xs">
                      <p className="text-text-secondary">Booked: {referral.bookedDate}</p>
                    </div>
                  )}
                  {referral.status === "pending-payment" && (
                    <p className="text-xs text-warning">
                      STK sent {referral.stkSentCount} time(s)
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {referral.status === "pending-admin" && (
                  <Button
                    onClick={() => handleStartBiodata(referral)}
                    className="bg-primary text-white hover:opacity-90"
                  >
                    Add Biodata & Send STK
                  </Button>
                )}

                {referral.status === "pending-payment" && (
                  <>
                    <Button
                      onClick={() => handleResendSTK(referral)}
                      disabled={resending === referral._id}
                      className="btn-secondary text-xs"
                    >
                      {resending === referral._id ? "Sending..." : "Resend STK"}
                    </Button>
                    <Button
                      onClick={() => handleEditPhone(referral)}
                      className="btn-secondary text-xs"
                    >
                      Edit Phone Numbers
                    </Button>
                    <Button
                      onClick={() => handleConfirmPayment(referral)}
                      className="bg-success text-white hover:opacity-90 text-xs"
                    >
                      Mark as Paid
                    </Button>
                  </>
                )}

                {referral.status === "confirmed" && (
                  <div className="text-xs text-success font-semibold">
                    ✓ Referral Completed
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Biodata Modal */}
      {showBiodataModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-2xl w-full bg-background">
            <h3 className="text-lg font-bold mb-4">
              Add Patient Biodata & Send STK
            </h3>
            {biodataCode && (
              <p className="text-sm font-mono mb-2">
                Referral Code: <span className="font-bold">{biodataCode}</span>
              </p>
            )}
            <p className="text-xs text-text-secondary mb-4">
              Patient: {selectedReferral.patientName}
            </p>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Patient Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={biodataForm.patientPhone}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        patientPhone: e.target.value,
                      })
                    }
                    className="input-base"
                    placeholder="+254712345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone for STK Prompt *
                  </label>
                  <input
                    type="tel"
                    value={biodataForm.stkPhoneNumber}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        stkPhoneNumber: e.target.value,
                      })
                    }
                    className="input-base"
                    placeholder="+254712345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={biodataForm.patientDateOfBirth}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        patientDateOfBirth: e.target.value,
                      })
                    }
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    National ID
                  </label>
                  <input
                    type="text"
                    value={biodataForm.patientNationalId}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        patientNationalId: e.target.value,
                      })
                    }
                    className="input-base"
                    placeholder="e.g., 12345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booked Date
                  </label>
                  <input
                    type="date"
                    value={biodataForm.bookedDate}
                    onChange={(e) =>
                      setBiodataForm({
                        ...biodataForm,
                        bookedDate: e.target.value,
                      })
                    }
                    className="input-base"
                  />
                </div>

              </div>
            </div>

            <div className="flex gap-2 mt-6 justify-end">
              <Button
                onClick={() => setShowBiodataModal(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBiodata}
                className="bg-primary text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Processing..." : "Send STK Prompt"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Phone Modal */}
      {showEditPhoneModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full bg-background">
            <h3 className="text-lg font-bold mb-4">Edit Phone Numbers</h3>
            <p className="text-xs text-text-secondary mb-4">
              Referral: {selectedReferral.patientName}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Patient Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhoneData.patientPhone}
                  onChange={(e) =>
                    setEditPhoneData({
                      ...editPhoneData,
                      patientPhone: e.target.value,
                    })
                  }
                  className="input-base"
                  placeholder="+254712345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  STK Receiving Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhoneData.stkPhoneNumber}
                  onChange={(e) =>
                    setEditPhoneData({
                      ...editPhoneData,
                      stkPhoneNumber: e.target.value,
                    })
                  }
                  className="input-base"
                  placeholder="+254712345678"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6 justify-end">
              <Button
                onClick={() => setShowEditPhoneModal(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditPhone}
                className="bg-primary text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
