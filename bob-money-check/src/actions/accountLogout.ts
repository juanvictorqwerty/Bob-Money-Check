"use server"

import { logout, logoutAllExcept, MassiveLogout } from "@/utils/authFunction"
import { cookies } from "next/headers";

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
