const pool = require("../db");
const bcrypt = require("bcrypt");

async function getAllStudents() {
  const result = await pool.query(
    `SELECT s.id, s.name, s.email, s.student_id AS "studentId", s.course, s.created_at,
            COALESCE(COUNT(d.id), 0)::int AS documents
     FROM students s
     LEFT JOIN documents d ON d.student_id = s.id
     GROUP BY s.id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
}

async function findByEmailOrStudentId(email, studentId) {
  const result = await pool.query(
    "SELECT * FROM students WHERE email = $1 OR student_id = $2",
    [email, studentId]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM students WHERE email = $1",
    [email]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    "SELECT * FROM students WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

async function createStudent({ name, email, studentId, course, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO students (name, email, student_id, course, password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, student_id AS "studentId", course, created_at`,
    [name, email, studentId, course, hashedPassword]
  );
  return { ...result.rows[0], documents: 0 };
}

async function deleteStudent(id) {
  const result = await pool.query(
    "DELETE FROM students WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllStudents,
  findByEmailOrStudentId,
  findByEmail,
  findById,
  createStudent,
  deleteStudent,
};