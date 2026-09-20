const express = require("express");
const router = express.Router();
const { getStudents, addStudent, removeStudent } = require("../controllers/studentController");

router.get("/", getStudents);
router.post("/", addStudent);
router.delete("/:id", removeStudent);

module.exports = router;