"use client"

import { getStudentInfo } from "@/actions/student";
import { DisconnectCurrentDevice, DisconnectAllDevices } from "@/actions/accountLogout";
import { inputStyle } from "@/utils/styles";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
    email: string;
    name: string;
    matricule: string | null;
}

const AccountView = () => {
    const router = useRouter();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [loggingOut, setLoggingOut] = useState(false);
    const [message, setMessage] = useState<string>("");

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
                    setStudentData(result.data);
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
        <div className="w-full rounded-lg shadow mt-10 h-auto p-6 bg-white relative overflow-hidden dark:bg-gray-700">
            <div className="flex flex-col justify-center items-center space-y-2 mb-6">
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

            <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-gray-600 rounded-lg p-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-500 pb-2">
                            <span className="text-slate-500 dark:text-slate-300 font-medium">Name</span>
                            <span className="text-slate-700 dark:text-gray-50 font-semibold">
                                {studentData?.name || "N/A"}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-500 pb-2">
                            <span className="text-slate-500 dark:text-slate-300 font-medium">Email</span>
                            <span className="text-slate-700 dark:text-gray-50 font-semibold">
                                {studentData?.email || "N/A"}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-slate-300 font-medium">Matricule</span>
                            <span className="text-slate-700 dark:text-gray-50 font-semibold">
                                {studentData?.matricule || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full justify-center py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white font-medium ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                    
                    <button
                        onClick={handleLogoutAllDevices}
                        disabled={loggingOut}
                        className="w-full justify-center py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-md text-white font-medium ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
