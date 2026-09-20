const {
  getAllStudents,
  findByEmailOrStudentId,
  createStudent,
  deleteStudent,
  findById,
} = require("../models/studentModel");

async function getStudents(req, res) {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students", error: err.message });
  }
}

async function addStudent(req, res) {
  try {
    const { name, email, studentId, course, password } = req.body;

    if (!name || !email || !studentId || !course || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await findByEmailOrStudentId(email, studentId);
    if (existing) {
      return res.status(409).json({ message: "Student with this email or ID already exists" });
    }

    const student = await createStudent({ name, email, studentId, course, password });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to add student", error: err.message });
  }
}

async function removeStudent(req, res) {
  try {
    const { id } = req.params;

    const existing = await findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Student not found" });
    }

    await deleteStudent(id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete student", error: err.message });
  }
}

module.exports = { getStudents, addStudent, removeStudent };