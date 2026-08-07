const express = require("express");
const router = express.Router();
const { protege } = require("../middleware/authMiddleware");
const { creerSignalement } = require("../controllers/signalementController");

router.post("/", protege, creerSignalement);

module.exports = router;