"use client"

import { inputStyle } from "@/utils/styles";
import { Preahvihear } from "next/font/google";
import { useState } from "react";

const Login =()=>{

    const [form,setForm]=useState({
        email:'',
        password:''
    })

    const [error, setError] = useState<string>('');
    const [success,setSuccess]=useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
        setForm(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit=async(e: React.SubmitEvent)=>{
        e.preventDefault();
        console.log('submitted',form)
    }

    return(
        <div
        className="w-full rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden dark:bg-gray-700"
        >
        <div className="flex flex-col justify-center items-center space-y-2">
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
                onChange={handleChange}
            />
            </div>
            <div>
            <input
                className={inputStyle}
                placeholder="Password"
                id="password"
                name="password"
                type="password"
                onChange={handleChange}
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
            <a className="text-blue-500 font-medium hover:underline" href="#"
                >Forgot Password</a
            >
            </div>
            <button
            className="w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2"
            id="login"
            name="login"
            type="submit"
            >
            login
            </button>
            <p className="flex justify-center space-x-1">
            <span className="text-slate-700 dark:text-slate-50"> Have an account? </span>
            <a className="text-blue-500 hover:underline" href="#">Sign Up</a>
            </p>
        </form>
        </div>
    )
}
export default Login;