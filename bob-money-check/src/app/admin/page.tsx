"use client"

import { useState } from "react"
import { ThemeProvider, useTheme, themeColors } from "@/hooks/useTheme"
import AllClearances from "@/components/AllClearances"
import AllStudents from "@/components/AllStudents"
import AllUsedReceipts from "@/components/AllUsedReceipts"

type TabType = 'clearances' | 'students' | 'receipts';

const AdminContent = () => {
    const { isDark, toggleTheme } = useTheme();
    const colors = isDark ? themeColors.dark : themeColors.light;
    const [activeTab, setActiveTab] = useState<TabType>('clearances');

    const tabs: { id: TabType; label: string }[] = [
        { id: 'clearances', label: 'Clearances' },
        { id: 'students', label: 'Students' },
        { id: 'receipts', label: 'Used Receipts' },
    ];

    return(
        <div style={{ backgroundColor: colors.background, minHeight: "100vh" }}>
            {/* Header with Theme Toggle */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid ' + colors.border,
                backgroundColor: colors.surface
            }}>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
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
                                backgroundColor: activeTab === tab.id ? '#007bff' : colors.tableHeader,
                                color: activeTab === tab.id ? 'white' : colors.text,
                                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid ' + colors.border,
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        backgroundColor: colors.tableRow,
                        color: colors.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isDark ? '☀️ Light' : '🌙 Dark'}
                </button>
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

const AdminHome = () => {
    return (
        <ThemeProvider>
            <AdminContent />
        </ThemeProvider>
    )
}

export default AdminHome
