"use server"

import { logout, logoutAllExcept, MassiveLogout, SignIn, LoginResult, SendRecoveryCode, ResetPassword } from "@/utils/authFunction"
import { cookies } from "next/headers";

export async function Login(formData:FormData) {
    const email=formData.get('email') as string;
    const password=formData.get('password') as string;

    try{
        console.log("Login: ",formData);
        const result: LoginResult = await SignIn(email, password);
        
        if (!result.success || !result.token) {
            return { success: false, error: result.error || 'Invalid credentials' };
        }
        
        //cookie set
        const cookieStore = await cookies();
        cookieStore.set('authToken', result.token.jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge:60*60*24*300
        });
        
        console.log("Login typed")
        return { 
            success: true, 
            token: result.token.jwtToken,
            user: result.user // Include user info for role-based redirect
        };

    }catch(error){
        console.error(error)
        return{success:false,error:'Error try again'}
    }
}

export async function DisconnectCurrentDevice() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }

    try{
        const result = await logout(authToken);
        if(!result){
            return { success: false, message: "Something went wrong" };
        }
        // Clear the cookie
        cookieStore.set("authToken", "", { expires: new Date(0), path: "/" });
        return { success: true, message: "You have been disconnected from this device successfully" };
    }catch(error){
        console.error(error);
        return { success: false, message: "Internal error" };
    }
}

export async function DisconnectAllDevices() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }

    try{
        const result = await MassiveLogout(authToken);
        if(!result){
            return { success: false, message: "Something went wrong" };
        }
        // Clear the cookie
        cookieStore.set("authToken", "", { expires: new Date(0), path: "/" });
        return { success: true, message: "Massive disconnection successful" };
    }catch(error){
        console.error(error);
        return { success: false, message: "Internal error" };
    }
}

export async function DisconnectAllExceptOne() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }
    
    try{
        const result = await logoutAllExcept(authToken);
        if(!result){
            return { success: false, message: "Something went wrong" };
        }
        return { success: true, message: "All others disconnected" };
    }catch(error){
        console.error(error);
        return { success: false, message: "Internal error" };
    }
}

export async function RequestRecoveryEmail(email:string) {
    const result= await SendRecoveryCode(email)
    if(!result.success){
        return {success:false,message:result.message}
    }
    return{success:true,message:result.message}
}

export async function UpdatePassword(email:string,code:number,newPassword:string) {
    const result= await ResetPassword(email,code,newPassword)
    
    if(!result.success){
        return{success:false,message:result.message}
    }
    return{success:true,message:result.message}
}