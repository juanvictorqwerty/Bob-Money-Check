import 'dotenv/config';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getSheetsClient, getSpreadsheetId } from '../src/utils/connectGSheet';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testGoogleSheet() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Receipts!A1:Z',
  });

  return response.data.values;
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
