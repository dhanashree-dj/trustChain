import { useState, useEffect } from "react";
import "../App.css";
import ConfirmModal from "./ConfirmModal";

const API_URL = "http://localhost:5000/api/students";

function StudentDashboard({
    onHome,
    onLogout,
    onVerify,
    onViewDocuments
}) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [studentId, setStudentId] = useState("");
    const [course, setCourse] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [studentToDelete, setStudentToDelete] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        function closeMenu() {
            setOpenMenuId(null);
        }
        window.addEventListener("click", closeMenu);
        return () => window.removeEventListener("click", closeMenu);
    }, []);

    async function fetchStudents() {
        try {
            setLoading(true);
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Failed to load students");
            const data = await res.json();
            setStudents(data);
            setError("");
        } catch (err) {
            setError("Could not load students. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }

    async function addStudent() {

        if (!name || !email || !studentId || !course || !password) {
            setError("Please fill all fields");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, studentId, course, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to add student");
                return;
            }

            setStudents([data, ...students]);

            setName("");
            setEmail("");
            setStudentId("");
            setCourse("");
            setPassword("");
            setShowForm(false);
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        } finally {
            setSubmitting(false);
        }
    }

    function requestDelete(student) {
        setOpenMenuId(null);
        setStudentToDelete(student);
    }

    async function confirmDeleteStudent() {
        const student = studentToDelete;
        setStudentToDelete(null);
        if (!student) return;

        try {
            const res = await fetch(`${API_URL}/${student.id}`, {
                method: "DELETE",
            });

            if (res.status === 404) {
                await fetchStudents();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to delete student");
                return;
            }

            await fetchStudents();
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        }
    }

    function toggleMenu(e, studentId) {
        e.stopPropagation();
        setOpenMenuId(openMenuId === studentId ? null : studentId);
    }

    return (
        <div className="dashboard-page">

            <nav className="navbar">

                <div className="logo">
                    Trust<span>Chain</span>
                </div>

                <div className="nav-links">

                    <button
                        className="nav-btn active"
                        onClick={onHome}
                    >
                        Home
                    </button>

                    <button
                        className="nav-btn"
                        onClick={() => window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        })}
                    >
                        Dashboard
                    </button>

                    <button
                        className="nav-btn"
                        onClick={onVerify}
                    >
                        Verify Document
                    </button>

                    <button
                        className="logout-btn"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            <div className="dashboard-content">

                <p className="tagline">
                    STUDENT DASHBOARD
                </p>

                <div className="dashboard-heading">

                    <div>

                        <h1>
                            Document Management
                        </h1>

                        <p className="dashboard-description">
                            Manage and verify student documents securely
                            using blockchain technology.
                        </p>

                    </div>

                    <button
                        className="add-student-btn"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "✕ Close Form" : "+ Add Student"}
                    </button>

                </div>

                {error && (
                    <p style={{ color: "#e57373", marginBottom: "20px" }}>
                        {error}
                    </p>
                )}

                {showForm && (

                    <div className="student-form">

                        <h2>
                            Add New Student
                        </h2>

                        <div className="form-grid">

                            <input
                                type="text"
                                placeholder="Student Name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                            />

                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />

                            <input
                                type="text"
                                placeholder="Student ID"
                                value={studentId}
                                onChange={(e) =>
                                    setStudentId(e.target.value)
                                }
                            />

                            <input
                                type="text"
                                placeholder="Course"
                                value={course}
                                onChange={(e) =>
                                    setCourse(e.target.value)
                                }
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                        </div>

                        <button
                            className="primary-btn add-form-btn"
                            onClick={addStudent}
                            disabled={submitting}
                        >
                            {submitting ? "Adding..." : "Add Student"}
                        </button>

                    </div>

                )}

                <div className="stats-section">

                    <div className="stat">
                        <h2>{students.length}</h2>
                        <p>Total Students</p>
                    </div>

                    <div className="stat">

                        <h2>
                            {students.reduce(
                                (total, student) =>
                                    total + (student.documents || 0),
                                0
                            )}
                        </h2>

                        <p>Total Documents</p>

                    </div>

                    <div className="stat">

                        <h2>100%</h2>

                        <p>Blockchain Secured</p>

                    </div>

                    <div className="stat">

                        <h2>✓</h2>

                        <p>Network Status</p>

                    </div>

                </div>

                <p className="section-tag">
                    REGISTERED STUDENTS
                </p>

                <h2 className="student-record-title">
                    Student Records
                </h2>

                {loading && <p>Loading students...</p>}

                {!loading && students.length === 0 && !error && (
                    <p>No students yet — add one to get started.</p>
                )}

                <div className="student-grid">

                    {students.map((student) => (

                        <div
                            className="student-card"
                            key={student.id}
                            style={{ position: "relative" }}
                        >

                            <button
                                onClick={(e) => toggleMenu(e, student.id)}
                                style={{
                                    position: "absolute",
                                    top: "18px",
                                    right: "18px",
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "20px",
                                    lineHeight: "1",
                                    color: "#9aa1ae",
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    zIndex: 5,
                                }}
                            >
                                ⋮
                            </button>

                            {openMenuId === student.id && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        position: "absolute",
                                        top: "48px",
                                        right: "18px",
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
                                        onClick={() => requestDelete(student)}
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
                                        Delete Student
                                    </button>
                                </div>
                            )}

                            <div className="student-card-top">

                                <div className="student-avatar">
                                    {student.name.charAt(0)}
                                </div>

                                <div className="student-status">
                                    ✓ Verified
                                </div>

                            </div>

                            <h2>
                                {student.name}
                            </h2>

                            <p className="student-course">
                                {student.course}
                            </p>

                            <div className="student-info">

                                <p>
                                    <span>Email</span>
                                    {student.email}
                                </p>

                                <p>
                                    <span>Student ID</span>
                                    {student.studentId}
                                </p>

                            </div>

                            <div className="document-count">

                                📄

                                <strong>
                                    {student.documents || 0}
                                </strong>

                                <span>
                                    Documents
                                </span>

                            </div>

                            <button
                                className="primary-btn"
                                onClick={() => onViewDocuments(student)}
                            >
                                View Documents
                            </button>

                        </div>

                    ))}

                </div>

            </div>

            <ConfirmModal
                open={!!studentToDelete}
                title="Delete Student"
                message={
                    studentToDelete
                        ? `Delete ${studentToDelete.name}? This also deletes all their uploaded documents. This cannot be undone.`
                        : ""
                }
                onConfirm={confirmDeleteStudent}
                onCancel={() => setStudentToDelete(null)}
            />

        </div>
    );
}

export default StudentDashboard;