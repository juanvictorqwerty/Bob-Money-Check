"use client"
import { inputStyle } from "@/utils/styles"
import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const InPutReceiptInfo=()=>{
    const[receiptID,setReceiptID]=useState('');
    const[paymentDate,setPaymentDate]=useState<Date|null>(new Date())

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReceiptID(e.target.value);
    }

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        const formattedDate = paymentDate ? paymentDate.toISOString().split('T')[0] : null;
        console.log('Form data:', { receiptID, paymentDate: formattedDate });
    }

    return(
        <div className="w-full p-3 bg-gray-100 dark:bg-gray-700">
            <form onSubmit={handleSubmit}>
                <input
                    id="receiptID"
                    name="receiptID"
                    type="text"
                    placeholder="The id of your receipt"
                    className= {`${inputStyle} mb-2`}
                    value={receiptID}
                    onChange={handleChange}
                />
                <DatePicker
                    selected={paymentDate}
                    onChange={(date: Date | null) => setPaymentDate(date)}
                    className={inputStyle}
                    calendarClassName="rounded-lg shadow-lg bg-gray-50 dark:bg-gray-500 mb-2"
                    dateFormat="dd-MM-YYYY"
                />

                <button
                    className="block mt-2 w-full justify-center py-2.5 min-h-11 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white font-medium ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    type="submit"
                >
                    Ask Clearance
                </button>
            </form>
        </div>
    )
}

export default InPutReceiptInfo