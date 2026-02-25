// components/SuccessMessage.tsx
'use client';

interface SuccessMessageProps {
  onLogin: () => void;
}

export function SuccessMessage({ onLogin }: SuccessMessageProps) {
    return (
        <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-white">Password Reset!</h2>
        <p className="text-gray-300 mb-6">
            Your password has been successfully updated. You can now log in with your new password.
        </p>

        <button
            onClick={onLogin}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
            Go to Login
        </button>
        </div>
    );
}