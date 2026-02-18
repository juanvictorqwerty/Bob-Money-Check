"use client"
import { inputStyle } from "@/utils/styles";
import { useState } from "react";
import { signupStudent } from "@/actions/student";
import { useRouter } from "next/navigation";

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
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
        setForm(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
    }
    
    const formData = new FormData();
    formData.append('email', form.email);
    formData.append('name',form.name);
    formData.append('password', form.password);
    formData.append('matricule', form.matricule);
    
    const result=await signupStudent(formData)

    if (result.success){
        setSuccess(true);
        router.push('/')
    }else{
        setError(result.error||"Oupsi!")
    }
    console.log('Basic Form:', form);
    console.log(result)
    };

    return(
        <div
        className="w-full rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden dark:bg-gray-700"
        >
            <div className="flex flex-col justify-center items-center space-y-2">
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
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <input
                        className={inputStyle}
                        placeholder="name"
                        id="name"
                        name="name"
                        type="text"
                        onChange={handleChange}
                    />
                </div>
                <div>
                <input
                    className={inputStyle}
                    placeholder="Matricule"
                    id="matricule"
                    name="matricule"
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
                <div>
                <input
                    className={inputStyle}
                    placeholder="Confirm password"
                    id="confirmPassword"
                    name="confirmPassword"
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
                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                className="w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2"
                id="login"
                name="login"
                type="submit"
                >
                Sign up
                </button>
                <p className="flex justify-center">
                <span className="text-slate-700 dark:text-gray-50"> Have an account?  </span>
                <a className="text-blue-500 hover:underline" href="#">Login</a>
                </p>
            </form>
        </div>
    )
}
export default SignUP;
