const pool = require("../db");

async function getDocumentsByStudent(studentId) {
  const result = await pool.query(
    "SELECT * FROM documents WHERE student_id = $1 ORDER BY uploaded_at DESC",
    [studentId]
  );
  return result.rows;
}

async function createDocument({
  studentId,
  title,
  filename,
  filepath,
  hash,
  extractedText,
  aiStatus,
  aiFields,
}) {
  const result = await pool.query(
    `INSERT INTO documents (student_id, title, filename, filepath, hash, extracted_text, ai_status, ai_fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [studentId, title, filename, filepath, hash, extractedText, aiStatus, JSON.stringify(aiFields || {})]
  );
  return result.rows[0];
}

async function setBlockchainInfo(documentId, txHash) {
  const result = await pool.query(
    `UPDATE documents SET blockchain_tx_hash = $1, on_chain = true WHERE id = $2 RETURNING *`,
    [txHash, documentId]
  );
  return result.rows[0];
}

async function findByHash(hash) {
  const result = await pool.query(
    "SELECT * FROM documents WHERE hash = $1",
    [hash]
  );
  return result.rows[0];
}

async function findByHashWithStudent(hash) {
  const result = await pool.query(
    `SELECT d.*, s.name AS student_name, s.student_id AS student_code, s.course
     FROM documents d
     JOIN students s ON s.id = d.student_id
     WHERE d.hash = $1`,
    [hash]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    "SELECT * FROM documents WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

async function deleteDocument(id) {
  const result = await pool.query(
    "DELETE FROM documents WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
}

async function updateStatus(id, status) {
  const result = await pool.query(
    "UPDATE documents SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  return result.rows[0];
}

module.exports = {
  getDocumentsByStudent,
  createDocument,
  setBlockchainInfo,
  findByHash,
  findByHashWithStudent,
  findById,
  deleteDocument,
  updateStatus,
};