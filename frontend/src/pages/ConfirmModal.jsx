function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Delete" }) {
    if (!open) return null;

    return (
        <div
            onClick={onCancel}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(4, 6, 16, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "380px",
                    maxWidth: "90%",
                    background: "linear-gradient(145deg, #151c34, #0f1529)",
                    border: "1px solid #303957",
                    borderRadius: "18px",
                    padding: "30px",
                    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.5)",
                }}
            >
                <h3 style={{ color: "#ffffff", fontSize: "20px", marginBottom: "12px" }}>
                    {title}
                </h3>

                <p style={{ color: "#9da5c0", fontSize: "14px", lineHeight: "1.6", marginBottom: "26px" }}>
                    {message}
                </p>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: "12px",
                            background: "transparent",
                            border: "1px solid #343d5d",
                            borderRadius: "10px",
                            color: "#ffffff",
                            fontWeight: "600",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: "12px",
                            background: "linear-gradient(135deg, #e74c3c, #c0392b)",
                            border: "none",
                            borderRadius: "10px",
                            color: "#ffffff",
                            fontWeight: "700",
                            fontSize: "14px",
                            cursor: "pointer",
                            boxShadow: "0 8px 20px rgba(192, 57, 43, 0.3)",
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;