const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findByEmail } = require("../models/studentModel");
const {
  findByEmail: findVerifierByEmail,
  createVerifier,
} = require("../models/verifierModel");

const JWT_SECRET = process.env.JWT_SECRET || "trustchain_dev_secret";

async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (role === "Verifier") {
      const verifier = await findVerifierByEmail(email);

      if (!verifier) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const match = await bcrypt.compare(password, verifier.password);

      if (!match) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: verifier.id, email: verifier.email, role: "Verifier" },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      return res.json({
        token,
        role: "Verifier",
        verifier: {
          id: verifier.id,
          name: verifier.name,
          email: verifier.email,
        },
      });
    }

    // Organization role not implemented yet
    if (role === "Organization") {
      return res.status(501).json({ message: `Login for role "Organization" is not implemented yet` });
    }

    // Default: Student role
    const student = await findByEmail(email);

    if (!student) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!student.password) {
      return res.status(401).json({ message: "This account has no password set. Contact admin." });
    }

    const match = await bcrypt.compare(password, student.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email, role: "Student" },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      role: "Student",
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentId: student.student_id,
        course: student.course,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// One-time helper to create a verifier account. Call this once via
// curl to seed your first verifier login, since there's no
// Organization Dashboard yet to create these through the UI.
async function registerVerifier(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const existing = await findVerifierByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "A verifier with this email already exists" });
    }

    const verifier = await createVerifier({ name, email, password });
    res.status(201).json(verifier);
  } catch (err) {
    res.status(500).json({ message: "Failed to create verifier", error: err.message });
  }
}

module.exports = { login, registerVerifier };