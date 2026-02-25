// app/forgot-password/page.tsx (or pages/forgot-password.tsx)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequestRecoveryForm } from '@/components/RequestRecoveryForm';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';
import { SuccessMessage } from '@/components/SuccessMessage';

type Step = 'request' | 'reset' | 'success';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('request');
    const [email, setEmail] = useState('');

    const handleEmailSent = (sentEmail: string) => {
        setEmail(sentEmail);
        setStep('reset');
    };

    const handleResetSuccess = () => {
        setStep('success');
    };

    const handleBack = () => {
        setStep('request');
        setEmail('');
    };

    const handleGoToLogin = () => {
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            {/* Progress indicator */}
            <div className="mb-8">
            <div className="flex items-center justify-between text-sm">
                <div className={`flex items-center gap-2 ${step === 'request' ? 'text-blue-400 font-medium' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'request' ? 'bg-blue-900' : step === 'reset' || step === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
                    {step === 'reset' || step === 'success' ? '✓' : '1'}
                </div>
                <span className="hidden sm:inline">Email</span>
                </div>
                
                <div className={`flex-1 h-0.5 mx-4 ${step === 'reset' || step === 'success' ? 'bg-blue-600' : 'bg-gray-700'}`} />
                
                <div className={`flex items-center gap-2 ${step === 'reset' ? 'text-blue-400 font-medium' : step === 'success' ? 'text-gray-500' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'reset' ? 'bg-blue-900' : step === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
                    {step === 'success' ? '✓' : '2'}
                </div>
                <span className="hidden sm:inline">Reset</span>
                </div>

                <div className={`flex-1 h-0.5 mx-4 ${step === 'success' ? 'bg-blue-600' : 'bg-gray-700'}`} />
                
                <div className={`flex items-center gap-2 ${step === 'success' ? 'text-blue-400 font-medium' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-blue-900' : 'bg-gray-700'}`}>
                    3
                </div>
                <span className="hidden sm:inline">Done</span>
                </div>
            </div>
            </div>

            {/* Step content */}
            {step === 'request' && (
            <RequestRecoveryForm onEmailSent={handleEmailSent} />
            )}

            {step === 'reset' && (
            <ResetPasswordForm 
                email={email} 
                onSuccess={handleResetSuccess}
                onBack={handleBack}
            />
            )}

            {step === 'success' && (
            <SuccessMessage onLogin={handleGoToLogin} />
            )}
        </div>
        </div>
    );
}