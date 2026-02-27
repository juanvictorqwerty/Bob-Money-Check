"use client"

import { loginStudent } from "@/actions/student";
import { inputStyle } from "@/utils/styles";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Login =()=>{

    const router=useRouter();

    const [form,setForm]=useState({
        email:'',
        password:''
    })

    const [error, setError] = useState<string>('');
    const [success,setSuccess]=useState(false);
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    // Monitor network status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        setIsOnline(navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit=async(e: React.SubmitEvent)=>{
        e.preventDefault();

        // Note: navigator.onLine can be unreliable on mobile, so we don't block based on it
        // Instead, we let the request try and handle errors properly

        setLoading(true);
        setError('');
        
        // Validate required fields
        if (!form.email || !form.password) {
            setError('Please enter email and password');
            setLoading(false);
            return;
        }
        
        const formData = new FormData();
        formData.append('email', form.email);
        formData.append('password', form.password);
        
        try {
            const result = await loginStudent(formData);

            if (result.success){
                setSuccess(true);
                setRedirecting(true);
                // Use window.location for more reliable redirect
                // Small delay to ensure cookie is set
                setTimeout(() => {
                    if (result.user?.role === 'Admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/';
                    }
                }, 100);
            } else {
                // Handle specific error types
                const errorMsg = result.error || '';
                if (errorMsg.toLowerCase().includes('network') || 
                    errorMsg.toLowerCase().includes('fetch') ||
                    errorMsg.toLowerCase().includes('failed to')) {
                    setError('Network error. Please check your connection and try again.');
                } else if (errorMsg.toLowerCase().includes('timeout')) {
                    setError('Request timed out. Please try again.');
                } else {
                    setError(result.error || "Invalid credentials. Please try again.");
                }
                setRetryCount(0);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            
            // Determine error message based on error type
            if (!navigator.onLine) {
                setError('No internet connection. Please check your network.');
            } else if (err.name === 'AbortError') {
                setError('Request timed out. Please try again.');
            } else {
                setError('Unable to connect to server. Please try again later.');
            }
        }
        
        setLoading(false);
    }

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError('');
        // Trigger form submission again
        const formEl = document.querySelector('form');
        if (formEl) {
            formEl.dispatchEvent(new Event('submit', { bubbles: true }));
        }
    };

    return(
        <div
        className="w-full rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden dark:bg-gray-700"
        >
            {/* Offline indicator */}
            {!isOnline && (
                <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-white text-center py-1 text-sm">
                    ⚠️ You're offline. Some features may not work.
                </div>
            )}
            
            <div className="flex flex-col justify-center items-center space-y-2 mt-2">
                <h2 className="text-2xl font-bold">Login</h2>
                <p className="text-slate-500">Enter details below.</p>
            </div>
            <form className="w-full mt-4 space-y-3" onSubmit={handleSubmit}>
                <div>
                    <input
                        className={inputStyle}
                        placeholder="email"
                        id="email"
                        name="email"
                        type="text"
                        inputMode="email"
                        autoComplete="email"
                        onChange={handleChange}
                        disabled={loading || !isOnline}
                    />
                </div>
                <div>
                    <input
                        className={inputStyle}
                        placeholder="Password"
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        onChange={handleChange}
                        disabled={loading || !isOnline}
                    />
                </div>
                {error && (
                    <div className="space-y-2">
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            {error}
                        </div>
                        {retryCount < 3 && (
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="w-full text-sm text-blue-500 hover:underline"
                            >
                                Tap to retry
                            </button>
                        )}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                        className="mr-2 w-4 h-4"
                        id="remember"
                        name="remember"
                        type="checkbox"
                        />
                        <span className="text-slate-500">Remember me </span>
                    </div>
                    <a className="text-blue-500 font-medium hover:underline" href="/forgotPassword">
                        Forgot Password
                    </a>
                </div>
                <button
                    className="w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="login"
                    name="login"
                    type="submit"
                    disabled={loading || !isOnline}
                >
                    {loading ? 'Logging in...' : !isOnline ? 'Offline' : 'Login'}
                </button>
                <p className="flex justify-center space-x-1">
                    <span className="text-slate-700 dark:text-slate-50"> Have an account? </span>
                    <Link className="text-blue-500 hover:underline" href="/auth/signUPnormal">
                        Sign Up
                    </Link>
                </p>
            </form>
            {/* Redirecting veil */}
            {redirecting && (
                <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex flex-col items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Redirecting...</p>
                </div>
            )}
        </div>
    )
}
export default Login;
