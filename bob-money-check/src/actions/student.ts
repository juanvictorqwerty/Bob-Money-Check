'use server'; // ← Mark as server action

import { CreateStudent } from '@/utils/authFunction'; // adjust path

export async function signupStudent(formData: FormData) {
    const email = formData.get('email') as string;
    const matricule = formData.get('matricule') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
        console.log("Form", formData)
        const newStudent = await CreateStudent(email, matricule, password, name);
        return { success: true, student: newStudent };
    } catch (error) {
        console.error(error)
        return { success: false, error: 'Failed to create student' };
    }
}