"use client"

import { getStudentInfo, updateStudentProfile, changePasswordAction, updateMatricule } from "@/actions/student";
import { DisconnectCurrentDevice, DisconnectAllDevices } from "@/actions/accountLogout";
import { inputStyle } from "@/utils/styles";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
    email: string;
    name: string;
    matricule: string | null;
    due_fees: number | null;
    excess_fees: number | null;
}

const AccountView = () => {
    const router = useRouter();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [loggingOut, setLoggingOut] = useState(false);
    const [message, setMessage] = useState<string>("");
    
    // Edit mode states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({ 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
    });
    const [profilePassword, setProfilePassword] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    
    // Matricule edit states
    const [isEditingMatricule, setIsEditingMatricule] = useState(false);
    const [matriculeForm, setMatriculeForm] = useState('');
    const [savingMatricule, setSavingMatricule] = useState(false);

    useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                const result = await getStudentInfo();
                
                if (!result) {
                    setError("Unable to fetch account information");
                    return;
                }
                
                if (!result.success) {
                    setError(result.message || "Failed to fetch student info");
                } else if (result.data) {
                    console.log("Data: ",result)
                    setStudentData(result.data);
                    setProfileForm({ name: result.data.name, email: result.data.email });
                    setMatriculeForm(result.data.matricule || '');
                }
            } catch (err) {
                setError("An error occurred while fetching your account");
            } finally {
                setLoading(false);
            }
        };

        fetchStudentInfo();
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        setMessage("");
        
        const result = await DisconnectCurrentDevice();
        
        if (result.success) {
            router.push("/auth/login");
        } else {
            setMessage(result.message || "Logout failed");
        }
        setLoggingOut(false);
    };

    const handleLogoutAllDevices = async () => {
        if (!confirm("Are you sure you want to log out from all devices?")) {
            return;
        }
        
        setLoggingOut(true);
        setMessage("");
        
        const result = await DisconnectAllDevices();
        
        if (result.success) {
            router.push("/auth/login");
        } else {
            setMessage(result.message || "Logout failed");
        }
        setLoggingOut(false);
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setMessage("");
        setSuccessMessage("");
        
        const formData = new FormData();
        formData.append('name', profileForm.name);
        formData.append('email', profileForm.email);
        formData.append('currentPassword', profilePassword);
        
        const result = await updateStudentProfile(formData);
        
        if (result.success) {
            setStudentData(prev => prev ? { ...prev, name: profileForm.name, email: profileForm.email } : null);
            setIsEditingProfile(false);
            setProfilePassword('');
            
            if (result.logoutOtherDevices) {
                setSuccessMessage("Email updated! You've been logged out from other devices.");
            } else {
                setSuccessMessage("Profile updated successfully!");
            }
            setTimeout(() => setSuccessMessage(""), 5000);
        } else {
            setMessage(result.error || "Failed to update profile");
        }
        
        setSavingProfile(false);
    };

    const handleCancelEdit = () => {
        if (studentData) {
            setProfileForm({ name: studentData.name, email: studentData.email });
        }
        setIsEditingProfile(false);
        setProfilePassword('');
        setMessage("");
    };

    const handleChangePassword = async () => {
        setChangingPassword(true);
        setMessage("");
        setSuccessMessage("");
        
        const formData = new FormData();
        formData.append('currentPassword', passwordForm.currentPassword);
        formData.append('newPassword', passwordForm.newPassword);
        formData.append('confirmPassword', passwordForm.confirmPassword);
        
        const result = await changePasswordAction(formData);
        
        if (result.success) {
            setIsChangingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
            if (result.logoutOtherDevices) {
                setSuccessMessage("Password changed! You've been logged out from other devices.");
            } else {
                setSuccessMessage("Password changed successfully!");
            }
            setTimeout(() => setSuccessMessage(""), 5000);
        } else {
            setMessage(result.error || "Failed to change password");
        }
        
        setChangingPassword(false);
    };

    const handleCancelPassword = () => {
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setMessage("");
    };
    
    const handleSaveMatricule = async () => {
        setSavingMatricule(true);
        setMessage("");
        setSuccessMessage("");
        
        const formData = new FormData();
        formData.append('matricule', matriculeForm);
        
        const result = await updateMatricule(formData);
        
        if (result.success) {
            setStudentData(prev => prev ? { ...prev, matricule: matriculeForm } : null);
            setIsEditingMatricule(false);
            setSuccessMessage("Matricule updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } else {
            setMessage(result.error || "Failed to update matricule");
        }
        
        setSavingMatricule(false);
    };
    
    const handleCancelMatricule = () => {
        setMatriculeForm(studentData?.matricule || '');
        setIsEditingMatricule(false);
        setMessage("");
    };

    if (loading) {
        return (
            <div className="w-full rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden dark:bg-gray-700">
                <div className="flex flex-col justify-center items-center space-y-4">
                    <div className="animate-pulse flex space-x-4">
                        <div className="h-12 w-12 bg-orange-400 rounded-full"></div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-300">Loading account info...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden dark:bg-gray-700">
                <div className="flex flex-col justify-center items-center space-y-4">
                    <div className="text-red-500 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="font-semibold">{error}</p>
                    </div>
                    <a 
                        href="/auth/login" 
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full rounded-lg shadow mt-4 sm:mt-10 h-auto p-4 sm:p-6 bg-white relative overflow-hidden dark:bg-gray-700">
            <div className="flex flex-col justify-center items-center space-y-2 mb-4 sm:mb-6">
                <div className="h-20 w-20 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                        {studentData?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-700 dark:text-gray-50">
                    My Account
                </h2>
                <p className="text-slate-500 dark:text-slate-300">Manage your account settings</p>
            </div>

            {message && (
                <div className="mb-4 p-3 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-center">
                    {message}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 rounded-md bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-center">
                    {successMessage}
                </div>
            )}

            <div className="space-y-4">
                {/* Profile Section */}
                <div className="bg-slate-50 dark:bg-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-50">Profile Information</h3>
                        {!isEditingProfile && (
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 dark:border-gray-500 pb-2 gap-2">
                            <span className="text-slate-500 dark:text-slate-300 font-medium min-w-fit">Name</span>
                            {isEditingProfile ? (
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    className="border border-slate-300 dark:border-gray-500 rounded px-2 py-1 text-slate-700 dark:text-gray-50 bg-white dark:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <span className="text-slate-700 dark:text-gray-50 font-semibold">
                                    {studentData?.name || "N/A"}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 dark:border-gray-500 pb-2 gap-2">
                            <span className="text-slate-500 dark:text-slate-300 font-medium min-w-fit">Email</span>
                            {isEditingProfile ? (
                                <div className="flex flex-col items-end gap-2 w-full">
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full border border-slate-300 dark:border-gray-500 rounded px-2 py-1 text-slate-700 dark:text-gray-50 bg-white dark:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="password"
                                        value={profilePassword}
                                        onChange={(e) => setProfilePassword(e.target.value)}
                                        className="w-full border border-slate-300 dark:border-gray-500 rounded px-2 py-1 text-slate-700 dark:text-gray-50 bg-white dark:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Password required"
                                    />
                                </div>
                            ) : (
                                <span className="text-slate-700 dark:text-gray-50 font-semibold">
                                    {studentData?.email || "N/A"}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-300 font-medium min-w-fit">Matricule</span>
                            {isEditingMatricule ? (
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={matriculeForm}
                                        onChange={(e) => setMatriculeForm(e.target.value)}
                                        className="flex-1 sm:flex-none sm:w-32 border border-slate-300 dark:border-gray-500 rounded px-2 py-1 text-slate-700 dark:text-gray-50 bg-white dark:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                                    />
                                    <button
                                        onClick={handleSaveMatricule}
                                        disabled={savingMatricule}
                                        className="px-2 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50"
                                    >
                                        {savingMatricule ? "..." : "✓"}
                                    </button>
                                    <button
                                        onClick={handleCancelMatricule}
                                        disabled={savingMatricule}
                                        className="px-2 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50"
                                    >
                                        ✗
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-slate-700 dark:text-gray-50 font-semibold truncate max-w-[150px] sm:max-w-none">
                                        {studentData?.matricule || "N/A"}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setMatriculeForm(studentData?.matricule || '');
                                            setIsEditingMatricule(true);
                                        }}
                                        className="text-blue-500 hover:text-blue-600 text-xs font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 dark:border-gray-500 pb-2 gap-2">
                            <span className="text-slate-500 dark:text-slate-300 font-medium min-w-fit">Due Fees</span>
                            <span className="text-slate-700 dark:text-gray-50 font-semibold">
                                {studentData?.due_fees !== null && studentData?.due_fees !== undefined 
                                    ? `${studentData.due_fees.toFixed(2)}` 
                                    : "N/A"}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-300 font-medium min-w-fit">Excess Fees</span>
                            <span className="text-slate-700 dark:text-gray-50 font-semibold">
                                {studentData?.excess_fees !== null && studentData?.excess_fees !== undefined 
                                    ? `${studentData.excess_fees.toFixed(2)}` 
                                    : "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* Edit Profile Buttons */}
                    {isEditingProfile && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-gray-500">
                            <button
                                onClick={handleSaveProfile}
                                disabled={savingProfile}
                                className="w-full sm:flex-1 py-2.5 sm:py-2 min-h-[44px] bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {savingProfile ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={savingProfile}
                                className="w-full sm:flex-1 py-2.5 sm:py-2 min-h-[44px] bg-gray-500 hover:bg-gray-600 active:bg-gray-700 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Password Change Section */}
                <div className="bg-slate-50 dark:bg-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-50">Password</h3>
                        {!isChangingPassword && (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                            >
                                Change Password
                            </button>
                        )}
                    </div>

                    {isChangingPassword && (
                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="block text-sm text-slate-500 dark:text-slate-300 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-gray-500 rounded px-3 py-2 text-slate-700 dark:text-gray-50 bg-white dark:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 dark:text-slate-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-gray-500 rounded px-3 py-2 text-slate-700 dark:text-gray-50 bg-white dark:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 dark:text-slate-300 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-gray-500 rounded px-3 py-2 text-slate-700 dark:text-gray-50 bg-white dark:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={changingPassword}
                                    className="w-full sm:flex-1 py-2.5 sm:py-2 min-h-[44px] bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {changingPassword ? "Changing..." : "Change Password"}
                                </button>
                                <button
                                    onClick={handleCancelPassword}
                                    disabled={changingPassword}
                                    className="w-full sm:flex-1 py-2.5 sm:py-2 min-h-[44px] bg-gray-500 hover:bg-gray-600 active:bg-gray-700 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-4">
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full justify-center py-2.5 min-h-[44px] bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white font-medium ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                    
                    <button
                        onClick={handleLogoutAllDevices}
                        disabled={loggingOut}
                        className="w-full justify-center py-2.5 min-h-[44px] bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-md text-white font-medium ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loggingOut ? "Processing..." : "Logout from all devices"}
                    </button>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-gray-600">
                    <a 
                        href="/" 
                        className="block text-center text-blue-500 hover:underline font-medium"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AccountView;
