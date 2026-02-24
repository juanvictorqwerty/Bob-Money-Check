"use client"

import { useState, useEffect, Fragment as ReactFragment } from "react"
import { GetAllClearances, ToggleClearance } from "@/actions/admin"
import { useTheme, themeColors } from "@/hooks/useTheme"

interface ClearanceData {
    id: string;
    userId: string;
    date: string;
    active: boolean;
    usedReceipts: string | null;
    userName: string;
    userEmail: string;
}

const AllClearances = () => {
    const { isDark } = useTheme();
    const colors = isDark ? themeColors.dark : themeColors.light;
    const [clearances, setClearances] = useState<ClearanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

    useEffect(() => {
        const fetchClearances = async () => {
            try {
                const result = await GetAllClearances();
                if (result.success && Array.isArray(result.message)) {
                    setClearances(result.message as ClearanceData[]);
                } else {
                    const errMsg = typeof result.message === 'string' ? result.message : "Failed to load clearances";
                    setError(errMsg);
                }
            } catch (err) {
                setError("Failed to load clearances");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClearances();
    }, []);

    // Filter clearances based on search and active status
    const filteredClearances = clearances.filter(clearance => {
        const matchesSearch = 
            clearance.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clearance.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clearance.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesActive = 
            activeFilter === "all" || 
            (activeFilter === "active" && clearance.active) ||
            (activeFilter === "inactive" && !clearance.active);
        
        return matchesSearch && matchesActive;
    });

    const toggleExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleToggleClearance = async (clearanceId: string, currentStatus: boolean) => {
        setActionLoading(clearanceId);
        setActionMessage(null);
        
        try {
            const newStatus = !currentStatus;
            const result = await ToggleClearance(clearanceId, newStatus);
            
            if (result.success) {
                setActionMessage({ type: 'success', text: result.message || 'Status updated!' });
                // Refresh the list
                const refreshResult = await GetAllClearances();
                if (refreshResult.success && Array.isArray(refreshResult.message)) {
                    setClearances(refreshResult.message as ClearanceData[]);
                }
            } else {
                setActionMessage({ type: 'error', text: result.message || 'Failed to update status' });
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: 'An error occurred' });
            console.error(err);
        } finally {
            setActionLoading(null);
        }
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
                Loading clearances...
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
            {/* Action Message */}
            {actionMessage && (
                <div style={{ 
                    padding: "1rem", 
                    marginBottom: "1rem", 
                    borderRadius: "0.5rem",
                    backgroundColor: actionMessage.type === 'success' ? "#d4edda" : "#f8d7da",
                    color: actionMessage.type === 'success' ? "#155724" : "#721c24"
                }}>
                    {actionMessage.text}
                </div>
            )}

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
                    placeholder="Search by name, email, or ID..."
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
                
                {/* Active Status Filter */}
                <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
                    style={{
                        padding: "0.5rem",
                        border: "1px solid " + colors.border,
                        borderRadius: "0.25rem",
                        backgroundColor: colors.input,
                        color: colors.text
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: "1rem", color: colors.textSecondary }}>
                Showing {filteredClearances.length} of {clearances.length} clearances
            </div>

            {/* Clearances Table */}
            {filteredClearances.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: colors.textSecondary }}>
                    No clearances found
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
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Name</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Email</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Date</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Status</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>Actions</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", color: colors.text }}>ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClearances.map((clearance, index) => {
                            const isExpanded = expandedRow === clearance.id;
                            const rowBg = index % 2 === 0 ? colors.tableRow : colors.tableRowAlt;
                            
                            return (
                                <ReactFragment key={clearance.id}>
                                    <tr 
                                        style={{ borderBottom: "1px solid " + colors.tableBorder, cursor: "pointer", backgroundColor: rowBg }}
                                        onClick={() => toggleExpand(clearance.id)}
                                    >
                                        <td style={{ padding: "0.75rem", color: colors.text }}>
                                            {isExpanded ? clearance.userName : clearance.userName.length > 20 ? clearance.userName.substring(0, 20) + "..." : clearance.userName}
                                        </td>
                                        <td style={{ padding: "0.75rem", color: colors.text }}>
                                            {isExpanded ? clearance.userEmail : clearance.userEmail.length > 25 ? clearance.userEmail.substring(0, 25) + "..." : clearance.userEmail}
                                        </td>
                                        <td style={{ padding: "0.75rem", color: colors.text }}>
                                            {new Date(clearance.date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            <span style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                backgroundColor: clearance.active ? "#d4edda" : "#f8d7da",
                                                color: clearance.active ? "#155724" : "#721c24"
                                            }}>
                                                {clearance.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            <button
                                                onClick={() => handleToggleClearance(clearance.id, clearance.active)}
                                                disabled={actionLoading === clearance.id}
                                                style={{
                                                    padding: "0.25rem 0.5rem",
                                                    fontSize: "0.75rem",
                                                    backgroundColor: actionLoading === clearance.id ? "#6c757d" : (clearance.active ? "#dc3545" : "#28a745"),
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "0.25rem",
                                                    cursor: actionLoading === clearance.id ? "not-allowed" : "pointer"
                                                }}
                                            >
                                                {actionLoading === clearance.id ? "..." : (clearance.active ? "Deactivate" : "Activate")}
                                            </button>
                                        </td>
                                        <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: colors.textSecondary }}>
                                            {clearance.id.substring(0, 8)}...
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr style={{ backgroundColor: colors.expanded }}>
                                            <td colSpan={6} style={{ padding: "1rem" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", color: colors.text }}>
                                                    <div>
                                                        <strong>Full Name:</strong> {clearance.userName}
                                                    </div>
                                                    <div>
                                                        <strong>Full Email:</strong> {clearance.userEmail}
                                                    </div>
                                                    <div>
                                                        <strong>Clearance ID:</strong> {clearance.id}
                                                    </div>
                                                    <div>
                                                        <strong>User ID:</strong> {clearance.userId}
                                                    </div>
                                                    <div>
                                                        <strong>Created Date:</strong> {new Date(clearance.date).toLocaleString()}
                                                    </div>
                                                    <div>
                                                        <strong>Used Receipts:</strong> {formatUsedReceipts(clearance.usedReceipts)}
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

export default AllClearances;
