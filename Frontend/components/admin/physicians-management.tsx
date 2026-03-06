"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plus, UserPlus, FileEdit, CheckCircle2, ChevronRight, Edit, Eye, EyeOff } from "lucide-react";

export default function PhysiciansManagement({ user }: { user?: any }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        licenseId: "",
        specialization: "",
        initialPassword: ""
    });

    // Edit state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    // Success Credentials State
    const [successCredentials, setSuccessCredentials] = useState<{ licenseId: string, password: string } | null>(null);

    const physicians = useQuery(api.physicians.getAllPhysicians) || [];
    const createPhysicianUser = useMutation(api.adminOnboarding.createPhysicianUser);
    const updatePhysicianUser = useMutation(api.adminOnboarding.updatePhysicianUser);

    const filteredPhysicians = physicians.filter(physician =>
        physician.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        physician.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        physician.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddPhysician = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPhysicianUser(formData);
            setSuccessCredentials({
                licenseId: formData.licenseId,
                password: formData.initialPassword
            });
            setIsAddOpen(false);
            setFormData({ fullName: "", email: "", phoneNumber: "", licenseId: "", specialization: "", initialPassword: "" });
        } catch (error: any) {
            alert(error.message || "Failed to add physician.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (physician: any) => {
        setEditData({
            userId: physician.userId,
            physicianId: physician._id,
            fullName: physician.user?.fullName || "",
            email: physician.user?.email || "",
            phoneNumber: physician.user?.phoneNumber || "",
            licenseId: physician.licenseId || "",
            specialization: physician.specialization || "",
            isActive: physician.user?.isActive !== false
        });
        setIsEditOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleEditPhysician = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updatePhysicianUser(editData);
            setIsEditOpen(false);
            setEditData(null);
        } catch (error: any) {
            alert(error.message || "Failed to edit physician.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        Physicians
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Manage facility physicians</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#0f4a8a] hover:bg-[#0c3e75] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Physician
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary" />
                                Onboard New Physician
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddPhysician} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Dr. Jane Doe"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="doctor@hospital.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder="+254700000000"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="licenseId">Medical License ID</Label>
                                <Input
                                    id="licenseId"
                                    name="licenseId"
                                    placeholder="KMPDC-12345"
                                    required
                                    value={formData.licenseId}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    name="specialization"
                                    placeholder="Cardiology, General Practice, etc."
                                    required
                                    value={formData.specialization}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="initialPassword">Initial Password</Label>
                                <div className="relative">
                                    <Input
                                        id="initialPassword"
                                        name="initialPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a temporary password"
                                        required
                                        minLength={6}
                                        value={formData.initialPassword}
                                        onChange={handleChange}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500">The physician will use this to log in the first time.</p>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-primary text-white">
                                    {loading ? "Registering..." : "Onboard Physician"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Physician Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileEdit className="w-5 h-5 text-primary" />
                                Edit Physician Details
                            </DialogTitle>
                        </DialogHeader>
                        {editData && (
                            <form onSubmit={handleEditPhysician} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-fullName">Full Name</Label>
                                    <Input
                                        id="edit-fullName"
                                        name="fullName"
                                        required
                                        value={editData.fullName}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email Address</Label>
                                    <Input
                                        id="edit-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={editData.email}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                                    <Input
                                        id="edit-phoneNumber"
                                        name="phoneNumber"
                                        required
                                        value={editData.phoneNumber}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-licenseId">Medical License ID</Label>
                                    <Input
                                        id="edit-licenseId"
                                        name="licenseId"
                                        required
                                        value={editData.licenseId}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-specialization">Specialization</Label>
                                    <Input
                                        id="edit-specialization"
                                        name="specialization"
                                        required
                                        value={editData.specialization}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="edit-isActive"
                                        checked={editData.isActive}
                                        onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="edit-isActive">Account is Active</Label>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-primary text-white">
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Success Credentials Dialog */}
                <Dialog open={!!successCredentials} onOpenChange={(open) => !open && setSuccessCredentials(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-6 h-6" />
                                Registration Successful
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <p className="text-sm text-slate-600">
                                The physician has been onboarded successfully. Please securely share these login credentials with them:
                            </p>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">License ID</p>
                                    <p className="font-mono text-slate-900 bg-white border border-slate-200 py-1.5 px-3 rounded-lg select-all">
                                        {successCredentials?.licenseId}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Password</p>
                                    <p className="font-mono text-slate-900 bg-white border border-slate-200 py-1.5 px-3 rounded-lg select-all">
                                        {successCredentials?.password}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2">
                                <strong>Important:</strong> Ensure the physician logs in and changes their password from their dashboard settings once logged in.
                            </p>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={() => setSuccessCredentials(null)} className="w-full">
                                I have saved these credentials
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search physicians..."
                            className="pl-9 bg-slate-50 border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium tracking-wider">Name</th>
                                <th className="px-6 py-4 font-medium tracking-wider">License ID</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Specialty</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Email</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredPhysicians.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No physicians found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPhysicians.map((physician) => (
                                    <tr key={physician._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {physician.user?.fullName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                            {physician.licenseId}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {physician.specialization || "General"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {physician.user?.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${physician.user?.isActive !== false
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                : "bg-slate-100 text-slate-700 border border-slate-200"
                                                }`}>
                                                {physician.user?.isActive !== false ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClick(physician)}
                                                className="text-slate-500 hover:text-blue-600"
                                            >
                                                <Edit className="w-4 h-4" />
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
    );
}
