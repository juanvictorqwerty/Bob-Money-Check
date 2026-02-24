'use server'

import { GiveAdminClearance, SeeAllClearances, SeeAllUsedReceipts, seeAllStudents, toggleClearanceStatus } from "@/utils/adminFuntions";
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
        maxAge: 60 * 60 * 24 * 60, 
        path: '/',
    });
    
    return {success:true,message:"Welcome Admin"}
}

export async function giveExceptionalClearance(studentEmail:string) {
    
    const cookieStore=await cookies();
    const authToken=cookieStore.get("authToken")?.value

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }

    const response=await GiveAdminClearance(authToken,studentEmail)
    if(!response.success){
        return {success:false,message:response.message}
    }
    return{success:true,message:response.message,data:response.data}
}

export async function GetAllClearances() {
    
    const cookieStore=await cookies();
    const authToken=cookieStore.get("authToken")?.value

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }
    const response=await SeeAllClearances(authToken)
    if(!response.success){
        return {success:false,message:response.message}
    }
    return{success:true,message:response.message}
}

export async function GetAllReceipts() {
    
    const cookieStore=await cookies();
    const authToken=cookieStore.get("authToken")?.value

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }
    const response=await SeeAllUsedReceipts(authToken)
    if(!response.success){
        return {success:false,message:response.message}
    }
    return{success:true,message:response.message}
}

export async function GetAllStudents() {
    
    const cookieStore=await cookies();
    const authToken=cookieStore.get("authToken")?.value

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }
    const response=await seeAllStudents(authToken)
    if(!response.success){
        return {success:false,message:response.message}
    }
    return{success:true,message:response.message}
}

export async function ToggleClearance(clearanceId:string, activate:boolean) {
    
    const cookieStore=await cookies();
    const authToken=cookieStore.get("authToken")?.value

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }
    const response=await toggleClearanceStatus(authToken,clearanceId,activate)
    if(!response.success){
        return {success:false,message:response.message}
    }
    return{success:true,message:response.message}
}