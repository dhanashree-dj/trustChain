import { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";

const API_URL = "http://localhost:5000/api/documents";

function statusColor(status) {
    if (status === "Match") return "#4fe3a5";
    if (status === "Partial Match") return "#e0b04d";
    if (status === "Mismatch") return "#e57373";
    if (status === "Possible Wrong Student") return "#e57373";
    return "#9aa1ae";
}

function StudentProfile({ student, onBack, onUpload, onVerify }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [docToDelete, setDocToDelete] = useState(null);

    useEffect(() => {
        if (student?.id) {
            fetchDocuments();
        }
    }, [student]);

    useEffect(() => {
        function closeMenu() {
            setOpenMenuId(null);
        }
        window.addEventListener("click", closeMenu);
        return () => window.removeEventListener("click", closeMenu);
    }, []);

    async function fetchDocuments() {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/${student.id}`);
            if (!res.ok) throw new Error("Failed to load documents");
            const data = await res.json();
            setDocuments(data);
            setError("");
        } catch (err) {
            setError("Could not load documents. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }

    function requestDelete(doc) {
        setOpenMenuId(null);
        setDocToDelete(doc);
    }

    async function confirmDeleteDocument() {
        const doc = docToDelete;
        setDocToDelete(null);
        if (!doc) return;

        try {
            const res = await fetch(`${API_URL}/${doc.id}`, {
                method: "DELETE",
            });

            if (res.status === 404) {
                await fetchDocuments();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to delete document");
                return;
            }

            await fetchDocuments();
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        }
    }

    function toggleMenu(e, docId) {
        e.stopPropagation();
        setOpenMenuId(openMenuId === docId ? null : docId);
    }

    return (
        <div className="profile-page">

            <nav className="navbar">
                <div className="logo">
                    Trust<span>Chain</span>
                </div>

                <div className="nav-links">
                    <button className="nav-btn" onClick={onBack}>Dashboard</button>
                    <button className="nav-btn" onClick={onVerify}>Verify Document</button>
                </div>
            </nav>

            <div className="profile-content">

                <p className="tagline">STUDENT PROFILE</p>

                <div className="profile-header">

                    <div className="profile-avatar">
                        {student.name.charAt(0)}
                    </div>

                    <div>
                        <h1>{student.name}</h1>
                        <p>{student.course}</p>
                    </div>

                </div>

                <div className="student-details">

                    <div>
                        <span>Student ID</span>
                        <strong>{student.studentId || student.student_id}</strong>
                    </div>

                    <div>
                        <span>Email</span>
                        <strong>{student.email}</strong>
                    </div>

                </div>

                <div className="documents-header">
                    <div>
                        <p className="tagline">DOCUMENT MANAGEMENT</p>
                        <h2>Student Documents</h2>
                    </div>

                    <button
                        className="add-student-btn"
                        onClick={onUpload}
                    >
                        + Upload Document
                    </button>
                </div>

                {error && <p style={{ color: "#e57373" }}>{error}</p>}

                {loading && <p>Loading documents...</p>}

                {!loading && documents.length === 0 && !error && (
                    <p>No documents uploaded yet.</p>
                )}

                <div className="documents-grid">

                    {documents.map((doc) => (

                        <div
                            className="document-card"
                            key={doc.id}
                            style={{ position: "relative" }}
                        >

                            <button
                                onClick={(e) => toggleMenu(e, doc.id)}
                                style={{
                                    position: "absolute",
                                    top: "14px",
                                    right: "14px",
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "20px",
                                    lineHeight: "1",
                                    color: "#9aa1ae",
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                }}
                            >
                                ⋮
                            </button>

                            {openMenuId === doc.id && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        position: "absolute",
                                        top: "42px",
                                        right: "14px",
                                        background: "#151c34",
                                        border: "1px solid #303957",
                                        borderRadius: "10px",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                                        zIndex: 10,
                                        minWidth: "160px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <button
                                        onClick={() => requestDelete(doc)}
                                        style={{
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "12px 16px",
                                            background: "transparent",
                                            border: "none",
                                            color: "#e57373",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Delete Document
                                    </button>
                                </div>
                            )}

                            <div className="document-icon">
                                📄
                            </div>

                            <div>
                                <h3>{doc.title}</h3>
                                <p>{doc.filename}</p>
                            </div>

                            <span
                                className="verified"
                                style={{
                                    background:
                                        doc.status === "Verified" ? "rgba(57, 214, 151, 0.08)" :
                                        doc.status === "Mismatch" ? "rgba(229, 115, 115, 0.12)" :
                                        undefined,
                                    color:
                                        doc.status === "Mismatch" ? "#e57373" : undefined,
                                }}
                            >
                                {doc.status || "Pending"}
                            </span>

                            {doc.ai_status && doc.ai_status !== "Unchecked" && (
                                <div style={{ marginBottom: "10px" }}>
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: statusColor(doc.ai_status),
                                            marginBottom: "4px",
                                        }}
                                    >
                                        AI Check: {doc.ai_status}
                                    </p>

                                    {doc.ai_fields && doc.ai_fields.otherMatches && doc.ai_fields.otherMatches.length > 0 && (
                                        <p style={{ fontSize: "11px", color: "#e57373", marginBottom: "4px" }}>
                                            ⚠ Text matches {doc.ai_fields.otherMatches[0].name} (ID: {doc.ai_fields.otherMatches[0].studentId}) instead — check you uploaded to the right profile.
                                        </p>
                                    )}

                                    {doc.ai_fields && doc.ai_fields.unknownIds && doc.ai_fields.unknownIds.length > 0 && (
                                        <p style={{ fontSize: "11px", color: "#e57373", marginBottom: "4px" }}>
                                            ⚠ ID {doc.ai_fields.unknownIds.join(", ")} found in document doesn't match any registered student.
                                        </p>
                                    )}

                                    {doc.ai_fields && (
                                        <p style={{ fontSize: "11px", color: "#9aa1ae" }}>
                                            Name {doc.ai_fields.name ? "✓" : "✗"} · Student ID{" "}
                                            {doc.ai_fields.studentId ? "✓" : "✗"} · Course{" "}
                                            {doc.ai_fields.course ? "✓" : "✗"}
                                        </p>
                                    )}
                                </div>
                            )}

                            {doc.hash && (
                                <>
                                    <p
                                        title={doc.hash}
                                        style={{
                                            fontSize: "11px",
                                            color: "#9aa1ae",
                                            marginBottom: "10px",
                                            wordBreak: "break-all",
                                        }}
                                    >
                                        SHA-256: {doc.hash.slice(0, 16)}...
                                    </p>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${doc.hash}`}
                                        alt="Verification QR code"
                                        title="Scan to verify this document"
                                        style={{
                                            display: "block",
                                            margin: "0 auto 14px",
                                            borderRadius: "6px",
                                            background: "#ffffff",
                                            padding: "4px",
                                        }}
                                    />
                                </>
                            )}

                            <button
                                className="primary-btn"
                                onClick={() =>
                                    window.open(`http://localhost:5000${doc.filepath}`, "_blank")
                                }
                            >
                                View Document
                            </button>

                        </div>

                    ))}

                </div>

            </div>

            <ConfirmModal
                open={!!docToDelete}
                title="Delete Document"
                message={docToDelete ? `Delete "${docToDelete.title}"? This cannot be undone.` : ""}
                onConfirm={confirmDeleteDocument}
                onCancel={() => setDocToDelete(null)}
            />

        </div>
    );
}

export default StudentProfile;