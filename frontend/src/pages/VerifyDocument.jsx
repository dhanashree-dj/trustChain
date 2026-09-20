import { useState } from "react";
import "../App.css";

const UPLOAD_VERIFY_URL = "http://localhost:5000/api/documents/verify";
const HASH_VERIFY_URL = "http://localhost:5000/api/documents/verify-hash";

function VerifyDocument({ onBack }) {
    const [mode, setMode] = useState("upload"); // "upload" or "hash"
    const [file, setFile] = useState(null);
    const [hashInput, setHashInput] = useState("");
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    function handleFileChange(e) {
        setFile(e.target.files[0]);
        setResult(null);
        setError("");
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
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        } finally {
            setChecking(false);
        }
    }

    async function handleVerifyHash() {
        if (!hashInput.trim()) {
            setError("Please enter or paste a hash (from a QR code scan)");
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
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        } finally {
            setChecking(false);
        }
    }

    return (
        <div className="login-page">

            <div className="login-box">

                <h1>TrustChain</h1>

                <p className="login-subtitle">
                    Document Verification
                </p>

                <h2>Verify a Document</h2>

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
                    <p style={{ color: "#e57373", marginBottom: "10px" }}>
                        {error}
                    </p>
                )}

                {mode === "upload" ? (
                    <>
                        <p className="login-text">
                            Upload a document to check its authenticity against the blockchain.
                        </p>

                        <label>File (PDF, PNG, JPG, DOCX)</label>
                        <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.docx"
                            onChange={handleFileChange}
                        />

                        <button
                            className="login-btn"
                            onClick={handleVerifyUpload}
                            disabled={checking}
                        >
                            {checking ? "Verifying..." : "Verify Document"}
                        </button>
                    </>
                ) : (
                    <>
                        <p className="login-text">
                            Scan a document's QR code with your phone, then paste the hash it shows here.
                        </p>

                        <label>Document Hash</label>
                        <input
                            type="text"
                            placeholder="Paste SHA-256 hash here"
                            value={hashInput}
                            onChange={(e) => setHashInput(e.target.value)}
                        />

                        <button
                            className="login-btn"
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
                            marginTop: "24px",
                            padding: "18px",
                            borderRadius: "10px",
                            background: result.verified
                                ? "rgba(27, 138, 90, 0.12)"
                                : "rgba(192, 57, 43, 0.12)",
                            border: result.verified
                                ? "1px solid rgba(27, 138, 90, 0.3)"
                                : "1px solid rgba(192, 57, 43, 0.3)",
                        }}
                    >
                        {result.found ? (
                            <>
                                <h3
                                    style={{
                                        color: result.verified ? "#4fe3a5" : "#e57373",
                                        marginBottom: "10px",
                                    }}
                                >
                                    {result.verified ? "✓ Document Verified" : "⚠ Blockchain Mismatch"}
                                </h3>
                                <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                                    <strong>Title:</strong> {result.title}
                                </p>
                                <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                                    <strong>Issued to:</strong> {result.studentName} ({result.studentCode})
                                </p>
                                <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                                    <strong>Course:</strong> {result.course}
                                </p>
                                <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                                    <strong>On blockchain:</strong> {result.onChain ? "Yes" : "No"}
                                </p>
                                {!result.verified && (
                                    <p style={{ fontSize: "13px", color: "#e57373", marginTop: "10px" }}>
                                        The document's hash was found in our records, but the blockchain
                                        record doesn't confirm it — this could mean the document was
                                        revoked or never fully registered on-chain.
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 style={{ color: "#e57373", marginBottom: "10px" }}>
                                    ✕ Document Not Found
                                </h3>
                                <p style={{ fontSize: "14px" }}>
                                    {result.message}
                                </p>
                            </>
                        )}
                    </div>
                )}

                <p className="register-text">
                    <span onClick={onBack}>← Back</span>
                </p>

            </div>

        </div>
    );
}

export default VerifyDocument;