import 'dotenv/config';
import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load e
// nvironment variables from correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Debug: Check env vars
console.log('Environment variables:', {
  GOOGLE_APPLICATION_KEY: process.env.GOOGLE_APPLICATION_KEY ? '✓ set' : '✗ missing',
  SHEET_ID: process.env.SHEET_ID ? '✓ set' : '✗ missing'
});

async function testGoogleSheet() {
  // Create properly typed Sheets instance
  const sheets = google.sheets({
    version: 'v4',
    auth: process.env.GOOGLE_APPLICATION_KEY
  }) as sheets_v4.Sheets;

  const spreadsheetId = process.env.SHEET_ID;

  if (!spreadsheetId) {
    throw new Error("SHEET_ID environment variable is not defined");
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Receipts!A1:Z',
    });

    return response.data.values;
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    throw error;
  }
}

async function main() {
  console.log("Testing Google Sheets API...");
  try {
    const data = await testGoogleSheet();
    console.log("✅ Success! Data fetched:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
