"use client"

import { useState, useEffect, Fragment as ReactFragment } from "react"
import { GetAllReceipts } from "@/actions/admin"
import { useTheme, themeColors } from "@/hooks/useTheme"

interface UsedReceiptData {
    receiptId: string;
    paymentDate: string;
    userId: string;
    createdAt: string;
    clearanceId: string;
    userName: string;
    userEmail: string;
    clearanceDate: string;
    clearanceActive: boolean;
    clearanceUsedReceipts: string | null;
}

const AllUsedReceipts = () => {
    const { isDark } = useTheme();
    const colors = isDark ? themeColors.dark : themeColors.light;
    const [receipts, setReceipts] = useState<UsedReceiptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    
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
            receipt.receiptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.clearanceId.toLowerCase().includes(searchTerm.toLowerCase());
        
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

    const toggleExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    // Format used receipts for display
    const formatUsedReceipts = (receipts: unknown): string => {
        if (!receipts) return "N/A";
        
        // Handle if it's already an object (from Drizzle JSON parsing)
        if (typeof receipts === 'object') {
            if (Array.isArray(receipts) && receipts.length > 0) {
                return receipts.map((r: unknown) => {
                    const item = r as Record<string, unknown>;
                    const id = String(item.id || 'N/A');
                    const paymentDate = String(item.paymentDate || 'N/A');
                    return `ID: ${id.substring(0, 8)}... | Date: ${paymentDate}`;
                }).join("\n");
            }
            return String(receipts);
        }
        
        // Handle if it's a string (might be JSON)
        if (typeof receipts === 'string') {
            try {
                const parsed = JSON.parse(receipts);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map((r: { id?: string; paymentDate?: string }) => 
                        `ID: ${r.id?.substring(0, 8) || 'N/A'}... | Date: ${r.paymentDate || 'N/A'}`
                    ).join("\n");
                }
                return String(parsed);
            } catch {
                // If not valid JSON, return as is
                return receipts;
            }
        }
        
        return String(receipts);
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: colors.text }}>
                Loading receipts...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "2rem", color: "#dc3545" }}>
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
                backgroundColor: colors.surface,
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                flexWrap: "wrap"
            }}>
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by name, email, receipt ID, or clearance ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: "0.5rem",
                        border: "1px solid " + colors.border,
                        borderRadius: "0.25rem",
                        flex: "1",
                        minWidth: "200px",
                        backgroundColor: colors.input,
                        color: colors.text
                    }}
                />
                
                {/* Date Filter */}
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "this_week" | "this_month")}
                    style={{
                        padding: "0.5rem",
                        border: "1px solid " + colors.border,
                        borderRadius: "0.25rem",
                        backgroundColor: colors.input,
                        color: colors.text
                    }}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                </select>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: "1rem", color: colors.textSecondary }}>
                Showing {filteredReceipts.length} of {receipts.length} receipts
            </div>

            {/* Receipts Table */}
            {filteredReceipts.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: colors.textSecondary }}>
                    No receipts found
                </div>
            ) : (
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    backgroundColor: colors.background
                }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.tableHeader, borderBottom: "2px solid " + colors.border }}>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Student Name</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Email</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Receipt ID</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Clearance ID</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Clearance Date</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Payment Date</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.map((receipt, index) => {
                            const isExpanded = expandedRow === receipt.receiptId;
                            const rowBg = index % 2 === 0 ? colors.tableRow : colors.tableRowAlt;
                            
                            return (
                                <ReactFragment key={receipt.receiptId}>
                                    <tr 
                                        style={{ borderBottom: "1px solid " + colors.tableBorder, cursor: "pointer", backgroundColor: rowBg }}
                                        onClick={() => toggleExpand(receipt.receiptId)}
                                    >
                                        <td style={{ padding: "0.75rem", color: colors.text }}>
                                            {isExpanded ? receipt.userName : receipt.userName.length > 20 ? receipt.userName.substring(0, 20) + "..." : receipt.userName}
                                        </td>
                                        <td style={{ padding: "0.75rem", color: colors.text }}>
                                            {isExpanded ? receipt.userEmail : receipt.userEmail.length > 25 ? receipt.userEmail.substring(0, 25) + "..." : receipt.userEmail}
                                        </td>
                                        <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: colors.textSecondary }}>
                                            {receipt.receiptId.substring(0, 8)}...
                                        </td>
                                        <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: colors.textSecondary }}>
                                            {receipt.clearanceId.substring(0, 8)}...
                                        </td>
                                        <td style={{ padding: "0.75rem", color: colors.text }}>
                                            {receipt.clearanceDate ? new Date(receipt.clearanceDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: "0.75rem", color: colors.text }}>
                                            {new Date(receipt.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            <span style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                backgroundColor: receipt.clearanceActive ? "#d4edda" : "#f8d7da",
                                                color: receipt.clearanceActive ? "#155724" : "#721c24"
                                            }}>
                                                {receipt.clearanceActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr style={{ backgroundColor: colors.expanded }}>
                                            <td colSpan={7} style={{ padding: "1rem" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", color: colors.text }}>
                                                    <div>
                                                        <strong>Full Receipt ID:</strong> {receipt.receiptId}
                                                    </div>
                                                    <div>
                                                        <strong>Full Clearance ID:</strong> {receipt.clearanceId}
                                                    </div>
                                                    <div>
                                                        <strong>User ID:</strong> {receipt.userId}
                                                    </div>
                                                    <div>
                                                        <strong>Created At:</strong> {new Date(receipt.createdAt).toLocaleString()}
                                                    </div>
                                                    <div style={{ gridColumn: "1 / -1" }}>
                                                        <strong>Clearance Used Receipts:</strong> {formatUsedReceipts(receipt.clearanceUsedReceipts)}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </ReactFragment>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllUsedReceipts;
