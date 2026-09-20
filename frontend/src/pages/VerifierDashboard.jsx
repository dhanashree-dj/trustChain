import { useState } from "react";

const UPLOAD_VERIFY_URL = "http://localhost:5000/api/documents/verify";
const HASH_VERIFY_URL = "http://localhost:5000/api/documents/verify-hash";

function VerifierDashboard({ verifier, onLogout }) {
    const [mode, setMode] = useState("upload");
    const [file, setFile] = useState(null);
    const [hashInput, setHashInput] = useState("");
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [history, setHistory] = useState([]);

    function handleFileChange(e) {
        setFile(e.target.files[0]);
        setResult(null);
        setError("");
    }

    function recordHistory(res) {
        setHistory((prev) => [
            {
                title: res.title || "Unknown document",
                verified: res.verified,
                found: res.found,
                time: new Date().toLocaleTimeString(),
            },
            ...prev,
        ]);
    }

    async function handleVerifyUpload() {
        if (!file) {
            setError("Please choose a file to verify");
            return;
        }

        try {
            setChecking(true);
            setError("");
            setResult(null);

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(UPLOAD_VERIFY_URL, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Verification failed");
                return;
            }

            setResult(data);
            recordHistory(data);
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        } finally {
            setChecking(false);
        }
    }

    async function handleVerifyHash() {
        if (!hashInput.trim()) {
            setError("Please enter or paste a hash");
            return;
        }

        try {
            setChecking(true);
            setError("");
            setResult(null);

            const res = await fetch(`${HASH_VERIFY_URL}/${hashInput.trim()}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Verification failed");
                return;
            }

            setResult(data);
            recordHistory(data);
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        } finally {
            setChecking(false);
        }
    }

    return (
        <div className="dashboard-page">

            <nav className="navbar">
                <div className="logo">
                    Trust<span>Chain</span>
                </div>

                <div className="nav-links">
                    <span
                        className="nav-btn"
                        style={{ cursor: "default", color: "#9aa1ae" }}
                    >
                        Verifier: {verifier?.name}
                    </span>

                    <button className="logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">

                <p className="tagline">VERIFIER DASHBOARD</p>

                <div className="dashboard-heading">
                    <div>
                        <h1>Verify Documents</h1>
                        <p className="dashboard-description">
                            Check any TrustChain-issued document against the blockchain.
                        </p>
                    </div>
                </div>

                <div className="student-form" style={{ maxWidth: "500px" }}>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                        <button
                            onClick={() => { setMode("upload"); setResult(null); setError(""); }}
                            style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "8px",
                                border: mode === "upload" ? "1px solid #7853ff" : "1px solid #303a5c",
                                background: mode === "upload" ? "rgba(120, 83, 255, 0.15)" : "transparent",
                                color: "#ffffff",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                        >
                            Upload File
                        </button>
                        <button
                            onClick={() => { setMode("hash"); setResult(null); setError(""); }}
                            style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "8px",
                                border: mode === "hash" ? "1px solid #7853ff" : "1px solid #303a5c",
                                background: mode === "hash" ? "rgba(120, 83, 255, 0.15)" : "transparent",
                                color: "#ffffff",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                        >
                            Scan QR / Paste Hash
                        </button>
                    </div>

                    {error && (
                        <p style={{ color: "#e57373", marginBottom: "10px" }}>{error}</p>
                    )}

                    {mode === "upload" ? (
                        <>
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={handleFileChange} />
                            <button
                                className="primary-btn add-form-btn"
                                onClick={handleVerifyUpload}
                                disabled={checking}
                            >
                                {checking ? "Verifying..." : "Verify Document"}
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Paste SHA-256 hash here"
                                value={hashInput}
                                onChange={(e) => setHashInput(e.target.value)}
                            />
                            <button
                                className="primary-btn add-form-btn"
                                onClick={handleVerifyHash}
                                disabled={checking}
                            >
                                {checking ? "Verifying..." : "Verify by Hash"}
                            </button>
                        </>
                    )}

                    {result && (
                        <div
                            style={{
                                marginTop: "20px",
                                padding: "16px",
                                borderRadius: "10px",
                                background: result.verified ? "rgba(27, 138, 90, 0.12)" : "rgba(192, 57, 43, 0.12)",
                                border: result.verified ? "1px solid rgba(27, 138, 90, 0.3)" : "1px solid rgba(192, 57, 43, 0.3)",
                            }}
                        >
                            {result.found ? (
                                <>
                                    <h3 style={{ color: result.verified ? "#4fe3a5" : "#e57373", marginBottom: "8px" }}>
                                        {result.verified ? "✓ Document Verified" : "⚠ Blockchain Mismatch"}
                                    </h3>
                                    <p style={{ fontSize: "13px" }}><strong>Title:</strong> {result.title}</p>
                                    <p style={{ fontSize: "13px" }}><strong>Issued to:</strong> {result.studentName} ({result.studentCode})</p>
                                    <p style={{ fontSize: "13px" }}><strong>Course:</strong> {result.course}</p>
                                </>
                            ) : (
                                <>
                                    <h3 style={{ color: "#e57373", marginBottom: "8px" }}>✕ Document Not Found</h3>
                                    <p style={{ fontSize: "13px" }}>{result.message}</p>
                                </>
                            )}
                        </div>
                    )}

                </div>

                {history.length > 0 && (
                    <>
                        <p className="section-tag" style={{ marginTop: "40px" }}>THIS SESSION</p>
                        <h2 className="student-record-title">Verification History</h2>

                        <div className="student-grid">
                            {history.map((h, i) => (
                                <div key={i} className="student-card">
                                    <p style={{ fontSize: "13px", color: "#9aa1ae", marginBottom: "8px" }}>{h.time}</p>
                                    <h2 style={{ fontSize: "18px" }}>{h.title}</h2>
                                    <p style={{
                                        marginTop: "8px",
                                        color: h.verified ? "#4fe3a5" : "#e57373",
                                        fontWeight: "600",
                                        fontSize: "13px",
                                    }}>
                                        {h.found ? (h.verified ? "✓ Verified" : "⚠ Mismatch") : "✕ Not Found"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>

        </div>
    );
}

export default VerifierDashboard;