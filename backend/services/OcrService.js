const path = require("path");
const fs = require("fs");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text || "";
    }

    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      const result = await Tesseract.recognize(filePath, "eng");
      return result.data.text || "";
    }

    return "";
  } catch (err) {
    console.error("OCR extraction failed:", err.message);
    return "";
  }
}

// Checks whether the student's name, student ID, and course all appear
// somewhere in the extracted text. Not a real AI model — a practical
// heuristic for a student project without needing a paid AI API.
function checkDocumentMatch(extractedText, student) {
  if (!extractedText) {
    return { status: "Unchecked", fields: {} };
  }

  const normalizedText = extractedText.toLowerCase().replace(/\s+/g, " ");

  const nameParts = (student.name || "").toLowerCase().split(" ").filter(Boolean);
  const nameFound = nameParts.length > 0 && nameParts.some((part) => normalizedText.includes(part));

  const studentIdCode = student.student_id || student.studentId || "";
  const idFound = studentIdCode
    ? normalizedText.includes(studentIdCode.toLowerCase())
    : false;

  const course = student.course || "";
  const courseFound = course
    ? normalizedText.includes(course.toLowerCase())
    : false;

  const fields = {
    name: nameFound,
    studentId: idFound,
    course: courseFound,
  };

  const matchCount = Object.values(fields).filter(Boolean).length;

  let status;
  if (matchCount === 3) {
    status = "Match";
  } else if (matchCount > 0) {
    status = "Partial Match";
  } else {
    status = "Mismatch";
  }

  return { status, fields };
}

// Checks if the document text mentions a DIFFERENT student already in
// the database — a sign the document may have been uploaded to the
// wrong profile.
function findOtherStudentMatches(extractedText, allStudents, currentStudentId) {
  if (!extractedText) return [];

  const normalizedText = extractedText.toLowerCase().replace(/\s+/g, " ");
  const matches = [];

  for (const other of allStudents) {
    if (String(other.id) === String(currentStudentId)) continue;

    const otherIdCode = (other.studentId || other.student_id || "").toLowerCase();
    const otherName = (other.name || "").toLowerCase();

    const idMatch = otherIdCode.length >= 3 && normalizedText.includes(otherIdCode);
    const nameMatch = otherName.length > 0 && normalizedText.includes(otherName);

    if (idMatch || nameMatch) {
      matches.push({
        id: other.id,
        name: other.name,
        studentId: otherIdCode,
        matchedBy: idMatch && nameMatch ? "name and ID" : idMatch ? "ID" : "name",
      });
    }
  }

  return matches;
}

// Looks for text that explicitly labels itself as an ID (e.g. "Student
// ID: 715", "Roll No: 42", "ID: 9001") and checks whether that number
// matches ANY student actually in the database (including the one this
// document is being uploaded for). If it matches no one, it's flagged
// as an unknown ID — a sign the document may not belong to anyone in
// this system at all.
//
// Only looks at explicitly-labeled ID fields (not every number in the
// document) to avoid false positives from dates, page numbers, or
// phone numbers.
function checkIdsAgainstDatabase(extractedText, allStudents, currentStudentId) {
  if (!extractedText) return { foundIds: [], unknownIds: [] };

  const idLabelPattern = /(?:student\s*id|roll\s*no\.?|id\s*no\.?|enrollment\s*no\.?|\bid\b)\s*[:\-]?\s*(\d{2,10})/gi;

  const knownIds = new Set(
    allStudents.map((s) => (s.studentId || s.student_id || "").toLowerCase())
  );

  const foundIds = [];
  const unknownIds = [];

  let match;
  while ((match = idLabelPattern.exec(extractedText)) !== null) {
    const candidate = match[1];
    if (!foundIds.includes(candidate)) {
      foundIds.push(candidate);
      if (!knownIds.has(candidate.toLowerCase())) {
        unknownIds.push(candidate);
      }
    }
  }

  return { foundIds, unknownIds };
}

module.exports = {
  extractTextFromFile,
  checkDocumentMatch,
  findOtherStudentMatches,
  checkIdsAgainstDatabase,
};