// components/RequestRecoveryForm.tsx
'use client';

import { useState } from 'react';
import { RequestRecoveryEmail } from '@/actions/accountCommonFunctions'; // adjust path as needed

interface RequestRecoveryFormProps {
  onEmailSent: (email: string) => void;
}

export function RequestRecoveryForm({ onEmailSent }: RequestRecoveryFormProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

    try {
        const result = await RequestRecoveryEmail(email);
        
        if (result.success) {
            onEmailSent(email);
        } else {
            setError(result.message || 'Failed to send recovery email');
        }
        } catch (err) {
        setError('An unexpected error occurred');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-white">Reset Password</h2>
        <p className="text-gray-300 mb-6">
            Enter your email address and we'll send you a recovery code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-300 mb-1"
            >
                Email Address
            </label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-700 text-white placeholder-gray-400"
                placeholder="you@example.com"
            />
            </div>

            {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
            </div>
            )}

            <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
                </>
            ) : (
                'Send Recovery Code'
            )}
            </button>
        </form>
        </div>
    );
}