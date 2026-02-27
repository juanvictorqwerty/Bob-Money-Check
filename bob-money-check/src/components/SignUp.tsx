"use client"
import { inputStyle } from "@/utils/styles";
import { useState, useEffect } from "react";
import { signupStudent } from "@/actions/student";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignUP =()=>{
    const router=useRouter();
    const [form,setForm]=useState({
        email:'',
        name:'',
        password:'',
        confirmPassword:'',
        matricule:''
    });
    
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

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        
        // Check network status first
        if (!navigator.onLine) {
            setError('No internet connection. Please check your network and try again.');
            return;
        }

        setLoading(true);
        setError('');
        
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate required fields
        if (!form.email || !form.name || !form.password || !form.matricule) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }
        
        const formData = new FormData();
        formData.append('email', form.email);
        formData.append('name',form.name);
        formData.append('password', form.password);
        formData.append('matricule', form.matricule);
        
        try {
            const result = await signupStudent(formData);

            if (result.success){
                setSuccess(true);
                setRedirecting(true);
                // Use window.location for more reliable redirect
                // Small delay to ensure cookie is set
                setTimeout(() => {
                    window.location.href = '/';
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
                    setError(result.error || "Something went wrong. Please try again.");
                }
                setRetryCount(0);
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            
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
        console.log('Basic Form:', form);
    };

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
                <h2 className="text-2xl font-bold text-slate-700 dark:text-gray-50">Sign UP</h2>
                <p className="text-slate-500">Enter details below.</p>
            </div>
            <form className="w-full mt-4 space-y-3" onSubmit={handleSubmit}>
                <div>
                    <input
                        className={inputStyle}
                        placeholder="Email"
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        onChange={handleChange}
                        disabled={loading || !isOnline}
                    />
                </div>
                <div>
                    <input
                        className={inputStyle}
                        placeholder="name"
                        id="name"
                        name="name"
                        type="text"
                        inputMode="text"
                        autoComplete="name"
                        onChange={handleChange}
                        disabled={loading || !isOnline}
                    />
                </div>
                <div>
                    <input
                        className={inputStyle}
                        placeholder="Matricule"
                        id="matricule"
                        name="matricule"
                        type="text"
                        inputMode="text"
                        autoComplete="off"
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
                        autoComplete="new-password"
                        onChange={handleChange}
                        disabled={loading || !isOnline}
                    />
                </div>
                <div>
                    <input
                        className={inputStyle}
                        placeholder="Confirm password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        onChange={handleChange}
                        disabled={loading || !isOnline}
                    />
                </div>
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
                    <a className="text-blue-500 font-medium hover:underline" href="#">
                        Forgot Password
                    </a>
                </div>
                {error && (
                    <div className="space-y-2">
                        <p className="text-red-500 text-sm text-center">{error}</p>
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
                <button
                    className="w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="login"
                    name="login"
                    type="submit"
                    disabled={loading || !isOnline}
                >
                    {loading ? 'Signing up...' : !isOnline ? 'Offline' : 'Sign up'}
                </button>
                <p className="flex justify-center">
                    <span className="text-slate-700 dark:text-gray-50"> Have an account?  </span>
                    <Link className="text-blue-500 hover:underline" href="/auth/login">
                        Login
                    </Link>
                </p>
            </form>
            {/* Redirecting veil */}
            {redirecting && (
                <div className="absolute inset-0 bg-white/90 dark:bg-gray-700/90 flex flex-col items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Redirecting...</p>
                </div>
            )}
        </div>
    )
}
export default SignUP;
