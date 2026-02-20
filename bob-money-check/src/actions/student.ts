'use server'; // ← Mark as server action

import { CreateStudent, SignInStudent, changePassword, logoutAllExcept } from '@/utils/authFunction'; 
import { CheckClearance, getStudentData } from '@/utils/manageStudents';
import {cookies} from 'next/headers';
import { db } from '@/utils/db';
import { users, student, token } from '../../drizzle/schema';
import { eq, and, isNull } from 'drizzle-orm';
import bcrypt from 'bcrypt';

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
            sameSite: 'strict',
            maxAge:60*60*24*300 //cookie lasts 300 days (sorry iphone users)
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
            sameSite: 'strict',
            maxAge:60*60*24*300
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
        return{success:false,message:"An error happened, please login again"}
    }
    
    return { success: true, data: result };
}

export async function updateStudentProfile(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const currentPassword = formData.get('currentPassword') as string;
    
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
    
    // Get current user data
    const currentUser = await db.select({
        id: users.id,
        email: users.email,
        password: users.password
    })
    .from(users)
    .where(eq(users.id, userID))
    .limit(1);
    
    if (currentUser.length === 0) {
        return { success: false, error: "User not found" };
    }
    
    // Check if email is being changed - require password
    const isEmailChanged = currentUser[0].email !== email;
    
    if (isEmailChanged) {
        if (!currentPassword) {
            return { success: false, error: "Password required to change email" };
        }
        
        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, currentUser[0].password);
        if (!passwordMatch) {
            return { success: false, error: "Incorrect password" };
        }
        
        // Check if new email is already taken
        const emailCheck = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.email, email));
        
        if (emailCheck.length > 0) {
            return { success: false, error: "Email is already in use" };
        }
        
        // Automatically logout from other devices when email changes
        await logoutAllExcept(authToken);
    }
    
    // Update user record
    await db.update(users)
        .set({ name, email })
        .where(eq(users.id, userID));
    
    return { success: true, logoutOtherDevices: isEmailChanged };
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
    
    const result = await changePassword(userIDResult[0].id, currentPassword, newPassword);
    
    // Automatically logout from other devices when password changes
    if (result.success) {
        await logoutAllExcept(authToken);
        result.logoutOtherDevices = true;
    }
    
    return result;
}

export async function updateMatricule(formData: FormData) {
    const matricule = formData.get('matricule') as string;
    
    if (!matricule || matricule.trim().length === 0) {
        return { success: false, error: "Matricule is required" };
    }
    
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
    
    // Check if matricule is already taken by another student
    const existingMatricule = await db.select({ student_id: student.student_id })
        .from(student)
        .where(eq(student.matricule, matricule));
    
    if (existingMatricule.length > 0 && existingMatricule[0].student_id !== userID) {
        return { success: false, error: "Matricule is already in use" };
    }
    
    // Check if student record exists
    const existingStudent = await db.select({ matricule: student.matricule })
        .from(student)
        .where(eq(student.student_id, userID));
    
    if (existingStudent.length === 0) {
        // Create new student record
        await db.insert(student).values({
            student_id: userID,
            matricule: matricule,
        });
    } else {
        // Update existing student record
        await db.update(student)
            .set({ matricule: matricule })
            .where(eq(student.student_id, userID));
    }
    
    return { success: true };
}

export async function checkValidClearance(formattedReceipt:any) {

    const cookieStore=await cookies();
    const authToken=cookieStore.get("authToken")?.value

    if (!authToken) {
        return { success: false, message: "Not authenticated" };
    }

    const response=await CheckClearance(authToken,formattedReceipt)
    if (!response.success){
        console.log('Clearance failed')
        return{success:false,message:"Sorry bro your fees are incomplete"}
    }
    return {success:true,message:"Congrats you are cleared",excess:response.excess_fees}
}