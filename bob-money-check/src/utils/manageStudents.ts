import { db } from './db';
import { users, student, token, usedReceipts, clearance,clearancesIndex } from '../../drizzle/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { getSheetsClient, getSpreadsheetId } from './connectGSheet'
import { PDFDocument } from 'pdf-lib';
import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"

async function getValidStudentID(authToken:string) {
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
            return null
        }
        const userID=userIDsearchResult[0].id

        return userID

    }catch(error){
        console.error(error)
        return null
    }
}

export async function getStudentData(authToken:string) {
    try{
        const userID=await getValidStudentID(authToken)
        if (!userID){
            return null
        }

        const studentData = await db
            .select({
                email: users.email,
                name: users.name,
                matricule: student.matricule,
                due_fees:student.due_sum,
                excess_fees: student.excess_fees
            })
            .from(users)
            .leftJoin(student, eq(student.student_id, users.id))
            .where(eq(users.id, userID as string));

        return studentData[0];

    }catch(error){
        console.error(error)
        return null
    }
}

async function isReceiptsValid(formattedReceipt: { receiptID: string; paymentDate: string | null }[]) {
    const convertDate = (dateStr: string | null): string | null => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day} 00:00:00`;
    };

    try {
        for (const receipt of formattedReceipt) {
            const conditions: any[] = [eq(usedReceipts.id, receipt.receiptID)];
            const formattedDate = convertDate(receipt.paymentDate);

            if (formattedDate) {
                conditions.push(eq(usedReceipts.paymentDate, formattedDate));
            }

            const response = await db.select({ id: usedReceipts.id })
                .from(usedReceipts)
                .where(conditions.length > 1 ? and(...conditions) : conditions[0])
                .limit(1);

            if (response.length !== 0) return false; // This receipt is already used
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
async function getStudentDueFees(authToken:string) {

    try{
        const studentID=await getValidStudentID(authToken);

        if (!studentID){
            return null
        }

        const rawData=await db.select({
            fees:student.due_sum,
            excess:student.excess_fees
        })
        .from(student)
        .where(eq(student.student_id,studentID))

        const response= rawData[0]?.fees-rawData[0]?.excess;

        return response

    }catch(error){
        console.log(error)
        return null
    }
}

export async function CheckClearance(authToken: string, formattedReceipt: { receiptID: string; paymentDate: string | null }[]) {
    try {
        const validity = await isReceiptsValid(formattedReceipt);
        console.log("Validity test: ", validity);
        if (!validity) {
            return { success: false, message: "The receipt is already used" };
        }

        // Get student data to get due_fees
        const dueFees = Number(await getStudentDueFees(authToken));
        if (dueFees === null || isNaN(dueFees)) {
            console.log("Terrible error");
            return { success: false, message: "Something terrible happened" };
        }

        const sheets = getSheetsClient();
        const spreadsheetId = getSpreadsheetId();
        
        // Fetch data from the sheet - Columns A (ID), B (Date), C (Sum)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Receipts!A:C',
        });
        
        const rows = response.data.values;
        
        // Validate spreadsheet data
        if (!rows || !Array.isArray(rows) || rows.length < 2) {
            console.log('Clearance failed: no receipt data found');
            return { success: false, message: "No receipt data found in spreadsheet" };
        }
        
        // Skip header row (assuming first row is headers)
        const dataRows = rows.slice(1);
        
        // Search for matching entries and get the sum
        const results = formattedReceipt.map(receipt => {
            const match = dataRows.find(row => {
                const rowId = row[0]?.toString().trim();       // Column A
                const rowDate = row[1]?.toString().trim();     // Column B
                const receiptId = receipt.receiptID?.toString().trim();
                
                // Match by ID and date (both in DD-MM-YYYY format)
                if (rowId !== receiptId) {
                    return false;
                }
                
                if (receipt.paymentDate) {
                    return rowDate === receipt.paymentDate;
                }
                
                return true;
            });

            return {
                receiptID: receipt.receiptID,
                paymentDate: receipt.paymentDate,
                sum: match ? match[2] : null
            };
        });
        
        // Debug: Log results
        console.log('Receipt results:', JSON.stringify(results));
                
        // Return false if any receipt has a null sum
        const hasNullSum = results.some(result => result.sum === null);
        if (hasNullSum) {
            console.log('Clearance failed: some receipts have null sum');
            return { success: false, message: "some receipts are not found" };
        }
        
        // Sum all receipt amounts
        const totalPaid = results.reduce((sum, result) => {
            return sum + (Number(result.sum) || 0);
        }, 0);
        
        console.log(`Total paid: ${totalPaid}, Due fees: ${dueFees}`);
        
        // Compare and return success or failure
        if (totalPaid >= dueFees) {
            console.log('Clearance success: sufficient payment');
            const excess_fees = totalPaid - dueFees;
            
            // Get user ID for database operations
            const userID = await getValidStudentID(authToken);
            if (!userID) {
                return { success: false, message: "User not found" };
            }
            
            // Helper function for date conversion (defined once)
            const convertDateForDb = (dateStr: string | null): string | null => {
                if (!dateStr) return null;
                const parts = dateStr.split('-');
                if (parts.length !== 3) return null;
                const [day, month, year] = parts;
                return `${year}-${month}-${day} 00:00:00`;
            };

            // Insert clearance record + update index in a transaction
            const result = await db.transaction(async (tx) => {
                // Insert clearance record
                const clearanceResult = await tx.insert(clearance).values({
                    userId: userID,
                    active: true,
                }).returning({ id: clearance.id });

                const newClearanceId = clearanceResult[0].id;

                // Insert used receipts
                for (const receipt of formattedReceipt) {
                    const dbDate = convertDateForDb(receipt.paymentDate);
                    if (!dbDate) {
                        throw new Error(`Invalid date format for receipt: ${receipt.receiptID}`);
                    }

                    await tx.insert(usedReceipts).values({
                        id: receipt.receiptID,
                        paymentDate: dbDate,
                        userId: userID,
                        clearanceId: newClearanceId,
                    });
                }

                // Update excess_fees if > 0
                if (excess_fees > 0) {
                    await tx.update(student)
                        .set({ excess_fees })
                        .where(eq(student.student_id, userID));
                }

                // Upsert clearancesIndex - read existing and update within transaction
                // This is safe from race conditions since it's within a transaction
                const existingIndex = await tx.select({ clearancesId: clearancesIndex.clearancesId })
                    .from(clearancesIndex)
                    .where(eq(clearancesIndex.userId, userID))
                    .limit(1);

                if (existingIndex.length === 0) {
                    await tx.insert(clearancesIndex).values({
                        userId: userID,
                        clearancesId: [newClearanceId],
                    });
                } else {
                    const currentIds = existingIndex[0].clearancesId as string[];
                    await tx.update(clearancesIndex)
                        .set({ clearancesId: [...currentIds, newClearanceId] })
                        .where(eq(clearancesIndex.userId, userID));
                }

                return { clearanceId: newClearanceId };
            });
            console.log(result)
            return { success: true, excess_fees: excess_fees };
        } else {
            console.log('Clearance failed: insufficient payment');
            return { success: false, message: "Insufficient payment" };
        }
        

    } catch (error) {
        console.error(error);
        return { success: false, message: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
}

export async function getStudentClearanceList(authToken:string) {
    
    const studentID=await getValidStudentID(authToken)

    if (!studentID){
        return {success:false,message:"This student does not exist"}
    }
    try{
        // Get clearances from index (JSON array of IDs)
        const listOfClearances= await db.select({
                                    clearanceId:clearancesIndex.clearancesId
                                })
                                .from(clearancesIndex)
                                .where(eq(clearancesIndex.userId,studentID))
        
        if (listOfClearances.length === 0) {
            return {success:true,message:[]}
        }
        
        // Extract the array of clearance IDs from JSON
        const clearanceIds = listOfClearances[0].clearanceId as unknown as string[];
        
        if (!clearanceIds || clearanceIds.length === 0) {
            return {success:true,message:[]}
        }
        
        // Get dates for each clearance ID from clearance table
        const allClearances = await db.select({
            id: clearance.id,
            date: clearance.date
        })
        .from(clearance)
        .where(sql`${clearance.id} IN ${clearanceIds}`)
        .orderBy(sql`${clearance.date} DESC`);
        
        return {success:true,message:allClearances}
    }catch(error){
        console.error(error)
        return{success:false,message:"Internal error"}
    }
}

async function licenceInfo(licenceId:string) {
    try {
        const licenceData = await db.select({
                            id:clearance.id,
                            date:clearance.date,
                            studentEmail:users.email,
                            studentName:users.name,
                            studentMatricule:student.matricule
                        })
                        .from(clearance)
                        .innerJoin(users,eq(clearance.userId,users.id))
                        .innerJoin(student,eq(users.id,student.student_id))
                        .where(eq(clearance.id, licenceId));
        
        return licenceData[0] || null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function generatePDF(licenseId:string) {
    try{
        const rawData= await licenceInfo(licenseId)

        if (rawData===null){
            return null
        }
        const TXT = { id: rawData.id,date:rawData.date,studentEmail:rawData.studentEmail,studentName:rawData.studentName,studentMatricule:rawData.studentMatricule }

        const templateBytes = fs.readFileSync(path.join(process.cwd(), 'public', 'DemoTemplate.pdf'))
        const pdfDoc=await PDFDocument.load(templateBytes)
        const pages = pdfDoc.getPages()
        const firstPage = pages[0]

        const textContent = `ID: ${TXT.id}\nDate: ${TXT.date}\nEmail: ${TXT.studentEmail}\nName: ${TXT.studentName}\nMatricule: ${TXT.studentMatricule}`;
        firstPage.drawText(textContent,{
            x:100,
            y:500,
            size:12
        })
        const pdfBytes=await pdfDoc.save()
        
        return pdfBytes
    }catch(error){
        console.error(error)
        return null
    }
}

export async function sendEmail(authToken:string,licenceId:string) {
    
    try{
        const studentID=await getValidStudentID(authToken)

        if (studentID===null){
            return null
        }

        const studentEmailResult = await db.select({
                            email: users.email
                            })
                            .from(users)
                            .where(
                                eq(users.id,studentID)
                            )
                            .limit(1)

        const studentEmail = studentEmailResult[0]?.email;

        if (!studentEmail) {
            return null;
        }
        
        // Use the provided licenceId directly
        const pdfBytes=await generatePDF(licenceId)

        if (!pdfBytes) {
            return null;
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
            },
        })

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: "Your PDF",
            text: "Attached is your document",
            attachments: [
            {
                filename: "clearance.pdf",
                content: Buffer.from(pdfBytes),
            },
            ],
        })
        return {success:true,message:"Email sent, get your pdf"}

    }catch(error){
        console.error(error)
        return {success:false,message:"Email not sent"}
    }
}