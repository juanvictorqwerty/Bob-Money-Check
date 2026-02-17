import bcrypt from bcrypt;
//import {prisma} from '@/generated/prisma'

export async function CreateUser(email:String, matricule: String,password:String) {
    
    const hashedPassword=await bcrypt.hash(password,10); 

}