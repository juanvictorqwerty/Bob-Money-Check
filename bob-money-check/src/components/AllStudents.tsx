"use client"

import { useState, useEffect, Fragment as ReactFragment } from "react"
import { GetAllStudents, giveExceptionalClearance } from "@/actions/admin"

interface StudentData {
    id: string;
    email: string;
    name: string;
    matricule: string;
    dueFees: number;
}

const AllStudents = () => {
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [feeFilter, setFeeFilter] = useState<"all" | "has_dues" | "no_dues">("all");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const result = await GetAllStudents();
                if (result.success && Array.isArray(result.message)) {
                    setStudents(result.message as StudentData[]);
                } else {
                    const errMsg = typeof result.message === 'string' ? result.message : "Failed to load students";
                    setError(errMsg);
                }
            } catch (err) {
                setError("Failed to load students");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // Filter students based on search and fee status
    const filteredStudents = students.filter(student => {
        const matchesSearch = 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.matricule.toLowerCase().includes(searchTerm.toLowerCase());
        
        const hasDues = student.dueFees > 0;
        const matchesFee = 
            feeFilter === "all" || 
            (feeFilter === "has_dues" && hasDues) ||
            (feeFilter === "no_dues" && !hasDues);
        
        return matchesSearch && matchesFee;
    });

    const toggleExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleGiveExceptionalClearance = async (email: string) => {
        setActionLoading(email);
        setActionMessage(null);
        
        try {
            const result = await giveExceptionalClearance(email);
            
            if (result.success) {
                setActionMessage({ type: 'success', text: 'Clearance granted successfully!' });
                // Refresh the students list
                const refreshResult = await GetAllStudents();
                if (refreshResult.success && Array.isArray(refreshResult.message)) {
                    setStudents(refreshResult.message as StudentData[]);
                }
            } else {
                setActionMessage({ type: 'error', text: result.message || 'Failed to grant clearance' });
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: 'An error occurred' });
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                Loading students...
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
                backgroundColor: "#f5f5f5",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                flexWrap: "wrap"
            }}>
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by name, email, or matricule..."
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
                
                {/* Fee Status Filter */}
                <select
                    value={feeFilter}
                    onChange={(e) => setFeeFilter(e.target.value as "all" | "has_dues" | "no_dues")}
                    style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "0.25rem"
                    }}
                >
                    <option value="all">All Fees Status</option>
                    <option value="has_dues">Has Dues</option>
                    <option value="no_dues">No Dues</option>
                </select>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: "1rem", color: "#666" }}>
                Showing {filteredStudents.length} of {students.length} students
            </div>

            {/* Students Table */}
            {filteredStudents.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                    No students found
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
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Matricule</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Due Fees</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Status</th>
                            <th style={{ padding: "0.75rem", textAlign: "left" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => {
                            const isExpanded = expandedRow === student.id;
                            const isLoadingThis = actionLoading === student.email;
                            
                            return (
                                <ReactFragment key={student.id}>
                                    <tr 
                                        style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                                        onClick={() => toggleExpand(student.id)}
                                    >
                                        <td style={{ padding: "0.75rem" }}>
                                            {isExpanded ? student.name : student.name.length > 20 ? student.name.substring(0, 20) + "..." : student.name}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            {isExpanded ? student.email : student.email.length > 25 ? student.email.substring(0, 25) + "..." : student.email}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>{student.matricule}</td>
                                        <td style={{ padding: "0.75rem" }}>
                                            {formatCurrency(student.dueFees)}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>
                                            <span style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                backgroundColor: student.dueFees > 0 ? "#fff3cd" : "#d4edda",
                                                color: student.dueFees > 0 ? "#856404" : "#155724"
                                            }}>
                                                {student.dueFees > 0 ? "Has Dues" : "Cleared"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "0.75rem" }} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleGiveExceptionalClearance(student.email)}
                                                disabled={isLoadingThis}
                                                style={{
                                                    padding: "0.25rem 0.5rem",
                                                    fontSize: "0.75rem",
                                                    backgroundColor: isLoadingThis ? "#ccc" : "#007bff",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "0.25rem",
                                                    cursor: isLoadingThis ? "not-allowed" : "pointer"
                                                }}
                                            >
                                                {isLoadingThis ? "..." : "Grant Clearance"}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr style={{ backgroundColor: "#f0f8ff" }}>
                                            <td colSpan={6} style={{ padding: "1rem" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                                                    <div>
                                                        <strong>Full Name:</strong> {student.name}
                                                    </div>
                                                    <div>
                                                        <strong>Full Email:</strong> {student.email}
                                                    </div>
                                                    <div>
                                                        <strong>Student ID:</strong> {student.id}
                                                    </div>
                                                    <div>
                                                        <strong>Due Fees Amount:</strong> {formatCurrency(student.dueFees)}
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

export default AllStudents;
