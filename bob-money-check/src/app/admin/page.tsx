"use client"

import AllClearances from "@/components/AllClearances"
import AllStudents from "@/components/AllStudents"
import AllUsedReceipts from "@/components/AllUsedReceipts"

const AdminHome=()=>{
    return(
        <div>
            <AllClearances/>
            <AllStudents/>
            <AllUsedReceipts/>
        </div>
    )
}
export default AdminHome