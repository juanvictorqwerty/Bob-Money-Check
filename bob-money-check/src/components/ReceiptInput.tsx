"use client"
import { checkValidClearance } from "@/actions/student"
import { inputStyle } from "@/utils/styles"
import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

type ReceiptEntry = {
    id: string
    receiptID: string
    paymentDate: Date | null
}

const InPutReceiptInfo=()=>{
    const [receipts, setReceipts] = useState<ReceiptEntry[]>([
        { id: '1', receiptID: '', paymentDate: new Date() }
    ])

    const addReceipt = () => {
        const newId = Date.now().toString()
        setReceipts([...receipts, { id: newId, receiptID: '', paymentDate: new Date() }])
    }

    const removeReceipt = (id: string) => {
        if (receipts.length > 1) {
            setReceipts(receipts.filter(r => r.id !== id))
        }
    }

    const updateReceipt = (id: string, field: 'receiptID' | 'paymentDate', value: string | Date | null) => {
        setReceipts(receipts.map(r => 
            r.id === id ? { ...r, [field]: value } : r
        ))
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        const formattedReceipts = receipts.map(r => ({
            receiptID: r.receiptID,
            paymentDate: r.paymentDate ? 
                `${String(r.paymentDate.getDate()).padStart(2, '0')}-${String(r.paymentDate.getMonth() + 1).padStart(2, '0')}-${r.paymentDate.getFullYear()}` 
                : null
        }))
        console.log('Form data:', formattedReceipts)
        const response=await checkValidClearance(formattedReceipts)
        console.log(response)
    }

    return(
        <div className="w-full p-3 bg-gray-100 dark:bg-gray-700">
            <form onSubmit={handleSubmit}>
                {receipts.map((receipt, index) => (
                    <div key={receipt.id} className="mb-4 p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Receipt #{index + 1}
                            </span>
                            {receipts.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeReceipt(receipt.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <input
                            id={`receiptID-${receipt.id}`}
                            name={`receiptID-${receipt.id}`}
                            type="text"
                            placeholder="The id of your receipt"
                            className={`${inputStyle} mb-2`}
                            value={receipt.receiptID}
                            onChange={(e) => updateReceipt(receipt.id, 'receiptID', e.target.value)}
                        />
                        <DatePicker
                            selected={receipt.paymentDate}
                            onChange={(date: Date | null) => updateReceipt(receipt.id, 'paymentDate', date)}
                            className={inputStyle}
                            calendarClassName="rounded-lg shadow-lg bg-gray-50 dark:bg-gray-500 mb-2"
                            dateFormat="dd-MM-YYYY"
                        />
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addReceipt}
                    className="flex items-center justify-center w-full py-2 mb-2 min-h-11 bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-md text-white font-medium ring-2 transition-colors"
                >
                    <span className="text-xl mr-1">+</span> Add Receipt
                </button>

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