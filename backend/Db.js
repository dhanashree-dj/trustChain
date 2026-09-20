const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "trustchain",
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error", err);
});

module.exports = pool;