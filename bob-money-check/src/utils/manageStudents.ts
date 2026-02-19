import { db } from './db';
import { users, student, token } from '../../drizzle/schema';
import { eq, isNull,and } from 'drizzle-orm';

export async function getStudentData(authToken:string) {

    //get the id of the user before we start to get his data
    const userIDResult=await db.select({id:token.userId})
                        .from(token)
                        .where(
                            and(
                                eq(token.token,authToken),
                                isNull(token.dateEnded)
                            )
                        );
    if (userIDResult.length===0){
        return null
    }
    const userID=userIDResult[0].id

    const studentData = await db
        .select({
            email: users.email,
            name: users.name,
            matricule: student.matricule
        })
        .from(users)
        .leftJoin(student, eq(student.student_id, users.id))
        .where(eq(users.id, userID));

    return studentData[0] || null;
}