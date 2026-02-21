import InPutReceiptInfo from "@/components/ReceiptInput";
import ClearanceList from "@/components/clearanceList";
import { studentClearances } from "@/actions/student";

export default async function Home() {
  const clearances = await studentClearances();

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-800">
      <div className="w-full px-4 mx-auto md:w-[80%] lg:w-[50%]">
        <div className="space-y-6">
          {/* Receipt Input Section */}
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-700 dark:border-gray-500">
            <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-50">Submit Receipt</h2>
            <InPutReceiptInfo/>
          </div>
          
          {/* Clearance List Section */}
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-600">
            <ClearanceList clearances={clearances}/>
          </div>
        </div>
      </div>
    </div>
  );
}
