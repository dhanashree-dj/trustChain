const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes");
const documentRoutes = require("./routes/documentRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.send("TrustChain Backend is Running");
});

app.use("/api/students", studentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`TrustChain server running on port ${PORT}`);
});