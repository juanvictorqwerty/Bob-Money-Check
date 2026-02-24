'use client';

import { useState } from 'react';
import { sendClearance } from '@/actions/student';

interface ClearanceData {
    id: string;
    date: string;
}

interface ClearanceListProps {
    clearances: {
        success: boolean;
        message: string | ClearanceData[];
    };
}

export default function ClearanceList({ clearances }: ClearanceListProps) {
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string } | null>(null);

    const handleSendEmail = async (licenceId: string) => {
        setSendingId(licenceId);
        setEmailStatus(null);
        
        try {
            const result = await sendClearance(licenceId);
            if (!result) {
                setEmailStatus({ success: false, message: 'Failed to send email' });
                return;
            }
            const message = result.success 
                ? 'Email sent successfully!' 
                : ('error' in result ? result.error : 'Failed to send email');
            setEmailStatus({ success: result.success, message });
        } catch (error) {
            setEmailStatus({ success: false, message: 'Failed to send email' });
        } finally {
            setSendingId(null);
        }
    };

    if (!clearances.success) {
        const errorMessage = typeof clearances.message === 'string' ? clearances.message : 'An error occurred';
        return (
            <div className="w-full p-4 mt-4 text-red-600 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">{errorMessage}</p>
                </div>
            </div>
        );
    }

    const clearanceItems = clearances.message as ClearanceData[];

    if (!Array.isArray(clearanceItems) || clearanceItems.length === 0) {
        return (
            <div className="w-full p-4 mt-4 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">No clearances found</p>
                </div>
            </div>
        );
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Show email status message
    if (emailStatus) {
        return (
            <div className={`w-full p-4 mt-4 border rounded-lg shadow-sm ${
                emailStatus.success 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : 'bg-red-50 border-red-200 text-red-600'
            }`}>
                <div className="flex items-center gap-2">
                    {emailStatus.success ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <p className="font-medium">{emailStatus.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mt-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-50">Your Clearances</h3>
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700">
                {clearanceItems.map((item, index) => (
                    <div 
                        key={index} 
                        className={`flex items-center justify-between p-4 ${index !== clearanceItems.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors dark:hover:bg-gray-900 duration-150`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">ID: {item.id}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-200">{formatDate(item.date)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleSendEmail(item.id)}
                            disabled={sendingId === item.id}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {sendingId === item.id ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Send PDF
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 text-right">
                Total: {clearanceItems.length} clearance{clearanceItems.length !== 1 ? 's' : ''}
            </p>
        </div>
    );
}
