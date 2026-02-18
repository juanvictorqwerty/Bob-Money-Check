'use server'; // ← Mark as server action

import { CreateStudent, SignInStudent } from '@/utils/authFunction'; 
import {cookies} from 'next/headers';

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