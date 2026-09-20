const express = require("express");
const router = express.Router();
const { login, registerVerifier } = require("../controllers/authController");

router.post("/login", login);
router.post("/register-verifier", registerVerifier);

module.exports = router;