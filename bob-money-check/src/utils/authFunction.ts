import bcrypt from 'bcrypt';
import { db } from './db';
import { users, student } from '../../drizzle/schema';

export async function CreateStudent(
    email: string,
    matricule: string,
    password: string,
    name: string,
    ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("received at auth functions",email,matricule,name)
    // Wrap in transaction - both inserts succeed or both fail
    const result = await db.transaction(async (studentCreation) => {
        const [newStudent] = await studentCreation
        .insert(users)
        .values({
            email: email,
            name: name,
            password: hashedPassword,
            role: 'Student',
        })
        .returning({ id: users.id, email: users.email });

        await studentCreation.insert(student).values({
        student_id: newStudent.id,
        matricule: matricule,
        });

        return newStudent;
    });

    return result;
}