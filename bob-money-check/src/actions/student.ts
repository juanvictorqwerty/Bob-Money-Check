'use server'; // ← Mark as server action

import { CreateStudent } from '@/utils/authFunction'; 
import {cookies} from 'next/headers';

export async function signupStudent(formData: FormData) {
    const email = formData.get('email') as string;
    const matricule = formData.get('matricule') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
        console.log("Form", formData)
        const token = await CreateStudent(email, matricule, password, name);

        //set cookie
        (await
            //set cookie
            cookies()).set('authToken',token as string,{
            httpOnly:true, //prevents JS access
            secure: process.env.NODE_ENV ==='production',
            sameSite:'strict'
        })

        return { success: true, token:token };
    } catch (error) {
        console.error(error)
        return { success: false, error: 'Failed to create student' };
    }
}