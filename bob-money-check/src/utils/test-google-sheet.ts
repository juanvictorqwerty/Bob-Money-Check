import { google } from "googleapis";

export async function testGoogleSheet() {
    const sheets = google.sheets({
        version: 'v4',
        auth: process.env.GOOGLE_APPLICATION_KEY
    });

    const spreadsheetId = process.env.SHEET_ID;

    try {
        const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Receipts!A1:Z', // Adjust your sheet name and range
        });

        console.log('Sheet data:', response.data.values);
        return response.data.values;
    } catch (error) {
        console.error('Error accessing:', error);
        throw error;
    }
}
