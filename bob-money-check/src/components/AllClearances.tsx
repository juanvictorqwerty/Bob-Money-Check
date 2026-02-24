"use client"

import { useState, useEffect } from "react"
import { GetAllClearances } from "@/actions/admin"

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
    const [clearances, setClearances] = useState<ClearanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    
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

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                Loading clearances...
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
                    placeholder="Search by name, email, or ID..."
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
                
                {/* Active Status Filter */}
                <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
                    style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "0.25rem"
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: "1rem", color: "#666" }}>
                Showing {filteredClearances.length} of {clearances.length} clearances
            </div>

            {/* Clearances Table */}
            {filteredClearances.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                    No clearances found
                </div>
            ) : (
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "2px solid #ddd" }}>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Name</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Email</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Date</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Status</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClearances.map((clearance) => {
                            const isExpanded = expandedRow === clearance.id;
                            return (
                                <>
                                    <tr 
                                        key={clearance.id} 
                                        style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                                        onClick={() => toggleExpand(clearance.id)}
                                    >
                                        <td style={{ padding: "0.75rem" }}>
                                            {isExpanded ? clearance.userName : clearance.userName.length > 20 ? clearance.userName.substring(0, 20) + "..." : clearance.userName}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            {isExpanded ? clearance.userEmail : clearance.userEmail.length > 25 ? clearance.userEmail.substring(0, 25) + "..." : clearance.userEmail}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
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
                                        <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#666" }}>
                                            {clearance.id.substring(0, 8)}...
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr key={`${clearance.id}-expanded`} style={{ backgroundColor: "#f0f8ff" }}>
                                            <td colSpan={5} style={{ padding: "1rem" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
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
                                                        <strong>Used Receipts:</strong> {clearance.usedReceipts || "N/A"}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllClearances;
