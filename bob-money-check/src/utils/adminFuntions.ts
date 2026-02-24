import { eq, isNull, and, desc } from "drizzle-orm"
import { clearance, clearancesIndex, student, token, usedReceipts, users } from "../../drizzle/schema"
import { db } from "./db"

async function isAdmin(authToken:string){
    try{

        const userIDsearchResult=await db.select({
                                            id:token.userId
                                        })
                                        .from(token)
                                        .where(
                                            and(
                                                eq(token.token,authToken),
                                                isNull(token.dateEnded)
                                            )
                                        )
                                        .limit(1)
        
                if (userIDsearchResult.length===0){
                    return false
                }
                const userID=userIDsearchResult[0].id

                
            const isAdminResult=await db.select({
                                role:users.role
                            })
                            .from(users)
                            .where(eq(users.id,userID))
                

            if(isAdminResult.length===0){
                return false
            }


            const isAdmin=isAdminResult[0].role

            if(isAdmin!=="Admin"){
                return false
            }
            return true

        }catch(error){
            console.log(error)
            return false
        }
}

export async function seeAllStudents(authToken:string) {
    
    const checkPermission= await isAdmin(authToken)

    if (checkPermission!==true){
        return {success:false,message:"You are not authorized"}
    }
    try{
        const studentList=await db.select({
                            id:users.id,
                            email:users.email,
                            name:users.name,
                            matricule:student.matricule,
                            dueFees:student.due_sum
                        })
                        .from(users)
                        .where(eq(users.role,"Student"))
                        .innerJoin(student,eq(users.id,student.student_id))

        return{success:true,message:studentList}
    }catch(error){
        console.error(error)
        return {success:false,message:"Something went wrong"}
    }
} 

async function GetStudentIDByEmail(studentEmail:string) {
    const StudentIDResult= await db.select({
                                id:users.id
                            }) 
                            .from(users)
                            .where(
                                and(
                                    eq(users.email,studentEmail),
                                    eq(users.role,"Student")
                                )
                            )
                            .limit(1)  

    if(StudentIDResult.length===0){
        return {success:false}
    }

    const studentID=StudentIDResult[0].id

    return{success:true,message:studentID}
}

export async function GiveAdminClearance(authToken:string,studentEmail:string) {
    
    const checkPermission= await isAdmin(authToken);
    if (checkPermission!==true){
        return {success:false,message:"Not authorized"}
    };
    const studentIDCheck= await GetStudentIDByEmail(studentEmail)
    if(!studentIDCheck.success){
        return {success:false,message:"student not found"}
    }
    //the result is a json containing the answer in message field. Here we extract it
    const studentID=studentIDCheck.message as string
    try{
        const result= await db.transaction(async(GivingAdminClearanceTX)=>{

            const insertClearance=await GivingAdminClearanceTX
                                        .insert(clearance)
                                        .values({
                                            userId:studentID,
                                            active:true,
                                            usedReceipts:"Admin Given"
                                        })
                                        .returning({id:clearance.id})
            
                const newClearanceId=insertClearance[0].id;

            const existingIndex= await GivingAdminClearanceTX
                                    .select({clearancesId:clearancesIndex.clearancesId})
                                    .from(clearancesIndex)
                                    .where(eq(clearancesIndex.userId,studentID))
                                    .limit(1)
            
            if (existingIndex.length===0){
                await GivingAdminClearanceTX.insert(clearancesIndex).values({
                    userId:studentID,
                    clearancesId:newClearanceId
                });
            }else{
                const currentIds=existingIndex[0].clearancesId as string
                await GivingAdminClearanceTX.update(clearancesIndex)
                    .set({clearancesId:[...currentIds,newClearanceId]})
                    .where(eq(clearancesIndex.userId,studentID));
            }
        });

        return {success:true, message:"Clearance created", data:result}
    }catch(error){
        console.error(error)
        return {success:false,message:"Failed to grant clearance"}
    }
}

export async function SeeAllClearances(authToken:string) {
    const checkPermission= await isAdmin(authToken);
    if (checkPermission!==true){
        return {success:false,message:"Not authorized"}
    };
    try{
    const clearanceList= await db.select({
            id: clearance.id,
            userId: clearance.userId,
            date: clearance.date,
            active: clearance.active,
            usedReceipts: clearance.usedReceipts,
            userName: users.name,
            userEmail: users.email,
        })
        .from(clearance)
        .innerJoin(users, eq(clearance.userId, users.id))
        .orderBy(desc(clearance.date));
        
    return{success:true,message:clearanceList}
    }catch(error){
        console.error(error)
        return{success:false,message:"Internal error"}
    }
}

export async function SeeAllUsedReceipts(authToken:string) {
    const checkPermission= await isAdmin(authToken);
    if (checkPermission!==true){
        return {success:false,message:"Not authorized"}
    };
    try{
        const usedReceiptsList=await db.select()
                                .from(usedReceipts)
            return {success:true,message:usedReceiptsList}
    }catch(error){
        console.error(error)
        return{success:false,message:"Internal error"}
    }
}