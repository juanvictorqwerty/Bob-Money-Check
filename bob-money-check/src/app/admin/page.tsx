"use client"

import { useState } from "react"
import AllClearances from "@/components/AllClearances"
import AllStudents from "@/components/AllStudents"
import AllUsedReceipts from "@/components/AllUsedReceipts"

type TabType = 'clearances' | 'students' | 'receipts';

const AdminHome=()=>{
    const [activeTab, setActiveTab] = useState<TabType>('clearances');

    const tabs: { id: TabType; label: string }[] = [
        { id: 'clearances', label: 'Clearances' },
        { id: 'students', label: 'Students' },
        { id: 'receipts', label: 'Used Receipts' },
    ];

    return(
        <div>
            {/* Tab Navigation Bar */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '1rem',
                borderBottom: '1px solid #e5e5e5',
                backgroundColor: '#f9f9f9'
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            backgroundColor: activeTab === tab.id ? '#007bff' : '#e5e5e5',
                            color: activeTab === tab.id ? 'white' : '#333',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '1rem' }}>
                {activeTab === 'clearances' && <AllClearances/>}
                {activeTab === 'students' && <AllStudents/>}
                {activeTab === 'receipts' && <AllUsedReceipts/>}
            </div>
        </div>
    )
}
export default AdminHome