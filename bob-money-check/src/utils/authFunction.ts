import bcrypt from 'bcrypt';
import { db } from './db';
import jwt from 'jsonwebtoken'
import { users, student,token, RecoveryToken } from '../../drizzle/schema';
import { and, eq,ne,sql } from 'drizzle-orm';
import nodemailer from "nodemailer"

const JWT_SECRET = process.env.JWT_SECRET as string

// Type for login result
export interface LoginResult {
    success: boolean;
    token?: {
        jwtToken: string;
        insertedToken: typeof token.$inferSelect;
    };
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    error?: string;
}

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
        console.error('Failed to create student:', error);
        throw error;
    }
}

export async function SignIn(email: string, password: string): Promise<LoginResult> {
    // First, get the user from the database
    const result = await db.select({
        id:users.id,
        email:users.email,
        name:users.name,
        password:users.password,
        role:users.role
    })
    .from(users)
    .where(eq(users.email,email))
    .limit(1)
    
    if (result.length === 0) {
        return { success: false, error: 'Invalid credentials' };
    }

    // Compare the plain password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, result[0].password);
    
    if (!passwordMatch) {
        return { success: false, error: 'Invalid credentials' };
    }

    const user = result[0];

    // Generate JWT token with user info
    const jwtToken = jwt.sign({
        email: user.email,
        role: user.role,
        userId: user.id
    }, JWT_SECRET);

    const [insertedToken] = await db.insert(token).values({
        userId: user.id,
        token: jwtToken,
    }).returning();

    return {
        success: true,
        token: { jwtToken, insertedToken },
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    };
}

export async function logout(endtoken:string) {
    const result=await db.update(token)
                            .set({dateEnded:sql`CURRENT_TIMESTAMP`})
                            .where(eq(token.token,endtoken))
                            .returning()

    return result[0]||null
}

export async function MassiveLogout(endtoken:string) {
    const userIDResult=await db.select({
            id:token.userId})
            .from(token)
            .where(eq(token.token,endtoken))
    
    if (userIDResult.length === 0) {
        return null;
    }

    const userID = userIDResult[0].id;

    const result=await db.update(token)
                            .set({dateEnded:sql`CURRENT_TIMESTAMP`})
                            .where(eq(token.userId,userID))
                            .returning()
    return result||null;
}

export async function logoutAllExcept(currentToken: string) {
    const userIDResult=await db.select({
        id:token.userId})
        .from(token)
        .where(eq(token.token,currentToken))

    if (userIDResult.length === 0) {
        return null;
    }

    const userID = userIDResult[0].id;

    const result = await db.update(token)
        .set({ dateEnded: sql`CURRENT_TIMESTAMP` })
        .where(and(
            eq(token.userId, userID),      // Same user
            ne(token.token, currentToken)   // Except this token
        ))
        .returning();

    return result; // Array of all logged out tokens
}

export async function changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
): Promise<{ success: boolean; error?: string; logoutOtherDevices?: boolean }> {
    // Get current user
    const user = await db.select({
        id: users.id,
        password: users.password
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
    if (user.length === 0) {
        return { success: false, error: "User not found" };
    }
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user[0].password);
    if (!passwordMatch) {
        return { success: false, error: "Current password is incorrect" };
    }
    
    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));
    
    return { success: true };
}

export async function CreateAdmin(
    email: string,
    name: string,
    password: string,
    code: string
) {
    const adminKey = process.env.AdminSignUpKey;
    console.log("code and key ", code,adminKey)
    if (code !== adminKey) {
        return { success: false, message: "The key is not correct" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await db.transaction(async (CreateAdmintx) => {
            const [newAdmin] = await CreateAdmintx
                .insert(users)
                .values({ email, name, password: hashedPassword, role: 'Admin' })
                .returning({ id: users.id, email: users.email });

            const jwtToken = jwt.sign({ email: newAdmin.email }, JWT_SECRET);

            // If you don't need the inserted token record, just insert without returning
            await CreateAdmintx
                .insert(token)
                .values({ userId: newAdmin.id, token: jwtToken });

            // Or if you need the ID for something, destructure only what you use:
            // const [{ id: tokenId }] = await tx.insert(token)...

            console.log("New admin:", newAdmin);
            
            return { success: true, jwtToken, admin: newAdmin };
        });

        return {success:true,message:result.jwtToken};

    } catch (error) {
        console.error(error);
        return { success: false, message: "Email already exists" };
    }
}

async function GetUserIdByEmail(email:string) {
    const IDResult= await db.select({id:users.id})
                                    .from(users)
                                    .where(eq(users.email,email))
                                    .limit(1)

    if (IDResult.length===0){
        return{success:false}
    }
    const userID=IDResult[0].id ;
    return {success:true,userID: userID}
}

async function insertRecovery(userID:string,randomCode:number) {
    
    try{
        const insertResult= await db.insert(RecoveryToken)
                            .values({
                                userId:userID,
                                recoveryCode:randomCode
                            }).returning({id:RecoveryToken.id})

        const result=insertResult[0].id;
        if(!result){
            return {success:false}
        }
        return{success:true}
    }catch(error){
        return{success:false}
    }
}

export async function SendRecoveryCode(email:string) {
    
    const userIDResult= await GetUserIdByEmail(email)
    
    if (!userIDResult.success){
        return{success:false,message:"No account found with this email address"}
    }
    const userID=userIDResult.userID as string
    const randomCode=Math.floor(100000 + Math.random() * 900000)

    const insertCode= await insertRecovery(userID,randomCode) 

    if(!insertCode.success){
        return{success:false,message:"Code creation error"}
    }

    try{
        const transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS,
            },
        })
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:email,
            subject:"Recovery Password",
            text:`Your random code is ${randomCode}`
        })
        return {success:true,message:"Recovery email sent"}

    }catch(error){
        console.error("Failed to send recovery email:", error);
        return {success:false,message:"Failed to send recovery email. Please check your network connection and try again."}
    }

}

async function removeAlltokens(email:string) {
    
    const userIDResult=await GetUserIdByEmail(email)
    if(!userIDResult.success){
        return{success:false}
    }
    const userID=userIDResult.userID as string
    const result=await db.update(token)
                            .set({dateEnded:sql`CURRENT_TIMESTAMP`})
                            .where(eq(token.userId,userID))
                            .returning()
    return result||null
}

async function CheckCode(code:number,userID:string) {
    const codeValidResult= await db.select({
                            recoveryCode:RecoveryToken.recoveryCode
                            })
                            .from(RecoveryToken)
                            .where(
                                and(  //only get valid codes
                                    eq(RecoveryToken.recoveryCode,code),
                                    eq(RecoveryToken.userId,userID),
                                    eq(RecoveryToken.isValid,true)
                                )
                            )
                            .limit(1)
    if(codeValidResult.length===0){
        const invalidateToken= await db.update(RecoveryToken)
                                            .set({isValid:false})
                                            .where(eq(RecoveryToken.userId,userID))
                                            .returning()
        if(invalidateToken.length===0){
            return false
        }
        return false
    }
    return true
}

export async function ResetPassword(email:string,code:number,newPassword:string) {
    
    const userIDResult=await GetUserIdByEmail(email)
    if(!userIDResult.success){
        return{success:false,message:"user not found"}
    }
    const userID=userIDResult.userID as string

    const hashedNewPassword= await bcrypt.hash(newPassword,10)
    const updatePassword=await db.update(users)
                                .set({password:hashedNewPassword})
                                .where(eq(users.id,userID))
                                .returning()
    if(updatePassword===null){
        return{success:false,message:"Could not update the password"}
    }

    const isValidCode= await CheckCode(code,userID)

    if(isValidCode===false){
        return {success:false,message:"Incorrect code, request another"}
    }
    const invalidateToken= await db.update(RecoveryToken)
                                            .set({isValid:false})
                                            .where(eq(RecoveryToken.userId,userID))
                                            .returning()
        if(invalidateToken.length===0){
            return {success:false,message:"Security error"}
    }
    const massiveDisconncect=await removeAlltokens(email)
    if(massiveDisconncect===null){
        return {success:false,message:"Could not disconnect the sessions"}
    }
    
    return {success:true,message:"Password updated, login"}
}