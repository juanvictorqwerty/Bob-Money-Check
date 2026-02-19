'use server'; // ← Mark as server action

import { CreateStudent, SignInStudent, changePassword } from '@/utils/authFunction'; 
import { getStudentData } from '@/utils/manageStudents';
import {cookies} from 'next/headers';
import { db } from '@/utils/db';
import { users, student, token } from '../../drizzle/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function signupStudent(formData: FormData) {
    const email = formData.get('email') as string;
    const matricule = formData.get('matricule') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
        console.log("Form", formData)
        const token = await CreateStudent(email, matricule, password, name);

        if (!token) {
            return { success: false, error: 'Failed to create student' };
        }

        //set cookie
        const cookieStore = await cookies();
        cookieStore.set('authToken', token, {
            httpOnly: true, //prevents JS access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return { success: true, token: token };
    } catch (error) {
        console.error(error)
        return { success: false, error: 'Failed to create student' };
    }
}

export async function loginStudent(formData:FormData) {
    const email=formData.get('email') as string;
    const password=formData.get('password') as string;

    try{
        console.log("Login: ",formData);
        const token = await SignInStudent(email, password);
        if (!token) {
            return { success: false, error: 'Invalid credentials' };
        }
        //cookie set
        const cookieStore = await cookies();
        cookieStore.set('authToken', token.jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        console.log("Login typed")
        return { success: true, token: token.jwtToken };

    }catch(error){
        console.error(error)
        return{success:false,error:'Error try again'}
    }
}

//it serves more like a controller
export async function getStudentInfo() {
    const cookieStore=await cookies();
    const authToken= cookieStore.get("authToken")?.value

    if (!authToken) {
        return { success: false, message: "No authentication token found" };
    }

    const result=await getStudentData(authToken)
    if(!result){
        return{success:false,message:"No such student in our records"}
    }
    
    return { success: true, data: result };
}

export async function updateStudentProfile(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;
    
    if (!authToken) {
        return { success: false, error: "Not authenticated" };
    }
    
    // Get user ID from token
    const userIDResult = await db.select({ id: token.userId })
        .from(token)
        .where(
            and(
                eq(token.token, authToken),
                isNull(token.dateEnded)
            )
        );
    
    if (userIDResult.length === 0) {
        return { success: false, error: "Invalid token" };
    }
    
    const userID = userIDResult[0].id;
    
    // Check if email is already taken by another user
    const existingUser = await db.select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), eq(users.id, userID)));
    
    if (existingUser.length === 0) {
        // Email might be taken by another user
        const emailCheck = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.email, email));
        
        if (emailCheck.length > 0) {
            return { success: false, error: "Email is already in use" };
        }
    }
    
    // Update user record
    await db.update(users)
        .set({ name, email })
        .where(eq(users.id, userID));
    
    return { success: true };
}

export async function changePasswordAction(formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, error: "All password fields are required" };
    }
    
    if (newPassword !== confirmPassword) {
        return { success: false, error: "Passwords do not match" };
    }
    
    if (newPassword.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
    }
    
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;
    
    if (!authToken) {
        return { success: false, error: "Not authenticated" };
    }
    
    // Get user ID
    const userIDResult = await db.select({ id: token.userId })
        .from(token)
        .where(
            and(
                eq(token.token, authToken),
                isNull(token.dateEnded)
            )
        );
    
    if (userIDResult.length === 0) {
        return { success: false, error: "Invalid token" };
    }
    
    return await changePassword(userIDResult[0].id, currentPassword, newPassword);
}