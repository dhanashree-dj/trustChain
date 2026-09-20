import { useState } from "react";
import "../App.css";

const API_URL = "http://localhost:5000/api/documents";

function DocumentUpload({ student, onBack, onUploaded }) {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    function handleFileChange(e) {
        setFile(e.target.files[0]);
    }

    async function handleUpload() {
        if (!title || !file) {
            alert("Please add a title and choose a file");
            return;
        }

        try {
            setUploading(true);
            setError("");

            const formData = new FormData();
            formData.append("studentId", student.id);
            formData.append("title", title);
            formData.append("file", file);

            const res = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Upload failed");
                return;
            }

            setTitle("");
            setFile(null);

            if (onUploaded) onUploaded(data);
            onBack();
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-box">
                <h1>TrustChain</h1>
                <p className="login-subtitle">Upload Document</p>
                <h2>Add a Document</h2>
                <p className="login-text">Uploading for {student?.name}</p>

                {error && (
                    <p style={{ color: "#c0392b", marginBottom: "10px" }}>{error}</p>
                )}

                <label>Document Title</label>
                <input
                    type="text"
                    placeholder="e.g. Degree Certificate"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label>File (PDF, PNG, JPG, DOCX)</label>
                <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                    onChange={handleFileChange}
                />

                <button
                    className="login-btn"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Upload Document"}
                </button>

                <p className="register-text">
                    <span onClick={onBack}>← Back to Profile</span>
                </p>
            </div>
        </div>
    );
}

export default DocumentUpload;