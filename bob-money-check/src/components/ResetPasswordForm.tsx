// components/ResetPasswordForm.tsx
'use client';

import { useState } from 'react';
import { UpdatePassword } from '@/actions/accountCommonFunctions'; // adjust path as needed

interface ResetPasswordFormProps {
    email: string;
    onSuccess: () => void;
    onBack: () => void;
}

export function ResetPasswordForm({ email, onSuccess, onBack }: ResetPasswordFormProps) {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
        }

        if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
        }

        setIsLoading(true);

        try {
        const result = await UpdatePassword(email, parseInt(code), newPassword);
        
        if (result.success) {
            onSuccess();
        } else {
            setError(result.message || 'Failed to reset password');
        }
        } catch (err) {
        setError('An unexpected error occurred');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
        <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-200 mb-4 flex items-center gap-1 transition"
        >
            ← Back to email
        </button>

        <h2 className="text-2xl font-bold mb-2 text-white">Enter Recovery Code</h2>
        <p className="text-gray-300 mb-6">
            We sent a code to <span className="font-medium text-white">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label 
                htmlFor="code" 
                className="block text-sm font-medium text-gray-300 mb-1"
            >
                Recovery Code
            </label>
            <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest bg-gray-700 text-white placeholder-gray-400"
                placeholder="000000"
            />
            </div>

            <div>
            <label 
                htmlFor="newPassword" 
                className="block text-sm font-medium text-gray-300 mb-1"
            >
                New Password
            </label>
            <div className="relative">
                <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10 bg-gray-700 text-white placeholder-gray-400"
                placeholder="••••••••"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                {showPassword ? '🙈' : '👁️'}
                </button>
            </div>
            </div>

            <div>
            <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-300 mb-1"
            >
                Confirm New Password
            </label>
            <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-700 text-white placeholder-gray-400"
                placeholder="••••••••"
            />
            </div>

            {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
            </div>
            )}

            <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resetting...
                </>
            ) : (
                'Reset Password'
            )}
            </button>
        </form>
        </div>
    );
}