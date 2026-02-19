import InPutReceiptInfo from "@/components/ReceiptInput";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex mt-5 items-center justify-center w-[90%] md:w-[80%] lg:w-[50%] mx-auto">
      <InPutReceiptInfo/>
    </div>
  );
}
