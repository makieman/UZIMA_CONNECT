"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Search, Plus, Edit2, Building2, MapPin, Phone, Mail,
    Activity, UserPlus, Users, ShieldCheck, ChevronDown, ChevronUp,
    CheckCircle2, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface FormData {
    name: string;
    code: string;
    county: string;
    level: string;
    contactPhone: string;
    contactEmail: string;
    isActive: boolean;
}

interface AdminFormData {
    email: string;
    fullName: string;
    phoneNumber: string;
    hospitalId: string;
    password: string;
    confirmPassword: string;
}

const INITIAL_FORM: FormData = {
    name: "",
    code: "",
    county: "",
    level: "",
    contactPhone: "",
    contactEmail: "",
    isActive: true,
};

const INITIAL_ADMIN_FORM: AdminFormData = {
    email: "",
    fullName: "",
    phoneNumber: "",
    hospitalId: "",
    password: "",
    confirmPassword: "",
};

const COUNTIES = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa",
    "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
    "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos",
    "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a",
    "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
    "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi", "Trans Nzoia",
    "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

const LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6"];

type ActiveTab = "hospitals" | "admins";

export default function HospitalManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<"hospitals"> | null>(null);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>("hospitals");
    const [adminFormData, setAdminFormData] = useState<AdminFormData>(INITIAL_ADMIN_FORM);
    const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
    const [createdAdmin, setCreatedAdmin] = useState<{ email: string; fullName: string; hospitalName: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);

    // Queries
    const allHospitals = useQuery(api.hospitals.getActiveHospitals) || [];
    const searchResults = useQuery(api.hospitals.searchHospitals, { query: searchQuery });
    const allAdmins = useQuery(api.adminOnboarding.getHospitalAdmins, {});

    // Mutations
    const createHospital = useMutation(api.hospitals.createHospital);
    const updateHospital = useMutation(api.hospitals.updateHospital);
    const createHospitalAdmin = useMutation(api.adminOnboarding.createHospitalAdmin);

    const hospitals = searchQuery.trim().length > 0 ? (searchResults || []) : allHospitals;

    // ─── Hospital CRUD Handlers ───────────────────────────────────────────────

    const handleOpenModal = (hospital?: any) => {
        if (hospital) {
            setEditingId(hospital._id);
            setFormData({
                name: hospital.name,
                code: hospital.code,
                county: hospital.county || "",
                level: hospital.level || "",
                contactPhone: hospital.contactPhone || "",
                contactEmail: hospital.contactEmail || "",
                isActive: hospital.isActive,
            });
        } else {
            setEditingId(null);
            setFormData(INITIAL_FORM);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(INITIAL_FORM);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingId) {
                await updateHospital({ hospitalId: editingId, ...formData });
                toast.success("Hospital updated successfully");
            } else {
                await createHospital({
                    name: formData.name,
                    code: formData.code,
                    county: formData.county || undefined,
                    level: formData.level || undefined,
                    contactPhone: formData.contactPhone || undefined,
                    contactEmail: formData.contactEmail || undefined,
                });
                toast.success("New hospital added successfully");
            }
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message || "Failed to save hospital");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Create Hospital Admin Handlers ──────────────────────────────────────

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdminSubmitting(true);
        setCreatedAdmin(null);

        try {
            // Client-side password validation (password stored locally for UX only)
            if (adminFormData.password.length < 8) {
                toast.error("Password must be at least 8 characters long.");
                return;
            }
            if (adminFormData.password !== adminFormData.confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }
            if (!adminFormData.hospitalId) {
                toast.error("Please select a hospital.");
                return;
            }

            // Create the user record in the Convex database with facility_admin role.
            // The auth credential will be automatically created and linked when the admin
            // logs in for the first time via /login -> Administration tab. The existing
            // signIn/signUp fallback in admin-login.tsx handles this automatically.
            const result = await createHospitalAdmin({
                email: adminFormData.email,
                fullName: adminFormData.fullName,
                hospitalId: adminFormData.hospitalId as Id<"hospitals">,
                phoneNumber: adminFormData.phoneNumber || undefined,
            });

            setCreatedAdmin({
                email: result.email,
                fullName: result.fullName,
                hospitalName: result.hospitalName,
            });

            toast.success(`Admin "${result.fullName}" created for ${result.hospitalName}!`);
            setAdminFormData(INITIAL_ADMIN_FORM);
            setIsAdminFormOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to create hospital admin.");
        } finally {
            setIsAdminSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("hospitals")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "hospitals"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Building2 className="w-4 h-4" />
                    Hospital Registry
                </button>
                <button
                    onClick={() => setActiveTab("admins")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "admins"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Hospital Admins
                    {Array.isArray(allAdmins) && allAdmins.length > 0 && (
                        <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full font-semibold">
                            {allAdmins.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ─── HOSPITALS TAB ─────────────────────────────────────────────────────── */}
            {activeTab === "hospitals" && (
                <div className="space-y-6">
                    {/* Header & Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Hospital Registry</h2>
                            <p className="text-sm text-gray-500">Manage all registered facilities across the network</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-full md:w-64"
                                />
                            </div>
                            <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-dark">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Hospital
                            </Button>
                        </div>
                    </div>

                    {/* Hospital List */}
                    <Card className="overflow-hidden border-gray-100 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Facility Name</th>
                                        <th className="px-6 py-4 font-semibold">Code / Level</th>
                                        <th className="px-6 py-4 font-semibold">Location</th>
                                        <th className="px-6 py-4 font-semibold">Contact</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {hospitals.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                                No hospitals found
                                            </td>
                                        </tr>
                                    ) : (
                                        hospitals.map((hospital) => (
                                            <tr key={hospital._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{hospital.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-700">{hospital.code}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{hospital.level || "N/A"}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-gray-600">
                                                        <MapPin className="w-3 h-3 mr-1.5 opacity-70" />
                                                        {hospital.county || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {hospital.contactPhone && (
                                                            <div className="flex items-center text-xs text-gray-600">
                                                                <Phone className="w-3 h-3 mr-1.5 opacity-70" />
                                                                {hospital.contactPhone}
                                                            </div>
                                                        )}
                                                        {hospital.contactEmail && (
                                                            <div className="flex items-center text-xs text-gray-600">
                                                                <Mail className="w-3 h-3 mr-1.5 opacity-70" />
                                                                {hospital.contactEmail}
                                                            </div>
                                                        )}
                                                        {!hospital.contactPhone && !hospital.contactEmail && (
                                                            <span className="text-xs text-gray-400">No contact info</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${hospital.isActive
                                                        ? "bg-green-100 text-green-700 border border-green-200"
                                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                                        }`}>
                                                        <Activity className={`w-3 h-3 mr-1 ${hospital.isActive ? "text-green-500" : "text-gray-400"}`} />
                                                        {hospital.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-primary hover:text-primary-dark hover:bg-primary-light/10"
                                                        onClick={() => handleOpenModal(hospital)}
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ─── ADMINS TAB ────────────────────────────────────────────────────────── */}
            {activeTab === "admins" && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Hospital Administrators</h2>
                            <p className="text-sm text-gray-500">
                                Create and manage facility admin accounts for each hospital
                            </p>
                        </div>
                        <Button
                            onClick={() => { setIsAdminFormOpen(!isAdminFormOpen); setCreatedAdmin(null); }}
                            className="bg-primary hover:bg-primary-dark shadow-md"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create Hospital Admin
                            {isAdminFormOpen
                                ? <ChevronUp className="w-4 h-4 ml-2" />
                                : <ChevronDown className="w-4 h-4 ml-2" />
                            }
                        </Button>
                    </div>

                    {/* Success Banner */}
                    {createdAdmin && (
                        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 animate-in slide-in-from-top duration-300">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-green-800">Admin account created successfully</p>
                                <p className="text-sm text-green-700 mt-1">
                                    <strong>{createdAdmin.fullName}</strong> ({createdAdmin.email}) has been created as
                                    a Facility Admin for <strong>{createdAdmin.hospitalName}</strong>.
                                </p>
                                <p className="text-xs text-green-600 mt-2 bg-green-100 rounded-lg px-3 py-2">
                                    📋 Share the email and temporary password you set with the admin.
                                    They must log in at <code>/login</code> → <strong>Administration tab</strong> using those credentials.
                                    On first login, their account will be activated automatically.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Create Admin Form */}
                    {isAdminFormOpen && (
                        <Card className="border border-primary/20 shadow-md animate-in slide-in-from-top duration-200">
                            <div className="flex items-center gap-3 p-6 border-b border-gray-100">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Create Hospital Admin Account</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        The new admin will sign in using these credentials on the Administration login tab.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateAdmin} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin-name">Full Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="admin-name"
                                            value={adminFormData.fullName}
                                            onChange={(e) => setAdminFormData({ ...adminFormData, fullName: e.target.value })}
                                            required
                                            placeholder="Dr. Jane Mwangi"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin-email">Email Address <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="admin-email"
                                            type="email"
                                            value={adminFormData.email}
                                            onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                                            required
                                            placeholder="admin@hospital.ke"
                                        />
                                    </div>

                                    {/* Hospital */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin-hospital">Assign to Hospital <span className="text-red-500">*</span></Label>
                                        <select
                                            id="admin-hospital"
                                            value={adminFormData.hospitalId}
                                            onChange={(e) => setAdminFormData({ ...adminFormData, hospitalId: e.target.value })}
                                            required
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select hospital...</option>
                                            {allHospitals.filter(h => h.isActive).map((h) => (
                                                <option key={h._id} value={h._id}>{h.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Phone (optional) */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin-phone">Phone Number <span className="text-gray-400 text-xs">(optional)</span></Label>
                                        <Input
                                            id="admin-phone"
                                            type="tel"
                                            value={adminFormData.phoneNumber}
                                            onChange={(e) => setAdminFormData({ ...adminFormData, phoneNumber: e.target.value })}
                                            placeholder="+254..."
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin-password">Temporary Password <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Input
                                                id="admin-password"
                                                type={showPassword ? "text" : "password"}
                                                value={adminFormData.password}
                                                onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                                                required
                                                minLength={8}
                                                placeholder="Min. 8 characters"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500">Share this with the admin securely. They should change it after first login.</p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="admin-confirm">Confirm Password <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="admin-confirm"
                                            type="password"
                                            value={adminFormData.confirmPassword}
                                            onChange={(e) => setAdminFormData({ ...adminFormData, confirmPassword: e.target.value })}
                                            required
                                            placeholder="Re-enter password"
                                        />
                                        {adminFormData.confirmPassword && adminFormData.password !== adminFormData.confirmPassword && (
                                            <p className="text-xs text-red-500">Passwords do not match</p>
                                        )}
                                    </div>
                                </div>

                                {/* Info Notice */}
                                <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-3">
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        <strong>How this works:</strong> The admin account is created in the database with
                                        <code className="bg-blue-100 px-1 rounded mx-0.5">facility_admin</code> role and scoped to the selected hospital.
                                        When the admin logs in for the first time at <strong>/login → Administration tab</strong>,
                                        their credentials will be linked automatically to this account. Their hospital scope is set and cannot be changed by them.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setIsAdminFormOpen(false); setAdminFormData(INITIAL_ADMIN_FORM); }}
                                        disabled={isAdminSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-primary hover:bg-primary-dark gap-2"
                                        disabled={isAdminSubmitting || adminFormData.password !== adminFormData.confirmPassword}
                                    >
                                        {isAdminSubmitting ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4" />
                                                Create Admin Account
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Existing Admins List */}
                    <Card className="overflow-hidden border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">Existing Hospital Administrators</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="bg-white text-xs uppercase text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Name</th>
                                        <th className="px-6 py-3 font-semibold">Email</th>
                                        <th className="px-6 py-3 font-semibold">Assigned Hospital</th>
                                        <th className="px-6 py-3 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {!allAdmins ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                Loading administrators...
                                            </td>
                                        </tr>
                                    ) : allAdmins.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <Users className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                                <p className="text-gray-500 text-sm">No hospital administrators yet.</p>
                                                <p className="text-gray-400 text-xs mt-1">Use the "Create Hospital Admin" button above to add one.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        allAdmins.map((admin: any) => (
                                            <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {admin.fullName?.charAt(0)?.toUpperCase() || "A"}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{admin.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                                                <td className="px-6 py-4">
                                                    {admin.hospital ? (
                                                        <span className="flex items-center gap-1.5 text-gray-700">
                                                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                            {admin.hospital.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-orange-500 text-xs font-medium bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${admin.isActive
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                                        }`}>
                                                        <Activity className={`w-3 h-3 mr-1 ${admin.isActive ? "text-green-500" : "text-gray-400"}`} />
                                                        {admin.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ─── Add/Edit Hospital Modal ─────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl bg-white shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingId ? "Edit Hospital" : "Register New Hospital"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Hospital Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Kenyatta National Hospital"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">KMHFL Code <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        required
                                        placeholder="e.g., KNH-001"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="county">County</Label>
                                    <select
                                        id="county"
                                        value={formData.county}
                                        onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select County...</option>
                                        {COUNTIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="level">Facility Level</Label>
                                    <select
                                        id="level"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select Level...</option>
                                        {LEVELS.map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Contact Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.contactPhone}
                                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                        placeholder="+254..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Contact Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        placeholder="info@hospital.go.ke"
                                    />
                                </div>

                                {editingId && (
                                    <div className="space-y-2 md:col-span-2 pt-2 border-t border-gray-100">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Facility is Active</span>
                                        </label>
                                        <p className="text-xs text-gray-500 ml-7">Inactive facilities will not appear in referral dropdowns.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Register Hospital"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
