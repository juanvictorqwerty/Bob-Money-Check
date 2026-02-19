import 'dotenv/config';
import { testGoogleSheet } from "../src/utils/test-google-sheet";

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
