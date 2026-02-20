import { db } from './db';
import { users, student, token } from '../../drizzle/schema';
import { eq, isNull,and } from 'drizzle-orm';
import { getSheetsClient, getSpreadsheetId } from './connectGSheet'

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
            matricule: student.matricule,
            due_fees:student.due_sum,
            excess_fees: student.excess_fees
        })
        .from(users)
        .leftJoin(student, eq(student.student_id, users.id))
        .where(eq(users.id, userID));

    return studentData[0] || null;
}


export async function CheckClearance(authToken:string, formattedReceipt: { receiptID: string; paymentDate: string | null }[]) {
    try {
        // Get student data to get due_fees
        const studentData = await getStudentData(authToken);
        if (!studentData || studentData.due_fees === null) {
            console.log('No student data or due_fees found');
            return false;
        }
        
        const dueFees = Number(studentData.due_fees);
        
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
                
                // Match by ID first
                if (rowId !== receiptId) {
                    return false;
                }
                
                // Handle date matching - sheet uses DD-MM-YYYY format
                if (receipt.paymentDate) {
                    const inputDate = receipt.paymentDate; // YYYY-MM-DD
                    
                    // Convert DD-MM-YYYY to YYYY-MM-DD
                    const sheetParts = rowDate?.split('-');
                    if (sheetParts && sheetParts.length === 3) {
                        const normalizedDate = `${sheetParts[2]}-${sheetParts[1]}-${sheetParts[0]}`;
                        return normalizedDate === inputDate;
                    }
                    
                    return rowDate === inputDate;
                }
                
                return true; // Match by ID only if no date provided
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
            return false;
        }
        
        // Sum all receipt amounts
        const totalPaid = results.reduce((sum, result) => {
            return sum + (Number(result.sum) || 0);
        }, 0);
        
        console.log(`Total paid: ${totalPaid}, Due fees: ${dueFees}`);
        
        // Compare and return success or failure
        if (totalPaid >= dueFees) {
            console.log('Clearance success: sufficient payment');
            return true;
        } else {
            console.log('Clearance failed: insufficient payment');
            return false;
        }
        
    } catch (error) {
        console.log(error);
        return false;
    }
}