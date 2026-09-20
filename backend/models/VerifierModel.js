const pool = require("../db");
const bcrypt = require("bcrypt");

async function findByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM verifiers WHERE email = $1",
    [email]
  );
  return result.rows[0];
}

async function createVerifier({ name, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO verifiers (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, hashedPassword]
  );
  return result.rows[0];
}

module.exports = { findByEmail, createVerifier };