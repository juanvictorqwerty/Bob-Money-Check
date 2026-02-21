import InPutReceiptInfo from "@/components/ReceiptInput";
import ClearanceList from "@/components/clearanceList";
import { studentClearances } from "@/actions/student";

export default async function Home() {
  const clearances = await studentClearances();

  return (
    <div className="flex mt-5 items-center justify-center w-[90%] md:w-[80%] lg:w-[50%] mx-auto">
      <div>
        <InPutReceiptInfo/>
      </div>
      <div>
        <ClearanceList clearances={clearances}/>
      </div>
    </div>
  );
}
