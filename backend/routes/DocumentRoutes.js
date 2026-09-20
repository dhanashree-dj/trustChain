const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  listDocuments,
  uploadDocument,
  verifyDocument,
  verifyByHash,
  removeDocument,
} = require("../controllers/documentController");

router.get("/verify-hash/:hash", verifyByHash);
router.get("/:studentId", listDocuments);
router.post("/", upload.single("file"), uploadDocument);
router.post("/verify", upload.single("file"), verifyDocument);
router.delete("/:id", removeDocument);

module.exports = router;