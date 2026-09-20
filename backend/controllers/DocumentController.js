const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  getDocumentsByStudent,
  createDocument,
  setBlockchainInfo,
  findByHashWithStudent,
  findById,
  deleteDocument,
  updateStatus,
} = require("../models/documentModel");
const { findById: findStudentById, getAllStudents } = require("../models/studentModel");
const {
  extractTextFromFile,
  checkDocumentMatch,
  findOtherStudentMatches,
  checkIdsAgainstDatabase,
} = require("../services/ocrService");
const {
  registerDocumentOnChain,
  verifyDocumentOnChain,
} = require("../services/blockchainService");

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hashSum = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hashSum.update(chunk));
    stream.on("end", () => resolve(hashSum.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
}

async function listDocuments(req, res) {
  try {
    const { studentId } = req.params;
    const documents = await getDocumentsByStudent(studentId);
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch documents", error: err.message });
  }
}

async function uploadDocument(req, res) {
  try {
    const { studentId, title } = req.body;

    if (!studentId || !title) {
      return res.status(400).json({ message: "studentId and title are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const hash = await hashFile(req.file.path);

    const student = await findStudentById(studentId);
    const extractedText = await extractTextFromFile(req.file.path);

    let aiStatus = "Unchecked";
    let aiFields = {};

    if (student) {
      const check = checkDocumentMatch(extractedText, student);
      aiFields = check.fields;
      aiStatus = check.status;

      const allStudents = await getAllStudents();

      // Priority 1: does the text belong to a different REAL student?
      const otherMatches = findOtherStudentMatches(extractedText, allStudents, studentId);

      // Priority 2: are there ID-like numbers in the text that don't
      // belong to ANY student in the database at all?
      const { unknownIds } = checkIdsAgainstDatabase(extractedText, allStudents, studentId);

      if (otherMatches.length > 0) {
        aiFields.otherMatches = otherMatches;
        aiStatus = "Possible Wrong Student";
      } else if (unknownIds.length > 0) {
        aiFields.unknownIds = unknownIds;
        aiStatus = "Unrecognized ID Detected";
      }
    }

    let document = await createDocument({
      studentId,
      title,
      filename: req.file.filename,
      filepath: `/uploads/${req.file.filename}`,
      hash,
      extractedText,
      aiStatus,
      aiFields,
    });

    try {
      const txHash = await registerDocumentOnChain(document.id, hash);
      document = await setBlockchainInfo(document.id, txHash);
    } catch (chainErr) {
      console.error("Blockchain registration failed:", chainErr.message);
    }

    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ message: "Failed to upload document", error: err.message });
  }
}

async function removeDocument(req, res) {
  try {
    const { id } = req.params;
    const record = await findById(id);

    if (!record) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = path.join(__dirname, "..", "uploads", record.filename);
    fs.unlink(filePath, () => {});

    await deleteDocument(id);

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete document", error: err.message });
  }
}

async function verifyDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded for verification" });
    }

    const uploadedHash = await hashFile(req.file.path);
    fs.unlink(req.file.path, () => {});

    const record = await findByHashWithStudent(uploadedHash);

    if (!record) {
      return res.json({
        found: false,
        verified: false,
        message: "No matching document found. This file may not have been issued through TrustChain, or it has been modified.",
      });
    }

    let onChainValid = null;
    try {
      onChainValid = await verifyDocumentOnChain(record.id, uploadedHash);
    } catch (chainErr) {
      console.error("On-chain verification failed:", chainErr.message);
    }

    const verified = onChainValid === true;
    await updateStatus(record.id, verified ? "Verified" : "Mismatch");

    res.json({
      found: true,
      verified,
      title: record.title,
      studentName: record.student_name,
      studentCode: record.student_code,
      course: record.course,
      uploadedAt: record.uploaded_at,
      onChain: record.on_chain,
      aiStatus: record.ai_status,
      matchesBlockchain: onChainValid,
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
}

async function verifyByHash(req, res) {
  try {
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).json({ message: "Hash is required" });
    }

    const record = await findByHashWithStudent(hash);

    if (!record) {
      return res.json({
        found: false,
        verified: false,
        message: "No matching document found for this hash.",
      });
    }

    let onChainValid = null;
    try {
      onChainValid = await verifyDocumentOnChain(record.id, hash);
    } catch (chainErr) {
      console.error("On-chain verification failed:", chainErr.message);
    }

    const verified = onChainValid === true;
    await updateStatus(record.id, verified ? "Verified" : "Mismatch");

    res.json({
      found: true,
      verified,
      title: record.title,
      studentName: record.student_name,
      studentCode: record.student_code,
      course: record.course,
      uploadedAt: record.uploaded_at,
      onChain: record.on_chain,
      aiStatus: record.ai_status,
      matchesBlockchain: onChainValid,
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
}

module.exports = { listDocuments, uploadDocument, verifyDocument, verifyByHash, removeDocument, hashFile };