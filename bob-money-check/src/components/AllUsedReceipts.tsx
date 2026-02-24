"use client"

import { useState, useEffect } from "react"
import { GetAllReceipts } from "@/actions/admin"

interface UsedReceiptData {
    id: string;
    paymentDate: string;
    userId: string;
    createdAt: string;
    clearanceId: string;
    userName: string;
    userEmail: string;
}

const AllUsedReceipts = () => {
    const [receipts, setReceipts] = useState<UsedReceiptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState<"all" | "today" | "this_week" | "this_month">("all");

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const result = await GetAllReceipts();
                if (result.success && Array.isArray(result.message)) {
                    setReceipts(result.message as UsedReceiptData[]);
                } else {
                    const errMsg = typeof result.message === 'string' ? result.message : "Failed to load receipts";
                    setError(errMsg);
                }
            } catch (err) {
                setError("Failed to load receipts");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReceipts();
    }, []);

    // Filter receipts based on search and date
    const filteredReceipts = receipts.filter(receipt => {
        const matchesSearch = 
            receipt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Date filtering
        let matchesDate = true;
        if (dateFilter !== "all") {
            const paymentDate = new Date(receipt.paymentDate);
            const now = new Date();
            
            if (dateFilter === "today") {
                matchesDate = paymentDate.toDateString() === now.toDateString();
            } else if (dateFilter === "this_week") {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                matchesDate = paymentDate >= weekAgo;
            } else if (dateFilter === "this_month") {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                matchesDate = paymentDate >= monthAgo;
            }
        }
        
        return matchesSearch && matchesDate;
    });

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                Loading receipts...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "2rem", color: "red" }}>
                Error: {error}
            </div>
        );
    }

    return (
        <div>
            {/* Filter Controls */}
            <div style={{ 
                display: "flex", 
                gap: "1rem", 
                padding: "1rem", 
                backgroundColor: "#f5f5f5",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                flexWrap: "wrap"
            }}>
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by name, email, or receipt ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "0.25rem",
                        flex: "1",
                        minWidth: "200px"
                    }}
                />
                
                {/* Date Filter */}
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "this_week" | "this_month")}
                    style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "0.25rem"
                    }}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                </select>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: "1rem", color: "#666" }}>
                Showing {filteredReceipts.length} of {receipts.length} receipts
            </div>

            {/* Receipts Table */}
            {filteredReceipts.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                    No receipts found
                </div>
            ) : (
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "2px solid #ddd" }}>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Student Name</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Email</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Receipt ID</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Payment Date</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.map((receipt) => (
                            <tr 
                                key={`${receipt.id}-${receipt.paymentDate}`} 
                                style={{ borderBottom: "1px solid #eee" }}
                            >
                                <td style={{ padding: "0.75rem" }}>{receipt.userName}</td>
                                <td style={{ padding: "0.75rem" }}>{receipt.userEmail}</td>
                                <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#666" }}>
                                    {receipt.id.substring(0, 8)}...
                                </td>
                                <td style={{ padding: "0.75rem" }}>
                                    {new Date(receipt.paymentDate).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "0.75rem" }}>
                                    {new Date(receipt.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllUsedReceipts;
