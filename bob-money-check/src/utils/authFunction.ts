import bcrypt from 'bcrypt';
import { db } from './db';
import jwt from 'jsonwebtoken'
import { users, student,token } from '../../drizzle/schema';

const JWT_SECRET = process.env.JWT_SECRET as string

export async function CreateStudent(
    email: string,
    matricule: string,
    password: string,
    name: string,
    ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("received at auth functions",email,matricule,name)
    // Wrap in transaction - both inserts succeed or both fail
    
    try{
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

            //Create JWT Token
            const jwtToken: string = jwt.sign(
                {
                    email:newStudent.id
                },
                JWT_SECRET       
            );

            const [insertedToken] = await studentCreation.insert(token).values({
                userId: newStudent.id,
                token: jwtToken,
            }).returning();
            
            console.log("New student", newStudent)
            return { insertedToken, jwtToken };
        });

        return result.jwtToken;
    }catch(error){
        return error;
    }
}