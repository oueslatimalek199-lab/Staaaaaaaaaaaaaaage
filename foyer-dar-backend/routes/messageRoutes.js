const express = require("express");
const router = express.Router();
const { protege } = require("../middleware/authMiddleware");
const {
  envoyerMessage,
  obtenirConversations,
  obtenirMessagesAvec,
  compterNonLus,
} = require("../controllers/messageController");

router.post("/", protege, envoyerMessage);
router.get("/conversations", protege, obtenirConversations);
router.get("/non-lus/compte", protege, compterNonLus);
router.get("/:autreId", protege, obtenirMessagesAvec);

module.exports = router;
