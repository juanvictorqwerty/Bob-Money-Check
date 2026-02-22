'use server'

import { CreateAdmin } from "@/utils/authFunction";
import { cookies } from "next/headers";

export async function SignUpAdmin(formData:FormData) {
    
    const email = formData.get('email') as string;
    const code = formData.get('code') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    console.log(code)
    const response = await CreateAdmin(email,name, password, code)

    if (!response.success){
        return {success:false,message:response.message}
    }
    
    // Set the auth token cookie
    const cookieStore = await cookies();
    cookieStore.set('authToken', response.message, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, 
        path: '/',
    });
    
    return {success:true,message:"Welcome Admin"}
}