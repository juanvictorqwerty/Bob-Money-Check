import { db } from './db';
import { users, student, token, usedReceipts, clearance } from '../../drizzle/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { getSheetsClient, getSpreadsheetId } from './connectGSheet'

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
            .where(eq(users.id, userID));

        return studentData[0];

    }catch(error){
        console.error(error)
        return null
    }
}

async function isReceiptsValid(formattedReceipt: { receiptID: string; paymentDate: string | null }[]) {
    const { receiptID, paymentDate } = formattedReceipt[0];
    console.log(formattedReceipt)
    try {
        // Convert dd-mm-yyyy to yyyy-mm-dd HH:MM:SS for timestamp comparison
        const convertDate = (dateStr: string | null): string | null => {
            if (!dateStr) return null;
            const [day, month, year] = dateStr.split('-');
            return `${year}-${month}-${day} 00:00:00`; // Returns yyyy-mm-dd HH:MM:SS
        };

        const formattedPaymentDate = convertDate(paymentDate);
        console.log('Converted date:', formattedPaymentDate);
        console.log('Receipt ID:', receiptID);
        
        // Build conditions array
        const conditions: any[] = [eq(usedReceipts.id, receiptID)];
        
        if (formattedPaymentDate !== null) {
            conditions.push(eq(usedReceipts.paymentDate, formattedPaymentDate));
        }

        // Debug: First just check if the receipt ID exists
        const debugCheck = await db.select({
            id: usedReceipts.id,
            paymentDate: usedReceipts.paymentDate
        })
        .from(usedReceipts)
        .where(eq(usedReceipts.id, receiptID));
        
        console.log('Debug - All rows with this ID:', debugCheck);
        
        const response = await db.select({
            id: usedReceipts.id,
            paymentDate: usedReceipts.paymentDate
        })
        .from(usedReceipts)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0]);
        
        console.log(response);
        if(response.length!==0){
            return false
        };
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

async function getStudentDueFees(authToken:string) {

    try{
        const studentID=await getValidStudentID(authToken);

        if (!studentID){
            return null
        }

        const response=await db.select({
            fees:student.due_sum
        })
        .from(student)
        .where(eq(student.student_id,studentID))

        return response[0]?.fees;

    }catch(error){
        console.log(error)
        return null
    }
}

export async function CheckClearance(authToken:string, formattedReceipt: { receiptID: string; paymentDate: string | null }[]) {
    try {
        const validity=await isReceiptsValid(formattedReceipt)
        console.log("Validity test: ",validity)
        if (!validity){
            return {success:false,message:"The receipt is already used"}
        }

        // Get student data to get due_fees
        const dueFees = Number(await getStudentDueFees(authToken))
        if(!dueFees){
            console.log("Terrible error")
            return{success:false,message:"Something terrible happened"}
        }

        const sheets = getSheetsClient();
        const spreadsheetId = getSpreadsheetId();
        
        // Fetch data from the sheet - Columns A (ID), B (Date), C (Sum)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Receipts!A:C',
        });
        
        const rows = response.data.values || [];
        
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
            return {success:false,message:"some receipts are not found"};
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
            
            // Insert clearance record
            const clearanceResult = await db.insert(clearance).values({
                userId: userID,
                active: true,
            }).returning({ id: clearance.id });
            
            const clearanceId = clearanceResult[0].id;
            
            // Insert used receipts
            for (const receipt of formattedReceipt) {
                const convertDateForDb = (dateStr: string | null): string | null => {
                    if (!dateStr) return null;
                    const [day, month, year] = dateStr.split('-');
                    return `${year}-${month}-${day} 00:00:00`;
                };
                
                await db.insert(usedReceipts).values({
                    id: receipt.receiptID,
                    paymentDate: convertDateForDb(receipt.paymentDate) as string,
                    userId: userID,
                    clearanceId: clearanceId,
                });
            }
            
            // Update excess_fees in student table if > 0
            if (excess_fees > 0) {
                await db.update(student)
                    .set({ excess_fees })
                    .where(eq(student.student_id, userID));
            }
            
            return { success: true, excess_fees: excess_fees };
        } else {
            console.log('Clearance failed: insufficient payment');
            return {success:false,message:"Insufficient payment"};
        }
        

    } catch (error) {
        console.log(error);
        return {success:false};
    }
}