import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";

let sheetsInstance: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets {
    if (!sheetsInstance) {
        sheetsInstance = google.sheets({
        version: 'v4',
        auth: process.env.GOOGLE_APPLICATION_KEY
        }) as sheets_v4.Sheets;
    }
    return sheetsInstance;
}

export function getSpreadsheetId(): string {
    const spreadsheetId = process.env.SHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SHEET_ID environment variable is not defined");
    }
    return spreadsheetId;
}
